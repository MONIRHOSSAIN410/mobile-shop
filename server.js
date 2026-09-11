import "dotenv/config";

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";

async function bootstrap() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(
      `\n  🚀  API ready on http://localhost:${env.PORT}  (${env.NODE_ENV})\n`
    );
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received — closing server…`);
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    server.close(() => process.exit(1));
  });
}

bootstrap().catch((error) => {
  if (error?.isConnectionError) console.error(error.message);
  else console.error("Failed to start server:", error);
  process.exit(1);
});
