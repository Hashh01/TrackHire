import { pgTable, text, serial, integer, boolean, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  company: text("company").notNull(),
  role: text("role").notNull(),
  location: text("location"),
  jobType: text("job_type"), // Full-time, Part-time, Contract, Internship
  status: text("status").notNull().default("Applied"), // Applied, Interview, Offer, Rejected
  dateApplied: timestamp("date_applied").defaultNow(),
  link: text("link"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  description: text("description"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // Phone, Video, Onsite
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  interviews: many(interviews),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertApplicationSchema = createInsertSchema(applications).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
    salaryMin: z.coerce.number().optional(),
    salaryMax: z.coerce.number().optional(),
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({ 
  id: true, 
  createdAt: true 
}).extend({
    applicationId: z.coerce.number(),
    date: z.coerce.date(),
});


// === EXPLICIT API CONTRACT TYPES ===

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type CreateApplicationRequest = InsertApplication;
export type UpdateApplicationRequest = Partial<InsertApplication>;
export type CreateInterviewRequest = InsertInterview;
export type UpdateInterviewRequest = Partial<InsertInterview>;

export type ApplicationWithInterviews = Application & { interviews: Interview[] };

export interface StatsResponse {
  total: number;
  applied: number;
  interviewing: number;
  offered: number;
  rejected: number;
}
