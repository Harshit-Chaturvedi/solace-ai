import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'checkin' | 'breathe' | 'affirmation' | 'reflection';
  title: string;
  body: string;
  time: string; // "HH:MM"
  days: number[]; // 0-6 (Sun-Sat)
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['checkin', 'breathe', 'affirmation', 'reflection'],
      default: 'checkin',
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    days: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({ userId: 1, enabled: 1 });

export const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema);
