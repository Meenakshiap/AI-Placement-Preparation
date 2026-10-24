import mongoose, { Document, Schema } from 'mongoose';
import { ITrackProgress } from '../types/index.js';

export interface ITrackProgressDocument extends Omit<ITrackProgress, 'id'>, Document {}

const TrackProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trackId: { type: String, enum: ['python', 'java', 'cpp', 'javascript'], required: true },
    currentModuleId: { type: String, required: true },
    completedModuleIds: { type: [String], default: [] },
    quizAttempts: { type: [Schema.Types.Mixed], default: [] },
    mistakes: { type: [Schema.Types.Mixed], default: [] },
    startedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

TrackProgressSchema.index({ userId: 1, trackId: 1 }, { unique: true });

export const TrackProgressModel = mongoose.models.TrackProgress || mongoose.model<ITrackProgressDocument>('TrackProgress', TrackProgressSchema);