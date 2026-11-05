import mongoose, { Document, Schema } from "mongoose";

export interface IMessageSuggestion {
  type: "breathing" | "journal" | "affirmation" | "checkin" | "selfcare" | string;
  title: string;
  params?: Record<string, unknown>;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  mood?: string;
  suggestion?: IMessageSuggestion | null;
  flagged?: "crisis" | null;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    mood: {
      type: String,
    },
    suggestion: {
      type: Schema.Types.Mixed,
      default: null,
    },
    flagged: {
      type: String,
      enum: ["crisis", null],
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
