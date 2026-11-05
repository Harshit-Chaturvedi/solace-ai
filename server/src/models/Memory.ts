import mongoose, { Document, Schema } from "mongoose";

export type MemoryCategory =
  | "life_event"
  | "preference"
  | "struggle"
  | "goal"
  | "person";

export interface IMemory extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  category: MemoryCategory;
  sourceConversationId?: mongoose.Types.ObjectId;
  importance: number;
  createdAt: Date;
  updatedAt: Date;
}

const memorySchema = new Schema<IMemory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["life_event", "preference", "struggle", "goal", "person"],
      required: true,
    },
    sourceConversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
    importance: {
      type: Number,
      min: 1,
      max: 3,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

memorySchema.index({ userId: 1, importance: -1, createdAt: -1 });

export const Memory = mongoose.model<IMemory>("Memory", memorySchema);
