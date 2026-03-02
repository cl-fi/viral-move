import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import type { Keypair } from '@mysten/sui/cryptography';
import type { ViralMoveConfig } from './config.js';
import { loadPrivateKey } from './config.js';

export class SuiClientWrapper {
  private client: SuiClient;
  private keypair: Keypair;
  private config: ViralMoveConfig;

  constructor(config: ViralMoveConfig) {
    this.config = config;
    this.client = new SuiClient({ url: getFullnodeUrl(config.suiNetwork) });

    const privateKey = loadPrivateKey(config);

    if (privateKey.startsWith('suiprivkey')) {
      const { schema, secretKey } = decodeSuiPrivateKey(privateKey);
      if (schema === 'Secp256k1') {
        this.keypair = Secp256k1Keypair.fromSecretKey(secretKey);
      } else {
        this.keypair = Ed25519Keypair.fromSecretKey(secretKey);
      }
    } else {
      // Fallback: assume ed25519 raw key
      this.keypair = Ed25519Keypair.fromSecretKey(privateKey);
    }
  }

  getAddress(): string {
    return this.keypair.toSuiAddress();
  }

  getClient(): SuiClient {
    return this.client;
  }

  getKeypair(): Keypair {
    return this.keypair;
  }

  async getBalance(): Promise<number> {
    const balance = await this.client.getBalance({
      owner: this.getAddress(),
      coinType: '0x2::sui::SUI',
    });
    return Number(balance.totalBalance) / 1_000_000_000;
  }

  async signAndExecute(
    tx: Transaction,
    options?: { showEffects?: boolean; showEvents?: boolean; showObjectChanges?: boolean }
  ) {
    return await this.client.signAndExecuteTransaction({
      transaction: tx,
      signer: this.keypair,
      options: options ?? { showEffects: true },
    });
  }
}
