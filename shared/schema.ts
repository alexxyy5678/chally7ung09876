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

export const pendingChallenges = pgTable("pending_challenges", {
  id: serial("id").primaryKey(),
  cardId: text("card_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  stakeAmount: integer("stake_amount").notNull(),
  timeLimit: text("time_limit").notNull(),
  link: text("link").notNull(),
  castHash: text("cast_hash").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, createdAt: true });
export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({ id: true });
export const insertPendingChallengeSchema = createInsertSchema(pendingChallenges).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type LeaderboardEntry = typeof leaderboard.$inferSelect;

export type PendingChallenge = typeof pendingChallenges.$inferSelect;
export type InsertPendingChallenge = z.infer<typeof insertPendingChallengeSchema>;

export type CreateChallengeRequest = InsertChallenge;
export type UpdateChallengeRequest = Partial<InsertChallenge>;

export type ChallengeResponse = Challenge;
export type ChallengesListResponse = Challenge[];

export type LeaderboardResponse = LeaderboardEntry[];

export type PendingChallengeResponse = PendingChallenge;
export type PendingChallengesListResponse = PendingChallenge[];
