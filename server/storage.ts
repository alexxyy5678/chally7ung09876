import { db } from "./db";
import {
  challenges,
  pendingChallenges,
  type CreateChallengeRequest,
  type ChallengeResponse,
  type InsertPendingChallenge,
  type PendingChallengeResponse
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getChallenges(): Promise<ChallengeResponse[]>;
  getChallenge(id: number): Promise<ChallengeResponse | undefined>;
  createChallenge(challenge: CreateChallengeRequest): Promise<ChallengeResponse>;

  // Pending challenges for moderation
  getPendingChallenges(): Promise<PendingChallengeResponse[]>;
  getPendingChallenge(cardId: string): Promise<PendingChallengeResponse | undefined>;
  createPendingChallenge(challenge: InsertPendingChallenge): Promise<PendingChallengeResponse>;
  deletePendingChallenge(cardId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getChallenges(): Promise<ChallengeResponse[]> {
    return await db.select().from(challenges);
  }

  async getChallenge(id: number): Promise<ChallengeResponse | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async createChallenge(insertChallenge: CreateChallengeRequest): Promise<ChallengeResponse> {
    const [challenge] = await db.insert(challenges).values(insertChallenge).returning();
    return challenge;
  }

  // Pending challenges implementation
  async getPendingChallenges(): Promise<PendingChallengeResponse[]> {
    return await db.select().from(pendingChallenges).orderBy(pendingChallenges.createdAt);
  }

  async getPendingChallenge(cardId: string): Promise<PendingChallengeResponse | undefined> {
    const [challenge] = await db.select().from(pendingChallenges).where(eq(pendingChallenges.cardId, cardId));
    return challenge;
  }

  async createPendingChallenge(insertChallenge: InsertPendingChallenge): Promise<PendingChallengeResponse> {
    const [challenge] = await db.insert(pendingChallenges).values(insertChallenge).returning();
    return challenge;
  }

  async deletePendingChallenge(cardId: string): Promise<void> {
    await db.delete(pendingChallenges).where(eq(pendingChallenges.cardId, cardId));
  }
}

export const storage = new DatabaseStorage();
