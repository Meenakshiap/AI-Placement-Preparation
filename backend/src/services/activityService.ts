import { ActivityLogModel } from '../models/index.js';
import { isMongoActive } from '../config/db.js';
import { jsonStore } from '../store/jsonStore.js';
import { IActivityLog } from '../types/index.js';

type ActivityCategory = IActivityLog['category'];
type Difficulty = keyof IActivityLog['difficulty'];

interface ActivityUpdate {
  userId: string;
  category: ActivityCategory;
  solved: boolean;
  difficulty: Difficulty;
}

const getToday = (): string => new Date().toISOString().slice(0, 10);

export const recordActivity = async ({
  userId,
  category,
  solved,
  difficulty
}: ActivityUpdate): Promise<void> => {
  const date = getToday();
  const increment = {
    solvedCount: solved ? 1 : 0,
    attemptedCount: 1,
    [`difficulty.${difficulty}`]: 1
  };

  if (isMongoActive()) {
    await ActivityLogModel.findOneAndUpdate(
      { userId, date, category },
      {
        $setOnInsert: { userId, date, category },
        $inc: increment
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return;
  }

  const existing = jsonStore.findOne(
    'activityLogs',
    activity => activity.userId === userId && activity.date === date && activity.category === category
  );

  if (existing) {
    jsonStore.updateOne(
      'activityLogs',
      activity => activity.userId === userId && activity.date === date && activity.category === category,
      {
        solvedCount: existing.solvedCount + increment.solvedCount,
        attemptedCount: existing.attemptedCount + increment.attemptedCount,
        difficulty: {
          ...existing.difficulty,
          [difficulty]: existing.difficulty[difficulty] + 1
        }
      }
    );
    return;
  }

  jsonStore.insert('activityLogs', {
    userId,
    date,
    category,
    solvedCount: increment.solvedCount,
    attemptedCount: increment.attemptedCount,
    difficulty: {
      easy: difficulty === 'easy' ? 1 : 0,
      medium: difficulty === 'medium' ? 1 : 0,
      hard: difficulty === 'hard' ? 1 : 0
    }
  });
};
