import { app } from "./app.js";
import { connectDB } from "./db.js";
import { env } from "./config/env.js";

async function main(): Promise<void> {
  try {
    await connectDB();
  } catch {
    console.warn("Starting server without Mongo connection for setup/health checks.");
  }

  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
