import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import { 
  applications, interviews, 
  type Application, type InsertApplication, type UpdateApplicationRequest,
  type Interview, type InsertInterview, 
  type ApplicationWithInterviews,
  type StatsResponse
} from "@shared/schema";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Applications
  getApplications(userId: string): Promise<Application[]>;
  getApplication(id: number): Promise<ApplicationWithInterviews | undefined>;
  createApplication(userId: string, app: InsertApplication): Promise<Application>;
  updateApplication(id: number, userId: string, app: UpdateApplicationRequest): Promise<Application | undefined>;
  deleteApplication(id: number, userId: string): Promise<void>;

  // Interviews
  createInterview(interview: InsertInterview): Promise<Interview>;
  deleteInterview(id: number): Promise<void>;

  // Stats
  getStats(userId: string): Promise<StatsResponse>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated to authStorage
  getUser = authStorage.getUser.bind(authStorage);
  upsertUser = authStorage.upsertUser.bind(authStorage);

  // Applications
  async getApplications(userId: string): Promise<Application[]> {
    return await db.select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(sql`${applications.dateApplied} DESC`);
  }

  async getApplication(id: number): Promise<ApplicationWithInterviews | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    if (!app) return undefined;

    const appInterviews = await db.select()
      .from(interviews)
      .where(eq(interviews.applicationId, id))
      .orderBy(interviews.date);

    return { ...app, interviews: appInterviews };
  }

  async createApplication(userId: string, app: InsertApplication): Promise<Application> {
    const [newApp] = await db.insert(applications)
      .values({ ...app, userId })
      .returning();
    return newApp;
  }

  async updateApplication(id: number, userId: string, app: UpdateApplicationRequest): Promise<Application | undefined> {
    const [updatedApp] = await db.update(applications)
      .set({ ...app, updatedAt: new Date() })
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .returning();
    return updatedApp;
  }

  async deleteApplication(id: number, userId: string): Promise<void> {
    await db.delete(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, userId)));
  }

  // Interviews
  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db.insert(interviews)
      .values(interview)
      .returning();
    return newInterview;
  }

  async deleteInterview(id: number): Promise<void> {
    await db.delete(interviews).where(eq(interviews.id, id));
  }

  // Stats
  async getStats(userId: string): Promise<StatsResponse> {
    const userApps = await this.getApplications(userId);
    
    const stats: StatsResponse = {
      total: userApps.length,
      applied: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0
    };

    userApps.forEach(app => {
      if (app.status === 'Applied') stats.applied++;
      else if (app.status === 'Interview') stats.interviewing++;
      else if (app.status === 'Offer') stats.offered++;
      else if (app.status === 'Rejected') stats.rejected++;
    });

    return stats;
  }
}

export const storage = new DatabaseStorage();
