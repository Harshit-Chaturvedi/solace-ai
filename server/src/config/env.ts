import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("4000").transform((val) => parseInt(val, 10)),
    MONGODB_URI: z.string().default("mongodb://localhost:27017/solace"),
    JWT_SECRET: z.string().default("development-jwt-secret-key-change-in-production"),
    GEMINI_API_KEY: z.string().default(""),
    GEMINI_MODEL: z.string().default("gemini-3.5-flash-lite"),
    CORS_ORIGIN: z.string().default("*"),
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
      message: "JWT_SECRET must be explicitly set in production",
      path: ["JWT_SECRET"],
    },
  );

export const env = envSchema.parse(process.env);
