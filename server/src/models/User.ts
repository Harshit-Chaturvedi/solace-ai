import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  avatarColor: string;
  goals: string[];
  companionTone: "gentle" | "cheerful" | "direct";
  checkinTime: string;
  timezone: string;
  memoryEnabled: boolean;
  onboardingDone: boolean;
  expoPushToken?: string;
  streak: {
    current: number;
    longest: number;
    lastActiveDate: Date | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarColor: {
      type: String,
      default: "#7C6FD6",
    },
    goals: {
      type: [String],
      default: [],
    },
    companionTone: {
      type: String,
      enum: ["gentle", "cheerful", "direct"],
      default: "gentle",
    },
    checkinTime: {
      type: String,
      default: "09:00",
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    memoryEnabled: {
      type: Boolean,
      default: true,
    },
    onboardingDone: {
      type: Boolean,
      default: false,
    },
    expoPushToken: {
      type: String,
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).passwordHash;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
