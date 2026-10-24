import mongoose, { Document, Schema } from 'mongoose';
import { ICodingAttempt } from '../types/index.js';

export interface ICodingAttemptDocument extends Omit<ICodingAttempt, 'id'>, Document {}

const CodingAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: String, required: true, index: true },
    language: { type: String, enum: ['python', 'java', 'cpp', 'javascript'], required: true },
    source: { type: String, required: true, maxlength: 20000 },
    isCorrect: { type: Boolean, required: true },
    testCasesPassed: { type: Number, required: true },
    totalTestCases: { type: Number, required: true },
    executionTimeMs: { type: Number, required: true },
    feedback: { type: String, required: true }
  },
  { timestamps: true }
);

CodingAttemptSchema.index({ userId: 1, problemId: 1, isCorrect: 1 });

export const CodingAttemptModel = mongoose.models.CodingAttempt || mongoose.model<ICodingAttemptDocument>('CodingAttempt', CodingAttemptSchema);