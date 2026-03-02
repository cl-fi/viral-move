import type { TokenConcept } from './types.js';

const THEMES = [
  'doge', 'pepe', 'shiba', 'cat', 'frog', 'moon', 'ape', 'whale',
  'dragon', 'phoenix', 'tiger', 'panda', 'wolf', 'eagle', 'bull',
  'crab', 'octopus', 'shark', 'bear', 'fox', 'owl', 'lion',
];

const VIBES = [
  'viral', 'based', 'gigachad', 'diamond', 'laser', 'turbo',
  'mega', 'ultra', 'hyper', 'super', 'alpha', 'sigma', 'chad',
  'degen', 'cosmic', 'quantum', 'atomic', 'blazing', 'golden',
  'crystal', 'shadow', 'neon', 'cyber', 'pixel',
];

const SUFFIXES = [
  'coin', 'token', 'fi', 'inu', 'swap', 'moon', 'rocket',
  'verse', 'chain', 'dao', 'labs', 'protocol', 'network',
];

export class ConceptEngine {
  /**
   * Generate a random but coherent meme coin concept.
   * Every concept is unique — the AI dev's creative output.
   */
  async generateConcept(): Promise<TokenConcept> {
    const theme = this.pick(THEMES);
    const vibe = this.pick(VIBES);
    const suffix = this.pick(SUFFIXES);

    // Generate ticker: first letters of vibe + theme, max 6 chars
    const ticker = (vibe.slice(0, 2) + theme.slice(0, 3)).toUpperCase();

    // Generate name
    const name = `${this.capitalize(vibe)} ${this.capitalize(theme)}`;

    // Generate description
    const descriptions = [
      `The most ${vibe} ${theme} token on Sui. Built by AI, verified by community, stored on Walrus.`,
      `${this.capitalize(vibe)} ${this.capitalize(theme)} ${this.capitalize(suffix)} - an AI-created meme token with full transparency. Every decision is provably logged.`,
      `$${ticker}: Where ${theme} meets ${vibe} energy on Sui. Zero human dev, zero rug risk. AI agent with Walrus proofs.`,
      `The first AI-dev'd ${theme} token. No human can rug what no human controls. All reasoning on Walrus.`,
    ];

    // Generate narrative (series of TG posts)
    const narrative = [
      `🚀 NEW AI-LAUNCHED TOKEN: $${ticker} (${name}) is LIVE on Sui!`,
      `🤖 I'm an AI agent dev. I can't rug pull, I can't lie. Every decision I make is permanently stored on Walrus.`,
      `💎 Why $${ticker}? My analysis chose "${theme}" as the next viral meta. ${this.capitalize(vibe)} energy is trending.`,
      `🔍 Don't trust — VERIFY. Click the proof links below to see my exact reasoning for creating this token.`,
      `📊 I'll be monitoring social signals and trading based on YOUR engagement. All trades logged with proofs.`,
      `🧬 I'm evolving — searching for new skills to become a better dev. Watch me learn in real-time.`,
    ];

    return {
      name,
      ticker,
      description: this.pick(descriptions),
      narrative,
      decimals: 9,
      initialSupply: BigInt(1_000_000_000) * BigInt(1_000_000_000), // 1B tokens with 9 decimals
    };
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
