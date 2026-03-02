import type { TelegramBot } from './telegram-bot.js';
import type { SocialMetrics, TradeSignal } from './types.js';

const POSITIVE_KEYWORDS = [
  'moon', 'rocket', 'bull', 'lfg', 'lets go', 'pump', 'gem', 'fire',
  'based', 'wagmi', 'diamond', 'buy', 'bullish', 'lambo', 'gm',
  'alpha', 'chad', 'degen', 'ape', 'send it', 'love',
];

const NEGATIVE_KEYWORDS = [
  'dump', 'rug', 'scam', 'bear', 'sell', 'dead', 'rip', 'ngmi',
  'trash', 'fake', 'fraud', 'ponzi', 'exit', 'crash', 'fear',
];

export class SentimentMonitor {
  private bot: TelegramBot;

  constructor(bot: TelegramBot) {
    this.bot = bot;
  }

  /**
   * Collect social metrics from Telegram.
   */
  async collectMetrics(): Promise<SocialMetrics> {
    const memberCount = await this.bot.getMemberCount();
    const updates = await this.bot.getUpdates();

    // Filter to messages from the last hour
    const oneHourAgo = Date.now() / 1000 - 3600;
    const recentMessages = updates.filter(
      (u: any) => u.message && u.message.date > oneHourAgo
    );

    // Count emojis
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}]/gu;
    const emojiCount = recentMessages.reduce((count: number, u: any) => {
      const text = u.message?.text || '';
      return count + (text.match(emojiRegex) || []).length;
    }, 0);

    return {
      messageCount: recentMessages.length,
      memberCount,
      emojiCount,
      sentimentScore: this.computeSentiment(recentMessages),
      lastUpdated: Date.now(),
    };
  }

  /**
   * Generate a trade signal from social metrics.
   */
  generateTradeSignal(
    metrics: SocialMetrics,
    previousMetrics?: SocialMetrics,
    tokenTicker: string = 'UNKNOWN'
  ): TradeSignal {
    let strength = 0;
    const reasons: string[] = [];

    // Member growth
    if (previousMetrics && previousMetrics.memberCount > 0) {
      const growth = (metrics.memberCount - previousMetrics.memberCount) / previousMetrics.memberCount;
      if (growth > 0.1) {
        strength += 30;
        reasons.push(`Member growth: +${(growth * 100).toFixed(1)}%`);
      } else if (growth > 0.05) {
        strength += 15;
        reasons.push(`Member growth: +${(growth * 100).toFixed(1)}%`);
      }
    }

    // Message rate
    if (previousMetrics) {
      if (metrics.messageCount > previousMetrics.messageCount * 1.5) {
        strength += 20;
        reasons.push('Message rate increasing');
      }
    }
    if (metrics.messageCount > 20) {
      strength += 10;
      reasons.push(`High message count: ${metrics.messageCount}`);
    }

    // Sentiment
    if (metrics.sentimentScore > 0.7) {
      strength += 25;
      reasons.push(`High sentiment: ${metrics.sentimentScore.toFixed(2)}`);
    } else if (metrics.sentimentScore > 0.5) {
      strength += 10;
      reasons.push(`Positive sentiment: ${metrics.sentimentScore.toFixed(2)}`);
    } else if (metrics.sentimentScore < 0.3) {
      strength -= 20;
      reasons.push(`Negative sentiment: ${metrics.sentimentScore.toFixed(2)}`);
    }

    // Emoji engagement
    if (metrics.emojiCount > 10) {
      strength += 15;
      reasons.push(`High emoji engagement: ${metrics.emojiCount}`);
    }

    // Determine signal type
    let type: 'buy' | 'sell' | 'hold';
    if (strength > 50) {
      type = 'buy';
    } else if (strength > 20) {
      type = 'hold';
    } else {
      type = 'sell';
    }

    return {
      type,
      strength: Math.max(0, Math.min(100, strength)),
      reason: reasons.length > 0 ? reasons.join('; ') : 'No significant signals detected',
      tokenTicker,
      timestamp: Date.now(),
    };
  }

  /**
   * Simple keyword-based sentiment analysis.
   */
  private computeSentiment(messages: any[]): number {
    let pos = 0;
    let neg = 0;

    for (const msg of messages) {
      const text = (msg.message?.text || '').toLowerCase();
      for (const word of POSITIVE_KEYWORDS) {
        if (text.includes(word)) pos++;
      }
      for (const word of NEGATIVE_KEYWORDS) {
        if (text.includes(word)) neg++;
      }
    }

    const total = pos + neg;
    if (total === 0) return 0.5; // Neutral
    return pos / total;
  }
}
