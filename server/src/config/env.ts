import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000").transform((val) => parseInt(val, 10)),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/solace"),
  JWT_SECRET: z.string().default("development-jwt-secret-key-change-in-production"),
  GEMINI_API_KEY: z.string().default(""),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  CORS_ORIGIN: z.string().default("*"),
});

export const env = envSchema.parse(process.env);
