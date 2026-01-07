import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  challenger: text("challenger").notNull(), // @username
  opponent: text("opponent").notNull(),     // @username
  type: text("type").notNull().default("p2p"), // "p2p" or "crowd"
  amount: integer("amount").notNull(),      // USDC amount
  isYes: boolean("is_yes").default(true),
  status: text("status").notNull().default("active"), // active, settled
  yesPool: integer("yes_pool").default(0),
  noPool: integer("no_pool").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  points: integer("points").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  totalBets: integer("total_bets").notNull().default(0),
});

// === BASE SCHEMAS ===
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, createdAt: true });
export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type LeaderboardEntry = typeof leaderboard.$inferSelect;

export type CreateChallengeRequest = InsertChallenge;
export type UpdateChallengeRequest = Partial<InsertChallenge>;

export type ChallengeResponse = Challenge;
export type ChallengesListResponse = Challenge[];

export type LeaderboardResponse = LeaderboardEntry[];
