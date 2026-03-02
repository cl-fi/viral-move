import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { config as loadDotenv } from 'dotenv';

// Load .env file — check cwd and project root
loadDotenv();
loadDotenv({ path: resolve(process.cwd(), '../../.env') });

export interface ViralMoveConfig {
  // Sui
  suiNetwork: 'testnet' | 'mainnet';
  privateKeyPath: string;

  // Walrus
  walrusPublisherUrl: string;
  walrusAggregatorUrl: string;
  walrusEpochs: number;

  // Telegram
  telegramBotToken: string;
  telegramChannelId: string;

  // Token Factory
  tokenTemplateDir: string;
  generatedContractsDir: string;

  // Self-Evolution
  skillsDir: string;
  soulMdPath: string;

  // Agent
  pollIntervalMs: number;
  monitorRounds: number;
  monitorIntervalMs: number;
}

const WALRUS_ENDPOINTS = {
  testnet: {
    publisher: 'https://publisher.walrus-testnet.walrus.space',
    aggregator: 'https://aggregator.walrus-testnet.walrus.space',
  },
  mainnet: {
    publisher: 'https://publisher.walrus.site',
    aggregator: 'https://aggregator.walrus.site',
  },
};

export function loadConfig(): ViralMoveConfig {
  const network = (process.env.SUI_NETWORK || 'testnet') as 'testnet' | 'mainnet';
  const endpoints = WALRUS_ENDPOINTS[network];

  return {
    suiNetwork: network,
    privateKeyPath: process.env.SUI_PRIVATE_KEY_PATH || '/run/secrets/sui_private_key',

    walrusPublisherUrl: process.env.WALRUS_PUBLISHER_URL || endpoints.publisher,
    walrusAggregatorUrl: process.env.WALRUS_AGGREGATOR_URL || endpoints.aggregator,
    walrusEpochs: parseInt(process.env.WALRUS_EPOCHS || '5'),

    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChannelId: process.env.TELEGRAM_CHANNEL_ID || '',

    tokenTemplateDir: process.env.TOKEN_TEMPLATE_DIR || './contracts/token-template',
    generatedContractsDir: process.env.GENERATED_CONTRACTS_DIR || './contracts/generated',

    skillsDir: process.env.SKILLS_DIR || './workspace/skills',
    soulMdPath: process.env.SOUL_MD_PATH || './workspace/SOUL.md',

    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '60000'),
    monitorRounds: parseInt(process.env.MONITOR_ROUNDS || '4'),
    monitorIntervalMs: parseInt(process.env.MONITOR_INTERVAL_MS || '30000'),
  };
}

export function loadPrivateKey(config: ViralMoveConfig): string {
  // Try Docker secrets path first
  if (existsSync(config.privateKeyPath)) {
    return readFileSync(config.privateKeyPath, 'utf-8').trim();
  }
  // Fallback to env var (for local development)
  if (process.env.SUI_PRIVATE_KEY) {
    return process.env.SUI_PRIVATE_KEY;
  }
  throw new Error(
    `No private key found. Set SUI_PRIVATE_KEY env var or mount key at ${config.privateKeyPath}`
  );
}
