import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("4000").transform((val) => parseInt(val, 10)),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
    GEMINI_MODEL: z.string().default("gemini-3.5-flash-lite"),
    CORS_ORIGIN: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === "production") {
        return (
          data.JWT_SECRET &&
          data.JWT_SECRET !== "development-jwt-secret-key-change-in-production"
        );
      }
      return true;
    },
    {
      message: "JWT_SECRET must be explicitly set with a secure key in production",
      path: ["JWT_SECRET"],
    },
  );

export const env = envSchema.parse(process.env);
