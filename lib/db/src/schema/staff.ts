import { pgTable, serial, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const divisionEnum = pgEnum("division", ["Event", "Training"]);
export const statusEnum = pgEnum("status", ["Active", "LOA", "Suspended", "Terminated"]);
export const accessLevelEnum = pgEnum("access_level", ["Staff", "Assistant Director", "Director", "HQ"]);

export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rank: text("rank").notNull(),
  division: divisionEnum("division").notNull(),
  status: statusEnum("status").notNull().default("Active"),
  accessLevel: accessLevelEnum("access_level").notNull().default("Staff"),

  // Weekly stats
  weeklyVoiceHours: real("weekly_voice_hours").notNull().default(0),
  weeklyMessages: integer("weekly_messages").notNull().default(0),
  weeklyEventsHosted: integer("weekly_events_hosted").notNull().default(0),
  weeklyMiniEventsHosted: integer("weekly_mini_events_hosted").notNull().default(0),

  // Monthly stats
  monthlyVoiceHours: real("monthly_voice_hours").notNull().default(0),
  monthlyMessages: integer("monthly_messages").notNull().default(0),
  monthlyEventsHosted: integer("monthly_events_hosted").notNull().default(0),
  monthlyMiniEventsHosted: integer("monthly_mini_events_hosted").notNull().default(0),

  // Warnings
  writtenWarnings: integer("written_warnings").notNull().default(0),
  activityStrikes: integer("activity_strikes").notNull().default(0),
  finalStrikes: integer("final_strikes").notNull().default(0),

  notes: text("notes"),
  suspendedAt: timestamp("suspended_at"),
  terminatedAt: timestamp("terminated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStaffSchema = createInsertSchema(staffTable).omit({
  id: true,
  createdAt: true,
  suspendedAt: true,
  terminatedAt: true,
  writtenWarnings: true,
  activityStrikes: true,
  finalStrikes: true,
  weeklyVoiceHours: true,
  weeklyMessages: true,
  weeklyEventsHosted: true,
  weeklyMiniEventsHosted: true,
  monthlyVoiceHours: true,
  monthlyMessages: true,
  monthlyEventsHosted: true,
  monthlyMiniEventsHosted: true,
  status: true,
});

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staffTable.$inferSelect;
