import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/index.js';

export interface IUserDocument extends Omit<IUser, 'id'>, Document {}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    targetCompany: { type: String, default: 'Google' },
    targetRole: { type: String, default: 'Software Development Engineer (SDE-1)' },
    preferredTechStack: { type: [String], default: ['Python', 'JavaScript'] },
    experienceLevel: { type: String, enum: ['Fresher', '1-2 Years', 'Final Year', 'Pre-final Year'], default: 'Final Year' },
    graduationYear: { type: Number, default: 2026 },
    college: { type: String, default: 'Engineering Institute' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
