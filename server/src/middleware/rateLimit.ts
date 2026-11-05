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
