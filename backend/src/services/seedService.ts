import { jsonStore } from '../store/jsonStore.js';
import { isMongoActive } from '../config/db.js';
import { QuestionModel, CompanyModel } from '../models/index.js';
import { SEED_QUESTIONS } from '../data/seedQuestions.js';
import { SEED_COMPANIES } from '../data/seedCompanies.js';

export const seedDatabaseIfEmpty = async (): Promise<void> => {
  try {
    if (isMongoActive()) {
      const qCount = await QuestionModel.countDocuments();
      if (qCount === 0) {
        console.log('[SeedService] Seeding initial questions to MongoDB...');
        await QuestionModel.insertMany(SEED_QUESTIONS);
      }

      const cCount = await CompanyModel.countDocuments();
      if (cCount === 0) {
        console.log('[SeedService] Seeding company blueprints to MongoDB...');
        await CompanyModel.insertMany(SEED_COMPANIES);
      }
    } else {
      const questions = jsonStore.get('questions');
      if (!questions || questions.length === 0) {
        console.log('[SeedService] Seeding initial questions to JsonStore...');
        SEED_QUESTIONS.forEach(q => jsonStore.insert('questions', q));
      }

      const companies = jsonStore.get('companies');
      if (!companies || companies.length === 0) {
        console.log('[SeedService] Seeding company blueprints to JsonStore...');
        SEED_COMPANIES.forEach(c => jsonStore.insert('companies', c));
      }
    }
    console.log('[SeedService] Database initialization check complete.');
  } catch (err: any) {
    console.error('[SeedService] Error seeding database:', err.message);
  }
};
