import mongoose from "mongoose";
import { env } from "./config/env.js";

let retryInterval: NodeJS.Timeout | null = null;
let isConnecting = false;

export async function connectDB(): Promise<void> {
  if (isConnecting) return;
  isConnecting = true;

  const attempt = async () => {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log("Mongo connected");
      if (retryInterval) {
        clearInterval(retryInterval);
        retryInterval = null;
      }
    } catch (err) {
      const e = err as Error;
      console.error(`MongoDB connection error: [${e.name}] ${e.message}`);
      if (!retryInterval) {
        retryInterval = setInterval(attempt, 5000);
      }
    } finally {
      isConnecting = false;
    }
  };

  await attempt();
}
