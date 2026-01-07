import { getInsecureClient, HubServiceClient, CastAddBody, Message } from '@farcaster/hub-nodejs';
import axios from 'axios';

export interface ChallengeRequest {
  type: 'p2p' | 'open' | 'squad';
  challenger: string;
  opponent?: string;
  topic: string;
  side: 'YES' | 'NO';
  amount: number;
  duration?: number; // in hours
  bonus?: number;
}

export interface ChallengeCard {
  id: string;
  title: string;
  description: string;
  stakeAmount: number;
  timeLimit: string;
  link: string;
}

export class BantabroBot {
  private hubClient: HubRestAPIClient;
  private telegramBotToken?: string;
  private telegramChatId?: string;

  constructor(hubUrl: string = 'https://hub.farcaster.standardcrypto.vc:2281') {
    this.hubClient = new HubRestAPIClient({ hubUrl });

    // Load Telegram config from environment
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID;
  }

  /**
   * Parse a Farcaster cast for @bantabro challenge commands
   */
  parseChallengeCommand(text: string, authorUsername: string): ChallengeRequest | null {
    // Match patterns like:
    // @bantabro challenge @opponent YES/NO amount topic
    // @bantabro challenge YES/NO amount topic
    // @bantabro squad challenge @opponent YES/NO amount topic

    const patterns = [
      // Direct P2P: @bantabro challenge @opponent YES/NO amount topic duration?
      /@bantabro\s+challenge\s+(@\w+)\s+(YES|NO)\s+(\d+)\s+(.+?)(?:\s+(\d+)h)?(?:\s+\+bonus\s+(\d+))?/i,

      // Open challenge: @bantabro challenge YES/NO amount topic duration?
      /@bantabro\s+challenge\s+(YES|NO)\s+(\d+)\s+(.+?)(?:\s+(\d+)h)?(?:\s+\+bonus\s+(\d+))?/i,

      // Squad challenge: @bantabro squad challenge @opponent YES/NO amount topic
      /@bantabro\s+squad\s+challenge\s+(@\w+)\s+(YES|NO)\s+(\d+)\s+(.+?)(?:\s+(\d+)h)?/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const [_, opponentOrSide, sideOrAmount, amountOrTopic, topicOrDuration, durationOrBonus, bonus] = match;

        // Determine challenge type and parse accordingly
        if (text.includes('squad')) {
          // Squad challenge
          return {
            type: 'squad',
            challenger: authorUsername,
            opponent: opponentOrSide,
            topic: topicOrDuration || topicOrDuration,
            side: sideOrAmount as 'YES' | 'NO',
            amount: parseInt(amountOrTopic),
            duration: durationOrBonus ? parseInt(durationOrBonus) : 24,
          };
        } else if (opponentOrSide?.startsWith('@')) {
          // Direct P2P challenge
          return {
            type: 'p2p',
            challenger: authorUsername,
            opponent: opponentOrSide,
            topic: topicOrDuration || topicOrDuration,
            side: sideOrAmount as 'YES' | 'NO',
            amount: parseInt(amountOrTopic),
            duration: durationOrBonus ? parseInt(durationOrBonus) : 24,
            bonus: bonus ? parseInt(bonus) : undefined,
          };
        } else {
          // Open challenge
          return {
            type: 'open',
            challenger: authorUsername,
            topic: amountOrTopic,
            side: opponentOrSide as 'YES' | 'NO',
            amount: parseInt(sideOrAmount),
            duration: topicOrDuration ? parseInt(topicOrDuration) : 24,
            bonus: durationOrBonus ? parseInt(durationOrBonus) : undefined,
          };
        }
      }
    }

    return null;
  }

  /**
   * Generate a challenge card for the bot to reply with
   */
  generateChallengeCard(request: ChallengeRequest): ChallengeCard {
    const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let title = '';
    let description = '';

    switch (request.type) {
      case 'p2p':
        title = `P2P Challenge: ${request.challenger} vs ${request.opponent}`;
        description = `${request.topic}\n${request.challenger} says ${request.side} / ₦${request.amount}`;
        break;
      case 'open':
        title = `Open Challenge: ${request.topic}`;
        description = `${request.challenger} says ${request.side} / ₦${request.amount}\nAnyone can oppose!`;
        break;
      case 'squad':
        title = `Squad Challenge: ${request.challenger} vs ${request.opponent}`;
        description = `${request.topic}\n${request.challenger} says ${request.side} / ₦${request.amount}\nFriends can back both sides!`;
        break;
    }

    const timeLimit = request.duration ? `${request.duration}h` : '24h';
    const link = `${process.env.APP_URL || 'https://bantabro.com'}/challenge/${challengeId}`;

    return {
      id: challengeId,
      title,
      description,
      stakeAmount: request.amount,
      timeLimit,
      link,
    };
  }

  /**
   * Send Telegram alert to moderators
   */
  async sendTelegramAlert(request: ChallengeRequest, castHash: string): Promise<void> {
    if (!this.telegramBotToken || !this.telegramChatId) {
      console.warn('Telegram credentials not configured');
      return;
    }

    const message = `
🚨 New Challenge Request

Type: ${request.type.toUpperCase()}
Challenger: ${request.challenger}
${request.opponent ? `Opponent: ${request.opponent}` : ''}
Topic: ${request.topic}
Side: ${request.side}
Amount: ₦${request.amount}
Duration: ${request.duration || 24}h
${request.bonus ? `Bonus: ₦${request.bonus}` : ''}

Cast: https://warpcast.com/~/casts/${castHash}

Approve in dashboard: ${process.env.DASHBOARD_URL || 'https://dashboard.bantabro.com'}
    `.trim();

    try {
      await axios.post(`https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`, {
        chat_id: this.telegramChatId,
        text: message,
        parse_mode: 'Markdown',
      });
      console.log('Telegram alert sent successfully');
    } catch (error) {
      console.error('Failed to send Telegram alert:', error);
    }
  }

  /**
   * Process a new cast and handle @bantabro commands
   */
  async processCast(cast: Cast): Promise<{ shouldReply: boolean; replyText?: string; card?: ChallengeCard }> {
    if (!cast.data?.castAddBody?.text) return { shouldReply: false };

    const text = cast.data.castAddBody.text;
    const authorFid = cast.data.fid;

    // Get username from FID (simplified - in real implementation, you'd cache this)
    const authorUsername = `@user_${authorFid}`;

    // Check if cast mentions @bantabro
    if (!text.toLowerCase().includes('@bantabro')) {
      return { shouldReply: false };
    }

    // Parse challenge command
    const challengeRequest = this.parseChallengeCommand(text, authorUsername);
    if (!challengeRequest) {
      return {
        shouldReply: true,
        replyText: '🤔 Didn\'t understand that command. Try:\n@bantabro challenge @opponent YES/NO amount "topic" duration\n\nExample: @bantabro challenge @alice YES 100 "Will it rain tomorrow?" 24h'
      };
    }

    // Generate challenge card
    const card = this.generateChallengeCard(challengeRequest);

    // Send Telegram alert to moderators
    const castHash = cast.hash.toString('hex');
    await this.sendTelegramAlert(challengeRequest, castHash);

    // Create reply with challenge card
    const replyText = `
🔥 Challenge Detected!

${card.title}
💰 Stake: ₦${card.stakeAmount}
⏳ Time: ${card.timeLimit}

${card.description}

Tap to accept or oppose 👇
${card.link}
    `.trim();

    return {
      shouldReply: true,
      replyText,
      card,
    };
  }

  /**
   * Start monitoring casts (this would be called in a background process)
   */
  async startMonitoring(): Promise<void> {
    console.log('Starting Bantabro bot monitoring...');

    // This is a simplified implementation
    // In production, you'd use WebSocket subscriptions or polling
    // to monitor new casts in real-time

    try {
      // Test connection
      const info = await this.hubClient.getInfo();
      console.log('Connected to Farcaster Hub:', info.version);
    } catch (error) {
      console.error('Failed to connect to Farcaster Hub:', error);
    }
  }
}