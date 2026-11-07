import type { Request } from "express";
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many authentication requests, please try again in 15 minutes",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req: Request) =>
    (req as Request & { userId?: string }).userId || req.ip || "unknown",
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many messages sent. Please slow down.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
