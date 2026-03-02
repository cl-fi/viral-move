// === Token Concept ===

export interface TokenConcept {
  name: string;
  ticker: string;
  description: string;
  narrative: string[];   // Array of TG posts for the launch
  decimals: number;
  initialSupply: bigint;
}

// === Deployed Token ===

export interface DeployedToken {
  packageId: string;
  treasuryCapId: string;
  metadataId: string;
  coinType: string;        // e.g., "0xabc::ticker::TICKER"
  totalSupply: bigint;
  deployTxDigest: string;
  mintTxDigest?: string;
}

// === Social Metrics ===

export interface SocialMetrics {
  messageCount: number;
  memberCount: number;
  emojiCount: number;
  sentimentScore: number;  // 0-1, higher = more positive
  lastUpdated: number;
}

// === Trade Signal ===

export interface TradeSignal {
  type: 'buy' | 'sell' | 'hold';
  strength: number;        // 0-100
  reason: string;
  tokenTicker: string;
  timestamp: number;
}

// === Trade Result ===

export interface TradeResult {
  executed: boolean;
  txDigest?: string;
  walrusBlobId?: string;
  amount?: number;
  reason: string;
}

// === Walrus Proof ===

export interface ProofStep {
  type: 'concept' | 'deploy' | 'mint' | 'spread' | 'signal' | 'trade' | 'evolve' | 'heartbeat';
  reasoning: string;       // WHY the agent made this decision (anti-rug key)
  action: string;          // WHAT was done
  result: Record<string, unknown>;
  txDigest?: string;
  timestamp: number;
}

export interface StoredProof {
  blobId: string;
  url: string;             // Public Walrus aggregator URL
  step: ProofStep;
}

// === Self-Evolution ===

export interface SkillSearchResult {
  slug: string;
  name: string;
  description: string;
  stars: number;
  downloads: number;
}

export interface EvolutionStep {
  query: string;
  skillsFound: SkillSearchResult[];
  installed: string | null;
  soulUpdated: boolean;
  walrusProof: StoredProof;
}

// === Viral Cycle ===

export interface ViralCycle {
  cycleNumber: number;
  concept: TokenConcept;
  token?: DeployedToken;
  proofs: StoredProof[];
  socialMetrics: SocialMetrics[];
  tradeSignals: TradeSignal[];
  trades: TradeResult[];
  evolutionSteps: EvolutionStep[];
  startedAt: number;
  completedAt?: number;
}
