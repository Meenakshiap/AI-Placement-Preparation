import mongoose, { Schema, Document } from 'mongoose';
import { ISkillProfile } from '../types/index.js';

export interface ISkillProfileDocument extends Omit<ISkillProfile, 'id'>, Document {}

const TopicMasterySchema = new Schema({
  topic: { type: String, required: true },
  category: { type: String, required: true },
  score: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  lastPracticed: { type: Date, default: Date.now }
});

const SkillProfileSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    overallReadinessScore: { type: Number, default: 0 },
    assessmentCompleted: { type: Boolean, default: false },
    categories: {
      aptitude: { type: Number, default: 0 },
      languages: { type: Number, default: 0 },
      dsa: { type: Number, default: 0 },
      coreCs: { type: Number, default: 0 },
      interview: { type: Number, default: 0 }
    },
    topicBreakdown: [TopicMasterySchema],
    strongTopics: { type: [String], default: [] },
    weakTopics: { type: [String], default: [] },
    targetCompanyFit: {
      score: { type: Number, default: 0 },
      matchLevel: { type: String, enum: ['High', 'Moderate', 'Needs Work'], default: 'Needs Work' },
      missingCompetencies: { type: [String], default: [] },
      readinessTier: { type: String, enum: ['Tier 1 Ready', 'Tier 2 Ready', 'Foundational'], default: 'Foundational' }
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const SkillProfileModel = mongoose.models.SkillProfile || mongoose.model<ISkillProfileDocument>('SkillProfile', SkillProfileSchema);
