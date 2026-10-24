import mongoose, { Schema, Document } from 'mongoose';
import { IInterviewSession } from '../types/index.js';

export interface IInterviewSessionDocument extends Omit<IInterviewSession, 'id'>, Document {}

const ExchangeSchema = new Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  category: { type: String, required: true },
  userTranscript: { type: String, default: '' },
  durationSec: { type: Number, default: 0 },
  evaluation: {
    technicalAccuracy: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    feedbackSummary: { type: String, default: '' },
    sampleIdealResponse: { type: String, default: '' }
  },
  timestamp: { type: Date, default: Date.now }
});

const InterviewSessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetCompany: { type: String, required: true },
    targetRole: { type: String, required: true },
    sessionType: { type: String, enum: ['technical', 'hr', 'mixed', 'system_design'], default: 'mixed' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    exchanges: [ExchangeSchema],
    overallEvaluation: {
      overallScore: { type: Number },
      technicalRating: { type: Number },
      communicationRating: { type: Number },
      confidenceRating: { type: Number },
      summary: { type: String },
      keyRecommendations: { type: [String], default: [] }
    },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export const InterviewSessionModel = mongoose.models.InterviewSession || mongoose.model<IInterviewSessionDocument>('InterviewSession', InterviewSessionSchema);
