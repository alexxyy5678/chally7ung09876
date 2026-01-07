import express from 'express';
import { BantabroBot } from './bantabro-bot';
import { storage } from './storage';

const bot = new BantabroBot();

export function registerBotRoutes(app: express.Express): void {
  // Endpoint for processing new casts (could be called by a webhook or polling service)
  app.post('/api/bot/process-cast', async (req, res) => {
    try {
      const { castText, authorFid, castHash } = req.body;

      if (!castText || !authorFid) {
        return res.status(400).json({ error: 'Missing castText or authorFid' });
      }

      // Create a mock Cast object for processing
      const mockCast = {
        hash: Buffer.from(castHash || 'mock', 'hex'),
        data: {
          fid: authorFid,
          castAddBody: {
            text: castText,
          },
        },
      };

      const result = await bot.processCast(mockCast as any);

      if (result.shouldReply) {
        // In a real implementation, you'd post this reply to Farcaster
        console.log('Bot would reply:', result.replyText);

        // If there's a card, create the challenge in database for moderation
        if (result.card) {
          // Store pending challenge for moderator approval
          await storage.createPendingChallenge({
            cardId: result.card.id,
            title: result.card.title,
            description: result.card.description,
            stakeAmount: result.card.stakeAmount,
            timeLimit: result.card.timeLimit,
            link: result.card.link,
            castHash: castHash || 'mock',
            status: 'pending',
          });
        }

        res.json({
          success: true,
          reply: result.replyText,
          card: result.card,
        });
      } else {
        res.json({ success: true, reply: null });
      }
    } catch (error) {
      console.error('Error processing cast:', error);
      res.status(500).json({ error: 'Failed to process cast' });
    }
  });

  // Endpoint for moderators to approve/reject challenges
  app.post('/api/bot/approve-challenge/:cardId', async (req, res) => {
    try {
      const { cardId } = req.params;
      const { approved } = req.body;

      if (approved) {
        // Move from pending to active challenges
        const pendingChallenge = await storage.getPendingChallenge(cardId);
        if (pendingChallenge) {
          await storage.createChallenge({
            challenger: pendingChallenge.title.split(' vs ')[0].replace('P2P Challenge: ', ''),
            opponent: pendingChallenge.title.split(' vs ')[1] || '',
            type: pendingChallenge.title.includes('Open') ? 'open' : 'p2p',
            amount: pendingChallenge.stakeAmount,
            isYes: pendingChallenge.description.includes('YES'),
          });

          // Remove from pending
          await storage.deletePendingChallenge(cardId);
        }
      } else {
        // Reject - just delete from pending
        await storage.deletePendingChallenge(cardId);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error approving challenge:', error);
      res.status(500).json({ error: 'Failed to approve challenge' });
    }
  });

  // Get pending challenges for moderator dashboard
  app.get('/api/bot/pending-challenges', async (req, res) => {
    try {
      const pendingChallenges = await storage.getPendingChallenges();
      res.json(pendingChallenges);
    } catch (error) {
      console.error('Error fetching pending challenges:', error);
      res.status(500).json({ error: 'Failed to fetch pending challenges' });
    }
  });

  // Test endpoint for bot parsing
  app.post('/api/bot/test-parse', async (req, res) => {
    try {
      const { text, authorUsername } = req.body;
      const result = bot.parseChallengeCommand(text, authorUsername || '@testuser');

      if (result) {
        const card = bot.generateChallengeCard(result);
        res.json({ parsed: result, card });
      } else {
        res.json({ parsed: null, error: 'Could not parse command' });
      }
    } catch (error) {
      console.error('Error testing parse:', error);
      res.status(500).json({ error: 'Parse test failed' });
    }
  });
}