import type { ViralMoveConfig } from './config.js';
import type { ProofStep, StoredProof } from './types.js';

export class WalrusProof {
  private config: ViralMoveConfig;

  constructor(config: ViralMoveConfig) {
    this.config = config;
  }

  /**
   * Store a proof step on Walrus — the core anti-rug mechanism.
   * Every action the agent takes (concept, deploy, trade, evolve) gets
   * an immutable proof with the agent's reasoning attached.
   */
  async storeProof(step: ProofStep): Promise<StoredProof> {
    const data = new TextEncoder().encode(JSON.stringify(step, null, 2));

    const response = await fetch(
      `${this.config.walrusPublisherUrl}/v1/blobs?epochs=${this.config.walrusEpochs}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: data,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Walrus store failed (${response.status}): ${text}`);
    }

    const result = (await response.json()) as Record<string, any>;

    let blobId: string;
    if (result.newlyCreated) {
      blobId = result.newlyCreated.blobObject.blobId;
    } else if (result.alreadyCertified) {
      blobId = result.alreadyCertified.blobId;
    } else {
      throw new Error(`Unexpected Walrus response: ${JSON.stringify(result)}`);
    }

    return {
      blobId,
      url: this.getProofUrl(blobId),
      step,
    };
  }

  /**
   * Read a proof back from Walrus — for verification.
   */
  async readProof(blobId: string): Promise<ProofStep> {
    const response = await fetch(
      `${this.config.walrusAggregatorUrl}/v1/blobs/${blobId}`
    );

    if (!response.ok) {
      throw new Error(`Walrus read failed (${response.status})`);
    }

    const data = new Uint8Array(await response.arrayBuffer());
    return JSON.parse(new TextDecoder().decode(data));
  }

  /**
   * Get the public URL for a proof blob — shared in TG messages
   * so community can click and verify the agent's reasoning.
   */
  getProofUrl(blobId: string): string {
    return `${this.config.walrusAggregatorUrl}/v1/blobs/${blobId}`;
  }
}
