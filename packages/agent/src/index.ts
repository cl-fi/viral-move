#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig } from './config.js';
import { SuiClientWrapper } from './sui-client.js';
import { WalrusProof } from './walrus-proof.js';
import { ConceptEngine } from './concept-engine.js';
import { TokenFactory } from './token-factory.js';
import { TelegramBot } from './telegram-bot.js';
import { SentimentMonitor } from './sentiment-monitor.js';
import { TradingEngine } from './trading-engine.js';
import { SelfEvolve } from './self-evolve.js';
import type { StoredProof, DeployedToken, TokenConcept, SocialMetrics, TradeSignal } from './types.js';

// ─── Logging Helpers ──────────────────────────────────────────

const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✔'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✖'), msg),
  step: (n: number, msg: string) => console.log(chalk.cyan(`[Step ${n}]`), msg),
  proof: (proof: StoredProof) => console.log(chalk.magenta('  🔗 Proof:'), proof.url),
  divider: () => console.log(chalk.gray('─'.repeat(60))),
  banner: (msg: string) => {
    console.log('');
    console.log(chalk.bold.cyan('═'.repeat(60)));
    console.log(chalk.bold.cyan(`  ${msg}`));
    console.log(chalk.bold.cyan('═'.repeat(60)));
    console.log('');
  },
};

// ─── Initialize All Components ────────────────────────────────

function initComponents() {
  const config = loadConfig();
  const sui = new SuiClientWrapper(config);
  const walrus = new WalrusProof(config);
  const conceptEngine = new ConceptEngine();
  const tokenFactory = new TokenFactory(config, sui);
  const telegramBot = new TelegramBot(config);
  const sentimentMonitor = new SentimentMonitor(telegramBot);
  const tradingEngine = new TradingEngine(sui, walrus);
  const selfEvolve = new SelfEvolve(config, walrus);

  return {
    config, sui, walrus, conceptEngine, tokenFactory,
    telegramBot, sentimentMonitor, tradingEngine, selfEvolve,
  };
}

// ─── Core: One Full Viral Cycle ───────────────────────────────

async function runViralCycle(cycleNumber: number) {
  const {
    config, sui, walrus, conceptEngine, tokenFactory,
    telegramBot, sentimentMonitor, tradingEngine, selfEvolve,
  } = initComponents();

  log.banner(`VIRAL CYCLE #${cycleNumber}`);

  // Check balance
  const balance = await sui.getBalance();
  log.info(`Agent wallet: ${sui.getAddress()}`);
  log.info(`Balance: ${balance.toFixed(4)} SUI`);

  if (balance < 0.3) {
    log.error('Insufficient balance for token deployment. Need at least 0.3 SUI.');
    return;
  }

  const proofs: StoredProof[] = [];

  // ─── Step 1: Generate Meme Concept ─────────────────────────
  log.step(1, 'Generating meme concept...');
  const concept = await conceptEngine.generateConcept();
  log.success(`Concept: ${concept.name} ($${concept.ticker})`);
  log.info(`Description: ${concept.description}`);

  const conceptProof = await walrus.storeProof({
    type: 'concept',
    reasoning: `Generated meme concept. Chose "${concept.name}" ($${concept.ticker}) because the theme and vibe combination has viral potential. Supply: ${concept.initialSupply.toString()} with ${concept.decimals} decimals.`,
    action: 'generate_concept',
    result: {
      name: concept.name,
      ticker: concept.ticker,
      description: concept.description,
      initialSupply: concept.initialSupply.toString(),
    },
    timestamp: Date.now(),
  });
  proofs.push(conceptProof);
  log.proof(conceptProof);

  // ─── Step 2: Deploy Token on Sui ───────────────────────────
  log.divider();
  log.step(2, 'Deploying token on Sui...');
  log.info('Generating Move package...');

  let token: DeployedToken;
  try {
    token = await tokenFactory.deployToken(concept);
    log.success(`Token deployed!`);
    log.info(`Package ID: ${token.packageId}`);
    log.info(`Coin Type: ${token.coinType}`);
    log.info(`Treasury Cap: ${token.treasuryCapId}`);
    log.info(`Deploy TX: ${token.deployTxDigest}`);
    if (token.mintTxDigest) {
      log.info(`Mint TX: ${token.mintTxDigest}`);
    }
  } catch (error: any) {
    log.error(`Token deployment failed: ${error.message}`);
    await walrus.storeProof({
      type: 'deploy',
      reasoning: `Token deployment failed for $${concept.ticker}: ${error.message}`,
      action: 'deploy_failed',
      result: { error: error.message },
      timestamp: Date.now(),
    });
    return;
  }

  const deployProof = await walrus.storeProof({
    type: 'deploy',
    reasoning: `Successfully deployed $${concept.ticker} on Sui testnet. Package published and metadata frozen (immutable tokenomics — cannot be changed). TreasuryCap held by agent for minting.`,
    action: 'deploy_token',
    result: {
      packageId: token.packageId,
      coinType: token.coinType,
      treasuryCapId: token.treasuryCapId,
      deployTxDigest: token.deployTxDigest,
      mintTxDigest: token.mintTxDigest || null,
      totalSupply: token.totalSupply.toString(),
    },
    txDigest: token.deployTxDigest,
    timestamp: Date.now(),
  });
  proofs.push(deployProof);
  log.proof(deployProof);

  // ─── Step 3: Spread on Telegram ────────────────────────────
  log.divider();
  log.step(3, 'Spreading on Telegram...');
  await telegramBot.postLaunchAnnouncement(token, concept, proofs);
  log.success('Launch announced on Telegram with proof links!');

  const spreadProof = await walrus.storeProof({
    type: 'spread',
    reasoning: `Posted launch announcement for $${concept.ticker} to Telegram channel. Included ${proofs.length} proof links for community verification.`,
    action: 'telegram_announcement',
    result: {
      channel: config.telegramChannelId,
      proofsIncluded: proofs.map((p) => p.blobId),
    },
    timestamp: Date.now(),
  });
  proofs.push(spreadProof);
  log.proof(spreadProof);

  // ─── Step 4: Monitor + Trade ───────────────────────────────
  log.divider();
  log.step(4, `Monitoring social engagement (${config.monitorRounds} rounds, ${config.monitorIntervalMs / 1000}s intervals)...`);

  let previousMetrics: SocialMetrics | undefined;

  for (let i = 0; i < config.monitorRounds; i++) {
    await sleep(config.monitorIntervalMs);

    const metrics = await sentimentMonitor.collectMetrics();
    log.info(`Round ${i + 1}: ${metrics.memberCount} members, ${metrics.messageCount} msgs, sentiment: ${metrics.sentimentScore.toFixed(2)}`);

    const signal = sentimentMonitor.generateTradeSignal(metrics, previousMetrics, concept.ticker);
    log.info(`Signal: ${signal.type.toUpperCase()} (strength: ${signal.strength}) — ${signal.reason}`);

    // Log signal to Walrus
    await walrus.storeProof({
      type: 'signal',
      reasoning: `Monitoring round ${i + 1}/${config.monitorRounds}. Metrics: ${metrics.messageCount} messages, ${metrics.memberCount} members, sentiment ${metrics.sentimentScore.toFixed(2)}. Generated ${signal.type} signal with strength ${signal.strength}.`,
      action: 'generate_signal',
      result: { metrics, signal },
      timestamp: Date.now(),
    });

    // Trade if signal is strong
    if (signal.type === 'buy' && signal.strength > 50) {
      log.info('Strong buy signal — executing trade...');
      const { result: tradeResult, proof: tradeProof } = await tradingEngine.evaluateAndTrade(signal, token);
      if (tradeResult.executed) {
        log.success(`Trade executed! TX: ${tradeResult.txDigest}`);
        await telegramBot.postTradeAnnouncement(
          concept.ticker,
          signal.type,
          signal.reason,
          tradeResult.txDigest!,
          tradeProof
        );
      }
      proofs.push(tradeProof);
      log.proof(tradeProof);
    }

    previousMetrics = metrics;
  }

  // ─── Step 5: Self-Evolution ────────────────────────────────
  log.divider();
  log.step(5, 'Self-evolution — searching for new skills...');
  const evolution = await selfEvolve.evolve();
  if (evolution) {
    log.success(`Evolved! Installed: ${evolution.installed}`);
    await telegramBot.postEvolutionAnnouncement(
      evolution.installed!,
      `Searched for "${evolution.query}" skills`,
      evolution.walrusProof
    );
    proofs.push(evolution.walrusProof);
    log.proof(evolution.walrusProof);
  } else {
    log.info('No new skills to install this cycle.');
  }

  // ─── Cycle Complete ────────────────────────────────────────
  log.divider();
  log.banner(`CYCLE #${cycleNumber} COMPLETE`);
  log.success(`Token: $${concept.ticker} (${token.packageId})`);
  log.success(`Proofs stored: ${proofs.length}`);
  log.success(`Explorer: https://suiexplorer.com/object/${token.packageId}?network=testnet`);
}

// ─── CLI Commands ─────────────────────────────────────────────

const program = new Command();

program
  .name('viral-move')
  .description('Viral Move — The Anti-Rug AI Dev on Sui')
  .version('1.0.0');

program
  .command('launch')
  .description('Run one full viral cycle (concept → deploy → spread → monitor → trade → evolve)')
  .action(async () => {
    try {
      await runViralCycle(1);
    } catch (error: any) {
      log.error(`Viral cycle failed: ${error.message}`);
      console.error(error);
      process.exit(1);
    }
  });

program
  .command('loop')
  .description('Run continuous viral cycles autonomously')
  .option('-n, --max-cycles <number>', 'Maximum cycles to run', '10')
  .action(async (opts) => {
    const maxCycles = parseInt(opts.maxCycles);
    const config = loadConfig();

    log.banner('VIRAL MOVE — AUTONOMOUS MODE');
    log.info(`Running up to ${maxCycles} cycles with ${config.pollIntervalMs / 1000}s between cycles`);

    for (let i = 1; i <= maxCycles; i++) {
      try {
        await runViralCycle(i);
      } catch (error: any) {
        log.error(`Cycle ${i} failed: ${error.message}`);
      }
      if (i < maxCycles) {
        log.info(`Waiting ${config.pollIntervalMs / 1000}s before next cycle...`);
        await sleep(config.pollIntervalMs);
      }
    }

    log.banner('ALL CYCLES COMPLETE');
  });

program
  .command('status')
  .description('Show agent status, balance, and configuration')
  .action(async () => {
    const { sui, config, selfEvolve } = initComponents();

    log.banner('VIRAL MOVE — STATUS');
    log.info(`Network: ${config.suiNetwork}`);
    log.info(`Address: ${sui.getAddress()}`);

    const balance = await sui.getBalance();
    log.info(`Balance: ${balance.toFixed(4)} SUI`);

    if (balance < 0.3) {
      log.warn('Low balance! Need at least 0.3 SUI for token deployment.');
    }

    log.info(`TG Channel: ${config.telegramChannelId || 'not configured'}`);
    log.info(`TG Bot: ${config.telegramBotToken ? 'configured' : 'not configured'}`);
    log.info(`Walrus Publisher: ${config.walrusPublisherUrl}`);
    log.info(`Skills installed: ${selfEvolve.getInstalledSkills().length}`);
  });

program
  .command('monitor')
  .description('Run one monitoring round (collect metrics + generate signal)')
  .action(async () => {
    const { telegramBot, sentimentMonitor } = initComponents();

    log.banner('VIRAL MOVE — MONITOR');
    const metrics = await sentimentMonitor.collectMetrics();
    log.info(`Members: ${metrics.memberCount}`);
    log.info(`Messages (1h): ${metrics.messageCount}`);
    log.info(`Emojis: ${metrics.emojiCount}`);
    log.info(`Sentiment: ${metrics.sentimentScore.toFixed(2)}`);

    const signal = sentimentMonitor.generateTradeSignal(metrics);
    log.info(`Signal: ${signal.type.toUpperCase()} (strength: ${signal.strength})`);
    log.info(`Reason: ${signal.reason}`);
  });

program
  .command('evolve')
  .description('Run one self-evolution cycle (search + install skills)')
  .action(async () => {
    const { selfEvolve, telegramBot } = initComponents();

    log.banner('VIRAL MOVE — SELF-EVOLUTION');

    const result = await selfEvolve.evolve();
    if (result) {
      log.success(`Evolved! Installed: ${result.installed}`);
      log.info(`Search query: "${result.query}"`);
      log.info(`Skills found: ${result.skillsFound.length}`);
      log.proof(result.walrusProof);

      await telegramBot.postEvolutionAnnouncement(
        result.installed!,
        `Searched for "${result.query}" skills`,
        result.walrusProof
      );
    } else {
      log.info('No new skills to install.');
    }
  });

program
  .command('history')
  .description('Show recent Walrus proof chain')
  .action(async () => {
    log.banner('VIRAL MOVE — PROOF HISTORY');
    log.info('Proof history is stored on Walrus decentralized storage.');
    log.info('Each proof contains the agent\'s reasoning, action, and result.');
    log.info('');
    log.info('To verify a specific proof, visit:');
    log.info('  https://aggregator.walrus-testnet.walrus.space/v1/blobs/<blobId>');
    log.info('');
    log.info('Proofs are also linked in every Telegram post.');
  });

program.parse();

// ─── Utilities ────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
