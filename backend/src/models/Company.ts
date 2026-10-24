import mongoose, { Schema, Document } from 'mongoose';
import { ICompanyBlueprint } from '../types/index.js';

export interface ICompanyDocument extends Omit<ICompanyBlueprint, 'id'>, Document {}

const HiringRoundSchema = new Schema({
  roundNumber: { type: Number, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Online Assessment', 'Technical Round 1', 'Technical Round 2', 'Managerial / HR'], 
    required: true 
  },
  description: { type: String, required: true },
  keyTopics: { type: [String], default: [] },
  tips: { type: [String], default: [] }
});

const CompanySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    logo: { type: String },
    tier: { type: String, enum: ['Dream', 'Super Dream', 'Service/Mass', 'Core Tech'], default: 'Dream' },
    description: { type: String, required: true },
    targetRoles: { type: [String], default: [] },
    hiringRounds: [HiringRoundSchema],
    skillWeightage: {
      aptitude: { type: Number, default: 20 },
      dsa: { type: Number, default: 35 },
      languages: { type: Number, default: 15 },
      coreCs: { type: Number, default: 15 },
      interview: { type: Number, default: 15 }
    },
    frequentlyAskedTopics: { type: [String], default: [] },
    difficultyLevel: { type: String, enum: ['Moderate', 'Hard', 'Extreme'], default: 'Hard' }
  },
  { timestamps: true }
);

export const CompanyModel = mongoose.models.Company || mongoose.model<ICompanyDocument>('Company', CompanySchema);
