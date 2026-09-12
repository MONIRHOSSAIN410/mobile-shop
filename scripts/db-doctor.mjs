/**
 * MongoDB connection doctor.
 *
 *   cd backend
 *   npm run db:check
 *
 * Works through the same steps the driver does — DNS, TCP, handshake, auth —
 * and stops at the first one that breaks, so you get the actual cause instead
 * of "MongooseServerSelectionError".
 */
import "dotenv/config";

import dns from "node:dns";
import net from "node:net";
import { Resolver } from "node:dns/promises";

import mongoose from "mongoose";

dns.setDefaultResultOrder("ipv4first");

const RAW_URI = (process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/mobile-shop").replace(
  /^["']|["']$/g,
  ""
);
const PUBLIC_DNS = ["8.8.8.8", "1.1.1.1"];
const TIMEOUT = Number(process.env.DB_TIMEOUT_MS ?? 15_000);

const pass = (m) => console.log(`  [ OK ]  ${m}`);
const fail = (m) => console.log(`  [FAIL]  ${m}`);
const warn = (m) => console.log(`  [WARN]  ${m}`);
const info = (m) => console.log(`          ${m}`);
const title = (m) => console.log(`\n${m}\n${"-".repeat(m.length)}`);

const redact = (uri) => uri.replace(/\/\/([^:@/]+):([^@]*)@/, "//$1:****@");

function parseSrv(uri) {
  const m = /^mongodb\+srv:\/\/(?:([^@/]*)@)?([^/?]+)(\/[^?]*)?(\?.*)?$/.exec(uri);
  return m ? { credentials: m[1], host: m[2], pathname: m[3] ?? "/", search: m[4] ?? "" } : null;
}

function probe(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (ok, error) => {
      socket.destroy();
      resolve({ ok, error });
    };
    socket.setTimeout(8000);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false, "timed out (port blocked by firewall/ISP?)"));
    socket.once("error", (e) => done(false, e.message));
  });
}

async function resolveWith(servers, host) {
  const resolver = new Resolver();
  if (servers) resolver.setServers(servers);
  const srv = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
  let txt = [];
  try {
    txt = (await resolver.resolveTxt(host)).flat();
  } catch {
    /* optional */
  }
  return { srv, txt };
}

console.log("\n=========  MongoDB connection doctor  =========");
title("1. Connection string");
info(redact(RAW_URI));

const srvInfo = parseSrv(RAW_URI);
const isLocal = /(localhost|127\.0\.0\.1)/.test(RAW_URI);
const dbName = (srvInfo?.pathname ?? new URL(RAW_URI.replace("mongodb://", "http://")).pathname ?? "/")
  .replace(/^\//, "")
  .split("?")[0];

if (!/^mongodb(\+srv)?:\/\//.test(RAW_URI)) {
  fail("MONGODB_URI does not start with mongodb:// or mongodb+srv://");
  process.exit(1);
}
pass(srvInfo ? "Atlas SRV style URI" : isLocal ? "local MongoDB URI" : "standard MongoDB URI");
if (!dbName) warn("No database name in the URI — add one, e.g. .../mobile?retryWrites=true");
else info(`database: ${dbName}`);

if (srvInfo?.credentials && /[@:/?#[\]%]/.test(decodeURIComponent(srvInfo.credentials.split(":")[1] ?? ""))) {
  warn("The password contains characters that must be percent-encoded (@ -> %40, # -> %23, / -> %2F).");
}

title("2. Your public IP (Atlas → Network Access must allow it)");
try {
  const controller = AbortSignal.timeout(6000);
  const ip = (await (await fetch("https://api.ipify.org", { signal: controller })).text()).trim();
  if (/^[0-9a-f.:]{7,45}$/i.test(ip)) {
    pass(`this machine appears to Atlas as ${ip}`);
    info("If Atlas → Network Access does not list this IP (or 0.0.0.0/0), nothing else will work.");
  } else {
    warn("The public-IP lookup was intercepted — check your IP at https://whatismyipaddress.com");
  }
} catch {
  warn("Could not look up the public IP (no internet, or the lookup was blocked).");
}

let hosts = [];

if (srvInfo) {
  title("3. DNS — SRV lookup");
  let resolved = null;
  try {
    resolved = await resolveWith(null, srvInfo.host);
    pass(`this machine's DNS resolved ${srvInfo.host}`);
  } catch (error) {
    fail(`this machine's DNS could NOT resolve _mongodb._tcp.${srvInfo.host} — ${error.message}`);
    info("This is the classic Windows/ISP problem: SRV records get dropped.");
    try {
      resolved = await resolveWith(PUBLIC_DNS, srvInfo.host);
      pass(`but ${PUBLIC_DNS.join(" / ")} resolved it fine`);
      info("Fix: set this PC's DNS to 8.8.8.8 / 1.1.1.1, or keep using the");
      info("automatic fallback that src/config/db.js now performs.");
    } catch (e2) {
      fail(`public DNS also failed — ${e2.message}`);
      info("Check the cluster hostname in MONGODB_URI, or your VPN/firewall.");
    }
  }
  if (resolved) {
    hosts = resolved.srv.map((r) => ({ host: r.name, port: r.port }));
    for (const h of hosts) info(`shard: ${h.host}:${h.port}`);
    for (const t of resolved.txt) info(`options: ${t}`);
  }
} else {
  const m = /^mongodb:\/\/(?:[^@]*@)?([^/?]+)/.exec(RAW_URI);
  hosts = (m?.[1] ?? "").split(",").map((pair) => {
    const [host, port = "27017"] = pair.split(":");
    return { host, port: Number(port) };
  });
  title("3. DNS — not needed for a standard URI");
  for (const h of hosts) info(`host: ${h.host}:${h.port}`);
}

if (hosts.length) {
  title("4. TCP — can we open port 27017?");
  for (const h of hosts) {
    const result = await probe(h.host, h.port);
    if (result.ok) pass(`${h.host}:${h.port} reachable`);
    else fail(`${h.host}:${h.port} — ${result.error}`);
  }
  info("All FAIL here usually means: IP not whitelisted in Atlas, or your");
  info("network blocks outbound 27017 (common on office/university Wi-Fi).");
}

title("5. Handshake + authentication");
try {
  await mongoose.connect(RAW_URI, {
    serverSelectionTimeoutMS: TIMEOUT,
    connectTimeoutMS: TIMEOUT,
    family: 4,
  });
  pass(`connected to "${mongoose.connection.name}" on ${mongoose.connection.host}`);

  const collections = await mongoose.connection.db.listCollections().toArray();
  if (!collections.length) {
    warn("The database is empty — run  npm run seed  to load the demo catalogue.");
  } else {
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      info(`${c.name.padEnd(14)} ${count} documents`);
    }
    const products = collections.find((c) => c.name === "products");
    if (products) {
      const count = await mongoose.connection.db.collection("products").countDocuments();
      if (count === 0) warn("products is empty — run  npm run seed");
    } else {
      warn("No products collection yet — run  npm run seed");
    }
  }

  console.log("\n  RESULT: MongoDB is fine. If the storefront still says");
  console.log("  “Cannot reach the API”, the API process is not running —");
  console.log("  start it with:  cd backend && npm run dev\n");
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  const raw = String(error.message);
  fail(raw.split("\n")[0]);
  console.log("");
  if (/bad auth|Authentication failed/i.test(raw)) {
    info("=> Wrong username or password.");
    info("   Atlas → Database Access → edit the user → Edit Password,");
    info("   then paste the new password into MONGODB_URI (percent-encode specials).");
  } else if (/ENOTFOUND|querySrv|EAI_AGAIN|ESERVFAIL/i.test(raw)) {
    info("=> DNS problem. Change this PC's DNS to 8.8.8.8 / 1.1.1.1, or use the");
    info("   non-SRV connection string from Atlas → Connect → Drivers.");
  } else if (/ECONNREFUSED/i.test(raw)) {
    info("=> Nothing is listening. For a local URI start the MongoDB service:");
    info("   net start MongoDB");
  } else {
    info("=> Almost always the IP whitelist:");
    info("   Atlas → Network Access → Add IP Address → Allow access from anywhere (0.0.0.0/0)");
    info("   Wait ~1 minute for the change to go live, then run this again.");
  }
  console.log("");
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
}
