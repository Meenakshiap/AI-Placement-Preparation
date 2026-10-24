import mongoose, { Schema, Document } from 'mongoose';
import { IRecommendation } from '../types/index.js';

export interface IRecommendationDocument extends Omit<IRecommendation, 'id'>, Document {}

const DailyMissionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  module: { 
    type: String, 
    enum: ['diagnostic', 'language', 'coding', 'aptitude', 'interview', 'company'], 
    required: true 
  },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  reason: { type: String, required: true },
  estimatedMinutes: { type: Number, default: 15 },
  actionUrl: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  topic: { type: String, required: true }
});

const RoadmapStageSchema = new Schema({
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  focusArea: { type: String, required: true },
  milestones: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['completed', 'in_progress', 'upcoming'], default: 'upcoming' }
});

const RecommendationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dailyMissions: [DailyMissionSchema],
    roadmap: [RoadmapStageSchema],
    summaryInsight: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const RecommendationModel = mongoose.models.Recommendation || mongoose.model<IRecommendationDocument>('Recommendation', RecommendationSchema);
