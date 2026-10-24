import mongoose, { Schema, Document } from 'mongoose';
import { IActivityLog } from '../types/index.js';

export interface IActivityLogDocument extends Omit<IActivityLog, 'id'>, Document {}

const ActivityLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    category: {
      type: String,
      enum: ['programming', 'aptitude'],
      required: true
    },
    solvedCount: { type: Number, default: 0, min: 0 },
    attemptedCount: { type: Number, default: 0, min: 0 },
    difficulty: {
      easy: { type: Number, default: 0, min: 0 },
      medium: { type: Number, default: 0, min: 0 },
      hard: { type: Number, default: 0, min: 0 }
    }
  },
  { timestamps: true }
);

ActivityLogSchema.index({ userId: 1, date: 1, category: 1 }, { unique: true });

export const ActivityLogModel =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLogDocument>('ActivityLog', ActivityLogSchema);
