import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  lastMessageAt: Date;
  summary?: string;
  detectedMood?: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Conversation",
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    summary: {
      type: String,
    },
    detectedMood: {
      type: String,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ userId: 1, lastMessageAt: -1 });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
