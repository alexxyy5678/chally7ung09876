import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { registerBotRoutes } from "./bot-routes";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register bot routes
  registerBotRoutes(app);
  app.get(api.challenges.list.path, async (req, res) => {
    const challenges = await storage.getChallenges();
    res.json(challenges);
  });

  app.get(api.challenges.get.path, async (req, res) => {
    const challenge = await storage.getChallenge(Number(req.params.id));
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  });

  app.post(api.challenges.create.path, async (req, res) => {
    try {
      const input = api.challenges.create.input.parse(req.body);
      const challenge = await storage.createChallenge(input);
      res.status(201).json(challenge);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}

async function seedDatabase() {
  const existingItems = await storage.getChallenges();
  if (existingItems.length === 0) {
    await storage.createChallenge({ 
      challenger: "@crypto_king", 
      opponent: "@bear_market", 
      type: "p2p", 
      amount: 50,
      isYes: true,
      status: "active",
      yesPool: 50,
      noPool: 0
    });
    await storage.createChallenge({ 
      challenger: "@degen_lord", 
      opponent: "@vitalik", 
      type: "crowd", 
      amount: 100,
      isYes: false,
      status: "active",
      yesPool: 500,
      noPool: 350
    });
  }
}

// Call seed in the background
seedDatabase().catch(console.error);
