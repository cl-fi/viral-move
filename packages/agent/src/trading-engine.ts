import { Transaction } from '@mysten/sui/transactions';
import type { SuiClientWrapper } from './sui-client.js';
import type { WalrusProof } from './walrus-proof.js';
import type { TradeSignal, DeployedToken, TradeResult, StoredProof } from './types.js';

export class TradingEngine {
  private sui: SuiClientWrapper;
  private walrus: WalrusProof;

  constructor(sui: SuiClientWrapper, walrus: WalrusProof) {
    this.sui = sui;
    this.walrus = walrus;
  }

  /**
   * Evaluate a trade signal and execute if threshold met.
   * Every trade is logged to Walrus with full reasoning.
   */
  async evaluateAndTrade(
    signal: TradeSignal,
    token: DeployedToken
  ): Promise<{ result: TradeResult; proof: StoredProof }> {
    // Only trade on strong buy signals
    if (signal.type !== 'buy' || signal.strength < 50) {
      const result: TradeResult = {
        executed: false,
        reason: `Signal too weak: ${signal.type} (strength: ${signal.strength})`,
      };

      const proof = await this.walrus.storeProof({
        type: 'trade',
        reasoning: `Decided NOT to trade. Signal: ${signal.type}, strength: ${signal.strength}. ${signal.reason}`,
        action: 'no_trade',
        result: { signal, decision: 'hold' },
        timestamp: Date.now(),
      });

      return { result, proof };
    }

    // Execute proof-of-concept trade: SUI self-transfer
    // In production, this would be a Cetus DEX swap
    try {
      const amount = BigInt(1_000_000); // 0.001 SUI
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
      tx.transferObjects([coin], tx.pure.address(this.sui.getAddress()));

      const txResult = await this.sui.signAndExecute(tx, {
        showEffects: true,
      });

      const tradeResult: TradeResult = {
        executed: true,
        txDigest: txResult.digest,
        amount: Number(amount) / 1e9,
        reason: `Strong buy signal (${signal.strength}): ${signal.reason}`,
      };

      // Log to Walrus with full reasoning
      const proof = await this.walrus.storeProof({
        type: 'trade',
        reasoning: `Executed trade based on social signals. Signal: ${signal.type}, strength: ${signal.strength}. Reasons: ${signal.reason}. Token: ${token.coinType}`,
        action: 'buy',
        result: {
          txDigest: txResult.digest,
          amount: Number(amount) / 1e9,
          signal,
          tokenPackageId: token.packageId,
        },
        txDigest: txResult.digest,
        timestamp: Date.now(),
      });

      tradeResult.walrusBlobId = proof.blobId;

      return { result: tradeResult, proof };
    } catch (error: any) {
      const tradeResult: TradeResult = {
        executed: false,
        reason: `Trade execution failed: ${error.message}`,
      };

      const proof = await this.walrus.storeProof({
        type: 'trade',
        reasoning: `Attempted trade but failed. Signal was: ${signal.type}, strength: ${signal.strength}. Error: ${error.message}`,
        action: 'trade_failed',
        result: { error: error.message, signal },
        timestamp: Date.now(),
      });

      return { result: tradeResult, proof };
    }
  }
}
