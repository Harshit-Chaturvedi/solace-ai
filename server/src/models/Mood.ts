import mongoose, { Document, Schema } from "mongoose";

export type MoodType = "great" | "good" | "okay" | "low" | "awful";

export interface IMood extends Document {
  userId: mongoose.Types.ObjectId;
  mood: MoodType;
  score: number;
  emotions: string[];
  note?: string;
  solReply?: string;
  source: "checkin" | "chat";
  createdAt: Date;
  updatedAt: Date;
}

export const moodScoreMap: Record<MoodType, number> = {
  awful: 1,
  low: 2,
  okay: 3,
  good: 4,
  great: 5,
};

const moodSchema = new Schema<IMood>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mood: {
      type: String,
      enum: ["great", "good", "okay", "low", "awful"],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    emotions: {
      type: [String],
      default: [],
    },
    note: {
      type: String,
      trim: true,
    },
    solReply: {
      type: String,
    },
    source: {
      type: String,
      enum: ["checkin", "chat"],
      default: "checkin",
    },
  },
  {
    timestamps: true,
  },
);

moodSchema.index({ userId: 1, createdAt: -1 });

export const Mood = mongoose.model<IMood>("Mood", moodSchema);
