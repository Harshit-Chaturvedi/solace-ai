import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'breathing' | 'affirmation' | 'journal' | 'meditation';
  durationSeconds: number;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['breathing', 'affirmation', 'journal', 'meditation'],
      required: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
