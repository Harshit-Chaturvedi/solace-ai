import mongoose from "mongoose";
import { env } from "./config/env.js";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Mongo connected");
  } catch (err) {
    console.error("Mongo connection error:", err);
    throw err;
  }
}
