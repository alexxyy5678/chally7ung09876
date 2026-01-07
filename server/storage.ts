import { db } from "./db";
import {
  challenges,
  type CreateChallengeRequest,
  type ChallengeResponse
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getChallenges(): Promise<ChallengeResponse[]>;
  getChallenge(id: number): Promise<ChallengeResponse | undefined>;
  createChallenge(challenge: CreateChallengeRequest): Promise<ChallengeResponse>;
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
}

export const storage = new DatabaseStorage();
