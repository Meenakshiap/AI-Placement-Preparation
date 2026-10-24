import fs from 'fs';
import path from 'path';
import {
  IUser,
  ISkillProfile,
  IQuestion,
  IAttempt,
  IInterviewSession,
  IRecommendation,
  ICompanyBlueprint,
  IActivityLog,
  ICodingAttempt,
  ITrackProgress
} from '../types/index.js';

interface DatabaseSchema {
  users: IUser[];
  skillProfiles: ISkillProfile[];
  questions: IQuestion[];
  attempts: IAttempt[];
  interviewSessions: IInterviewSession[];
  recommendations: IRecommendation[];
  companies: ICompanyBlueprint[];
  activityLogs: IActivityLog[];
  codingAttempts: ICodingAttempt[];
  trackProgress: ITrackProgress[];
}

class JsonStore {
  private data: DatabaseSchema = {
    users: [],
    skillProfiles: [],
    questions: [],
    attempts: [],
    interviewSessions: [],
    recommendations: [],
    companies: [],
    activityLogs: [],
    codingAttempts: [],
    trackProgress: []
  };

  private filePath: string;
  private isLoaded = false;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Ignore if directory creation fails in restricted environments
      }
    }
    this.filePath = path.resolve(dataDir, 'db.json');
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          this.data = {
            users: parsed.users || [],
            skillProfiles: parsed.skillProfiles || [],
            questions: parsed.questions || [],
            attempts: parsed.attempts || [],
            interviewSessions: parsed.interviewSessions || [],
            recommendations: parsed.recommendations || [],
            companies: parsed.companies || [],
            activityLogs: parsed.activityLogs || [],
            codingAttempts: parsed.codingAttempts || [],
            trackProgress: parsed.trackProgress || []
          };
        }
      }
      this.isLoaded = true;
    } catch (err) {
      console.warn('[JsonStore] Warning: Could not read db.json, using in-memory store.');
      this.isLoaded = true;
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {
      // Memory fallback if disk write is blocked
    }
  }

  public get<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    if (!this.isLoaded) this.load();
    return this.data[collection];
  }

  public findById<K extends keyof DatabaseSchema>(collection: K, id: string): any | undefined {
    const items = this.get(collection) as any[];
    return items.find(item => item.id === id || item._id === id);
  }

  public findOne<K extends keyof DatabaseSchema>(collection: K, predicate: (item: any) => boolean): any | undefined {
    const items = this.get(collection) as any[];
    return items.find(predicate);
  }

  public find<K extends keyof DatabaseSchema>(collection: K, predicate?: (item: any) => boolean): any[] {
    const items = this.get(collection) as any[];
    if (!predicate) return [...items];
    return items.filter(predicate);
  }

  public insert<K extends keyof DatabaseSchema>(collection: K, item: any): any {
    if (!item.id) {
      item.id = 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    }
    if (!item.createdAt) {
      item.createdAt = new Date();
    }
    if (!item.updatedAt) {
      item.updatedAt = new Date();
    }
    (this.data[collection] as any[]).push(item);
    this.save();
    return item;
  }

  public update<K extends keyof DatabaseSchema>(collection: K, id: string, updates: any): any | null {
    const items = this.data[collection] as any[];
    const idx = items.findIndex(item => item.id === id || item._id === id);
    if (idx === -1) return null;
    items[idx] = {
      ...items[idx],
      ...updates,
      updatedAt: new Date()
    };
    this.save();
    return items[idx];
  }

  public updateOne<K extends keyof DatabaseSchema>(collection: K, predicate: (item: any) => boolean, updates: any): any | null {
    const items = this.data[collection] as any[];
    const idx = items.findIndex(predicate);
    if (idx === -1) return null;
    items[idx] = {
      ...items[idx],
      ...updates,
      updatedAt: new Date()
    };
    this.save();
    return items[idx];
  }

  public delete<K extends keyof DatabaseSchema>(collection: K, id: string): boolean {
    const items = this.data[collection] as any[];
    const idx = items.findIndex(item => item.id === id || item._id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    this.save();
    return true;
  }

  public count<K extends keyof DatabaseSchema>(collection: K): number {
    return (this.data[collection] as any[]).length;
  }
}

export const jsonStore = new JsonStore();
