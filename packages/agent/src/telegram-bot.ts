import type { ViralMoveConfig } from './config.js';
import type { DeployedToken, TokenConcept, StoredProof } from './types.js';

export class TelegramBot {
  private token: string;
  private channelId: string;
  private baseUrl: string;

  constructor(config: ViralMoveConfig) {
    this.token = config.telegramBotToken;
    this.channelId = config.telegramChannelId;
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  /**
   * Send a message to the configured channel.
   */
  async sendMessage(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<any> {
    if (!this.token || !this.channelId) {
      console.log('[TG-SKIP] No bot token or channel ID configured');
      return null;
    }

    const res = await fetch(`${this.baseUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.channelId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error(`[TG-ERROR] ${data.description}`);
    }
    return data.result;
  }

  /**
   * Post a rich launch announcement with Walrus proof links.
   * This is the core "anti-rug" UX — every announcement comes with verifiable proofs.
   */
  async postLaunchAnnouncement(
    token: DeployedToken,
    concept: TokenConcept,
    proofs: StoredProof[]
  ): Promise<void> {
    const proofLinks = proofs
      .map((p) => `  <a href="${p.url}">[${p.step.type}]</a>`)
      .join('\n');

    const explorerUrl = `https://suiexplorer.com/object/${token.packageId}?network=testnet`;

    const message = `
<b>🚀 NEW TOKEN LAUNCHED BY AI AGENT</b>

<b>Token:</b> ${concept.name} (<code>$${concept.ticker}</code>)
<b>Chain:</b> Sui Testnet
<b>Package:</b> <code>${token.packageId}</code>
<b>Supply:</b> ${(Number(concept.initialSupply) / 1e9).toLocaleString()} tokens
<b>Decimals:</b> ${concept.decimals}

${concept.description}

<b>🔗 Verify on Sui Explorer:</b>
<a href="${explorerUrl}">View Package</a>

<b>🔍 Walrus Proof Chain (verify my reasoning):</b>
${proofLinks}

<i>Every decision I made is permanently logged. I can't rug, I can't lie.</i>
<i>— Viral Move AI Agent</i>
    `.trim();

    await this.sendMessage(message);

    // Post narrative posts with small delays
    for (const post of concept.narrative.slice(0, 3)) {
      await this.sleep(2000);
      await this.sendMessage(post);
    }
  }

  /**
   * Post a trade execution announcement with proof.
   */
  async postTradeAnnouncement(
    ticker: string,
    tradeType: string,
    reason: string,
    txDigest: string,
    proof: StoredProof
  ): Promise<void> {
    const message = `
<b>📊 AI AGENT TRADE EXECUTED</b>

<b>Token:</b> $${ticker}
<b>Action:</b> ${tradeType.toUpperCase()}
<b>Reason:</b> ${reason}
<b>TX:</b> <code>${txDigest}</code>

<b>🔍 Verify my reasoning:</b>
<a href="${proof.url}">View Proof on Walrus</a>

<i>Every trade is logged. Verify, don't trust.</i>
    `.trim();

    await this.sendMessage(message);
  }

  /**
   * Post a self-evolution announcement.
   */
  async postEvolutionAnnouncement(
    skillName: string,
    reason: string,
    proof: StoredProof
  ): Promise<void> {
    const message = `
<b>🧬 AI AGENT EVOLVED</b>

<b>New Skill:</b> ${skillName}
<b>Why:</b> ${reason}

<b>🔍 Verify evolution:</b>
<a href="${proof.url}">View Proof on Walrus</a>

<i>I'm getting smarter. Watch me learn in real-time.</i>
    `.trim();

    await this.sendMessage(message);
  }

  /**
   * Post heartbeat status.
   */
  async postHeartbeat(
    balance: number,
    signalCount: number,
    skillsInstalled: number,
    proof: StoredProof
  ): Promise<void> {
    const message = `
<b>💓 HEARTBEAT</b>

Balance: ${balance.toFixed(4)} SUI
Signals: ${signalCount}
Skills: ${skillsInstalled} installed

<a href="${proof.url}">Proof</a>
    `.trim();

    await this.sendMessage(message);
  }

  /**
   * Get channel member count.
   */
  async getMemberCount(): Promise<number> {
    if (!this.token || !this.channelId) return 0;

    try {
      const res = await fetch(`${this.baseUrl}/getChatMemberCount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: this.channelId }),
      });
      const data = await res.json();
      return data.result || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get recent updates (for engagement tracking).
   */
  async getUpdates(offset?: number): Promise<any[]> {
    if (!this.token) return [];

    try {
      const res = await fetch(`${this.baseUrl}/getUpdates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offset, limit: 100, timeout: 0 }),
      });
      const data = await res.json();
      return data.result || [];
    } catch {
      return [];
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
