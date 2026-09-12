import dns from "node:dns";
import net from "node:net";
import { Resolver } from "node:dns/promises";

import mongoose from "mongoose";

import { env } from "./env.js";

/**
 * Windows + a home router/ISP resolver is the classic reason an Atlas
 * `mongodb+srv://` URI fails while the very same cluster opens fine in Compass:
 * the driver has to look up a DNS **SRV** record, and plenty of local resolvers
 * either drop SRV queries or answer them over IPv6 only. Asking for IPv4 first
 * and keeping a public-resolver fallback in our back pocket removes that whole
 * class of failure.
 */
dns.setDefaultResultOrder("ipv4first");

const PUBLIC_DNS = (env.DNS_SERVERS?.length ? env.DNS_SERVERS : ["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

// Cached across serverless invocations (Vercel/Lambda re-uses the module scope)
let cached = globalThis.__mongooseConn;
if (!cached) {
  cached = globalThis.__mongooseConn = { conn: null, promise: null };
}

export function redactUri(uri = "") {
  return uri.replace(/\/\/([^:@/]+):([^@]*)@/, "//$1:****@");
}

export function dbStatus() {
  const map = ["disconnected", "connected", "connecting", "disconnecting"];
  return {
    state: map[mongoose.connection.readyState] ?? "unknown",
    readyState: mongoose.connection.readyState,
    name: mongoose.connection.name ?? null,
    host: mongoose.connection.host ?? null,
  };
}

export function isConnected() {
  return mongoose.connection.readyState === 1;
}

const DNS_ERROR = /(querySrv|queryTxt|ENOTFOUND|ETIMEOUT|ETIMEDOUT|EAI_AGAIN|ESERVFAIL|ENODATA|getaddrinfo)/i;

/**
 * Do by hand what the driver does for `mongodb+srv://`, but through a resolver
 * we choose: look up the SRV records for the shard hosts and the TXT record
 * that carries `replicaSet` / `authSource`, then hand back a plain
 * `mongodb://host1,host2,host3/db?...` URI that needs no SRV support at all.
 */
export async function expandSrvUri(uri, servers = PUBLIC_DNS) {
  const match = /^mongodb\+srv:\/\/(?:([^@/]*)@)?([^/?]+)(\/[^?]*)?(\?.*)?$/.exec(uri);
  if (!match) return null;

  const [, credentials, host, pathname = "/", search = ""] = match;

  const resolver = new Resolver();
  resolver.setServers(servers);

  const srv = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
  if (!srv.length) throw new Error(`No SRV records found for ${host}`);
  const hosts = srv.map((record) => `${record.name}:${record.port}`).join(",");

  const params = new URLSearchParams(search.replace(/^\?/, ""));
  try {
    const txt = await resolver.resolveTxt(host);
    for (const [key, value] of new URLSearchParams(txt.flat().join("&"))) {
      if (!params.has(key)) params.set(key, value);
    }
  } catch {
    /* TXT is optional — replicaSet just gets discovered from the seed list */
  }

  if (!params.has("ssl") && !params.has("tls")) params.set("tls", "true");
  if (!params.has("authSource")) params.set("authSource", "admin");
  if (!params.has("retryWrites")) params.set("retryWrites", "true");

  return `mongodb://${credentials ? `${credentials}@` : ""}${hosts}${pathname}?${params}`;
}

/** Quick TCP probe — tells a blocked port apart from a DNS or auth problem. */
export function probeHost(host, port = 27017, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (ok, error) => {
      socket.destroy();
      resolve({ host, port, ok, error });
    };
    socket.setTimeout(timeout);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false, "timed out"));
    socket.once("error", (error) => done(false, error.message));
  });
}

const CONNECT_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: env.DB_TIMEOUT_MS,
  connectTimeoutMS: env.DB_TIMEOUT_MS,
  family: 4,
};

async function connectOnce() {
  const uri = env.MONGODB_URI;

  try {
    return await mongoose.connect(uri, CONNECT_OPTIONS);
  } catch (error) {
    // Only an SRV/DNS failure is worth a second attempt through public DNS.
    if (!uri.startsWith("mongodb+srv://") || !DNS_ERROR.test(String(error.message))) {
      throw error;
    }

    console.warn(
      `  ⚠️   SRV lookup failed through this machine's DNS (${error.message.split("\n")[0]})` +
        `\n      retrying through ${PUBLIC_DNS.join(", ")}…`
    );

    const direct = await expandSrvUri(uri);
    if (!direct) throw error;
    const connection = await mongoose.connect(direct, CONNECT_OPTIONS);
    console.log("  ↳  connected using the public-DNS fallback");
    return connection;
  }
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  mongoose.set("strictQuery", true);
  // Fail fast instead of parking a query for 10s when the DB is not up yet.
  mongoose.set("bufferCommands", false);

  if (!cached.promise) {
    cached.promise = connectOnce()
      .then((m) => {
        console.log(`  ✅  MongoDB connected → ${m.connection.name} @ ${m.connection.host}`);
        return m.connection;
      })
      .catch((error) => {
        // Let the next attempt try again instead of caching the failure.
        cached.promise = null;
        throw describeConnectionFailure(error);
      });
  }

  cached.conn = await cached.promise;

  mongoose.connection.on("disconnected", () => {
    console.warn("  ⚠️   MongoDB disconnected — the driver will keep retrying.");
    cached.conn = null;
    cached.promise = null;
  });

  return cached.conn;
}

/**
 * Mongoose's own message ("MongooseServerSelectionError: connect ECONNREFUSED")
 * says almost nothing useful, so translate the common causes.
 */
function describeConnectionFailure(error) {
  const uri = env.MONGODB_URI;
  const isLocal = /(localhost|127\.0\.0\.1)/.test(uri);
  const raw = String(error?.message ?? error);

  let hints;

  if (isLocal) {
    hints = [
      "MongoDB does not seem to be running on this machine.",
      "  • Windows: open Services and start “MongoDB Server”, or run  net start MongoDB",
      "  • Or install it: https://www.mongodb.com/try/download/community",
      "  • MongoDB Compass connecting to the same URI is a quick way to confirm.",
    ];
  } else if (/bad auth|Authentication failed|AuthenticationFailed/i.test(raw)) {
    hints = [
      "Atlas rejected the username or password.",
      "  • Atlas → Database Access → edit the user → Edit Password.",
      "  • A password with @ : / ? # [ ] % must be percent-encoded in the URI",
      "    (@ → %40, # → %23, / → %2F …).",
    ];
  } else if (DNS_ERROR.test(raw)) {
    hints = [
      "The cluster hostname could not be resolved (DNS/SRV lookup failed).",
      "  • Change this PC's DNS to 8.8.8.8 / 1.1.1.1, or",
      "  • Use the non-SRV string: Atlas → Connect → Drivers → “Node.js 2.2.12",
      "    or later” which gives a plain mongodb://…shard-00-00,…  URI.",
      "  • A VPN, a public Wi-Fi captive portal or an office firewall can also",
      "    block SRV records.",
    ];
  } else {
    hints = [
      "Could not reach your MongoDB Atlas cluster.",
      "  • Atlas → Network Access → Add IP Address → “Allow access from anywhere”",
      "    (0.0.0.0/0) while you are developing. This is the #1 cause.",
      "  • Check the username and password in MONGODB_URI.",
      "  • Port 27017 may be blocked by your firewall, office network or ISP.",
    ];
  }

  const message = [
    "",
    `  ❌  Cannot connect to MongoDB at ${redactUri(uri)}`,
    "",
    ...hints,
    "",
    "  Run  npm run db:check  inside backend/ for a full diagnosis.",
    "",
    `  Original error: ${raw.split("\n")[0]}`,
    "",
  ].join("\n");

  const wrapped = new Error(message);
  wrapped.cause = error;
  wrapped.isConnectionError = true;
  return wrapped;
}

export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
