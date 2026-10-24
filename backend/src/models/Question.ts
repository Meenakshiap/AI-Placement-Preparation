import mongoose, { Schema, Document } from 'mongoose';
import { IQuestion } from '../types/index.js';

export interface IQuestionDocument extends Omit<IQuestion, 'id'>, Document {}

const QuestionSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['diagnostic', 'aptitude', 'language_quiz', 'coding', 'interview_q'], 
      required: true 
    },
    category: { 
      type: String, 
      enum: ['Quantitative', 'Logical', 'Verbal', 'Data Interpretation', 'Python', 'Java', 'C++', 'JavaScript', 'DSA', 'CoreCS', 'SystemDesign', 'HR'],
      required: true 
    },
    subTopic: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    description: { type: String, required: true },
    options: { type: [String] },
    correctAnswer: { type: String },
    explanation: { type: String },
    hints: { type: [String], default: [] },
    companiesTagged: { type: [String], default: [] },
    codeTemplates: [{
      language: { type: String, enum: ['python', 'javascript', 'java', 'cpp'] },
      starterCode: { type: String },
      solution: { type: String }
    }],
    testCases: [{
      input: { type: String },
      expectedOutput: { type: String },
      isHidden: { type: Boolean, default: false }
    }]
  },
  { timestamps: true }
);

export const QuestionModel = mongoose.models.Question || mongoose.model<IQuestionDocument>('Question', QuestionSchema);
