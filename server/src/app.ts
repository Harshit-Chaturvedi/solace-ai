import "express-async-errors";
import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { homeRouter } from "./routes/home.js";
import { moodRouter } from "./routes/mood.js";
import { chatRouter } from "./routes/chat.js";
import { memoriesRouter } from "./routes/memories.js";
import { activitiesRouter } from "./routes/activities.js";
import { affirmationsRouter } from "./routes/affirmations.js";
import { remindersRouter } from "./routes/reminders.js";
import { insightsRouter } from "./routes/insights.js";
import { errorHandler } from "./middleware/error.js";

export const app = express();

app.use(helmet());
app.use(cors(env.CORS_ORIGIN ? { origin: env.CORS_ORIGIN } : undefined));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/v1/health", (_req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    ok: true,
    db: isDbConnected ? "connected" : "disconnected",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/me", meRouter);
app.use("/api/v1/home", homeRouter);
app.use("/api/v1/moods", moodRouter);
app.use("/api/v1/conversations", chatRouter);
app.use("/api/v1/memories", memoriesRouter);
app.use("/api/v1/activities", activitiesRouter);
app.use("/api/v1/affirmations", affirmationsRouter);
app.use("/api/v1/reminders", remindersRouter);
app.use("/api/v1/insights", insightsRouter);

app.use(errorHandler);
