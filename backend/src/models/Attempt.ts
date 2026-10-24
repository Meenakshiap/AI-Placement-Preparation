import mongoose, { Schema, Document } from 'mongoose';
import { IAttempt } from '../types/index.js';

export interface IAttemptDocument extends Omit<IAttempt, 'id'>, Document {}

const AttemptSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    module: { 
      type: String, 
      enum: ['diagnostic', 'language', 'coding', 'aptitude', 'interview'], 
      required: true 
    },
    userSubmission: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    scoreAwarded: { type: Number, default: 0 },
    testCasesPassed: { type: Number },
    totalTestCases: { type: Number },
    executionTimeMs: { type: Number },
    timeSpentSeconds: { type: Number, default: 0 },
    feedback: { type: String }
  },
  { timestamps: true }
);

export const AttemptModel = mongoose.models.Attempt || mongoose.model<IAttemptDocument>('Attempt', AttemptSchema);
