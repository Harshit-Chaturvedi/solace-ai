import { app } from "./app.js";
import { connectDB } from "./db.js";
import { env } from "./config/env.js";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${env.PORT}`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Connect to MongoDB in background without blocking port binding or /ping
connectDB().catch((err) => {
  console.warn("Background Mongo connection attempt failed:", err);
});
