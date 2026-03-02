import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, resolve } from 'path';
import { Transaction } from '@mysten/sui/transactions';
import type { ViralMoveConfig } from './config.js';
import type { SuiClientWrapper } from './sui-client.js';
import type { TokenConcept, DeployedToken } from './types.js';

export class TokenFactory {
  private config: ViralMoveConfig;
  private sui: SuiClientWrapper;

  constructor(config: ViralMoveConfig, sui: SuiClientWrapper) {
    this.config = config;
    this.sui = sui;
  }

  /**
   * Full pipeline: concept → Move package → build → publish → mint
   */
  async deployToken(concept: TokenConcept): Promise<DeployedToken> {
    // Step 1: Generate Move package from template
    const packageDir = this.generateMovePackage(concept);

    // Step 2: Build
    this.buildMovePackage(packageDir);

    // Step 3: Publish
    const publishResult = await this.publishPackage(packageDir, concept);

    // Step 4: Mint initial supply (optional — skip if TreasuryCap not found)
    if (concept.initialSupply > 0n && publishResult.treasuryCapId) {
      try {
        const mintDigest = await this.mintTokens(
          publishResult.treasuryCapId,
          publishResult.coinType,
          concept.initialSupply,
          this.sui.getAddress()
        );
        publishResult.mintTxDigest = mintDigest;
        publishResult.totalSupply = concept.initialSupply;
      } catch (error: any) {
        console.log(`[WARN] Mint skipped: ${error.message}`);
      }
    }

    return publishResult;
  }

  /**
   * Generate a Move package directory from templates.
   * Each token gets its own package (OTW pattern requires unique module).
   */
  generateMovePackage(concept: TokenConcept): string {
    // Sanitize: package name must be lowercase alphanumeric + underscore
    const packageName = concept.ticker.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Witness must be UPPERCASE and match the module name after ::
    const witnessName = concept.ticker.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const templateDir = resolve(this.config.tokenTemplateDir);
    const generatedDir = resolve(this.config.generatedContractsDir);
    const packageDir = join(generatedDir, packageName);

    // Create package directory
    mkdirSync(join(packageDir, 'sources'), { recursive: true });

    // Read and populate Move.toml template
    const moveTomlTemplate = readFileSync(join(templateDir, 'Move.toml.template'), 'utf-8');
    const moveToml = moveTomlTemplate
      .replace(/\{\{PACKAGE_NAME\}\}/g, packageName);
    writeFileSync(join(packageDir, 'Move.toml'), moveToml);

    // Read and populate Move source template
    const moveSrcTemplate = readFileSync(join(templateDir, 'sources', 'token.move.template'), 'utf-8');

    // Escape description for Move byte string (no special chars)
    const safeDescription = concept.description
      .replace(/[^\x20-\x7E]/g, '')  // ASCII printable only
      .slice(0, 200);                  // Max length

    const moveSrc = moveSrcTemplate
      .replace(/\{\{PACKAGE_NAME\}\}/g, packageName)
      .replace(/\{\{WITNESS_NAME\}\}/g, witnessName)
      .replace(/\{\{DECIMALS\}\}/g, String(concept.decimals))
      .replace(/\{\{SYMBOL\}\}/g, concept.ticker.toUpperCase())
      .replace(/\{\{NAME\}\}/g, concept.name)
      .replace(/\{\{DESCRIPTION\}\}/g, safeDescription);

    writeFileSync(join(packageDir, 'sources', `${packageName}.move`), moveSrc);

    return packageDir;
  }

  /**
   * Build the Move package using sui CLI.
   */
  buildMovePackage(packageDir: string): void {
    try {
      execSync(`sui move build -p "${packageDir}"`, {
        encoding: 'utf-8',
        timeout: 120000,  // 2 min timeout for dependency fetch
        stdio: 'pipe',
      });
    } catch (error: any) {
      throw new Error(`Move build failed: ${error.stderr || error.message}`);
    }
  }

  /**
   * Publish the Move package to Sui and extract created objects.
   */
  async publishPackage(packageDir: string, concept: TokenConcept): Promise<DeployedToken> {
    // sui client publish may exit non-zero even on success (e.g. dry-run warnings)
    // Redirect stderr to stdout to capture all output, then look for JSON
    let rawOutput: string;
    try {
      rawOutput = execSync(
        `sui client publish "${packageDir}" --gas-budget 500000000 --skip-dependency-verification --json 2>&1`,
        {
          encoding: 'utf-8',
          timeout: 120000,
          shell: '/bin/bash',
        }
      );
    } catch (error: any) {
      // Even with 2>&1, execSync may throw if exit code is non-zero
      rawOutput = error.stdout || error.stderr || '';
      if (!rawOutput.includes('"digest"')) {
        throw new Error(`Move publish failed: ${rawOutput.slice(0, 500)}`);
      }
    }

    // Extract JSON from output (may have build warnings before AND after it)
    // Find the first '{' that starts a JSON object and the last '}' that closes it
    const jsonStart = rawOutput.indexOf('{');
    let result: any = null;

    if (jsonStart !== -1) {
      // Try to extract valid JSON by finding the matching closing brace
      // Search from the end of the string backwards for the last '}'
      const jsonEnd = rawOutput.lastIndexOf('}');
      if (jsonEnd > jsonStart) {
        const candidate = rawOutput.slice(jsonStart, jsonEnd + 1);
        try {
          result = JSON.parse(candidate);
        } catch {
          // If that fails, try the original approach: first '{"' to end
          const altStart = rawOutput.indexOf('{"');
          if (altStart !== -1) {
            try {
              result = JSON.parse(rawOutput.slice(altStart, jsonEnd + 1));
            } catch {
              // Could not parse JSON at all — fall through to Published.toml fallback
            }
          }
        }
      }
    }

    if (!result) {
      // Maybe the publish succeeded — check for Published.toml
      const publishedPath = join(packageDir, 'Published.toml');
      if (existsSync(publishedPath)) {
        // Package was published but JSON output not captured
        // Parse Published.toml to get the package ID, then query chain for TreasuryCap
        const published = readFileSync(publishedPath, 'utf-8');
        const match = published.match(/published-at\s*=\s*"(0x[a-f0-9]+)"/);
        if (match) {
          const packageId = match[1];
          const packageName = concept.ticker.toLowerCase().replace(/[^a-z0-9]/g, '');
          const witnessName = concept.ticker.toUpperCase().replace(/[^A-Z0-9]/g, '');
          const coinType = `${packageId}::${packageName}::${witnessName}`;

          // Query chain for TreasuryCap owned by this address
          // Retry up to 5 times with 2s delay to handle indexer lag
          const treasuryCapType = `0x2::coin::TreasuryCap<${coinType}>`;
          let treasuryCapId = '';
          const maxRetries = 5;
          const retryDelayMs = 2000;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const ownedObjects = await this.sui.getClient().getOwnedObjects({
              owner: this.sui.getAddress(),
              filter: { StructType: treasuryCapType },
              options: { showType: true },
            });

            treasuryCapId = ownedObjects.data?.[0]?.data?.objectId || '';
            if (treasuryCapId) {
              break;
            }

            if (attempt < maxRetries) {
              console.log(
                `[INFO] TreasuryCap not found yet (attempt ${attempt}/${maxRetries}), ` +
                `retrying in ${retryDelayMs / 1000}s...`
              );
              await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
            }
          }

          if (!treasuryCapId) {
            console.log(
              `[WARN] TreasuryCap not found after ${maxRetries} attempts. ` +
              `The indexer may still be catching up. PackageId: ${packageId}`
            );
          }

          return {
            packageId,
            treasuryCapId,
            metadataId: '',
            coinType,
            totalSupply: 0n,
            deployTxDigest: 'published-via-cli',
          };
        }
      }
      throw new Error(`No JSON in publish output: ${rawOutput.slice(0, 500)}`);
    }

    if (result.effects?.status?.status !== 'success') {
      throw new Error(`Publish tx failed: ${JSON.stringify(result.effects?.status)}`);
    }

    const created = result.effects?.created || [];
    const objectChanges = result.objectChanges || [];

    // Find package ID — published package in objectChanges
    const publishedPkg = objectChanges.find(
      (o: any) => o.type === 'published'
    );
    const packageId = publishedPkg?.packageId;

    if (!packageId) {
      throw new Error('Could not find packageId in publish result');
    }

    // Derive coin type and module/witness names
    const packageName = concept.ticker.toLowerCase().replace(/[^a-z0-9]/g, '');
    const witnessName = concept.ticker.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const coinType = `${packageId}::${packageName}::${witnessName}`;

    // Find TreasuryCap (AddressOwner) and CoinMetadata (Immutable after freeze)
    let treasuryCapId = '';
    let metadataId = '';

    for (const obj of objectChanges) {
      if (obj.type === 'created' && obj.objectType) {
        if (obj.objectType.includes('TreasuryCap')) {
          treasuryCapId = obj.objectId;
        } else if (obj.objectType.includes('CoinMetadata')) {
          metadataId = obj.objectId;
        }
      }
    }

    if (!treasuryCapId) {
      // Fallback: search in effects.created
      for (const obj of created) {
        if (obj.owner && typeof obj.owner === 'object' && 'AddressOwner' in obj.owner) {
          treasuryCapId = obj.reference?.objectId || '';
          break;
        }
      }
    }

    return {
      packageId,
      treasuryCapId,
      metadataId,
      coinType,
      totalSupply: 0n,
      deployTxDigest: result.digest,
    };
  }

  /**
   * Mint tokens using TreasuryCap.
   */
  async mintTokens(
    treasuryCapId: string,
    coinType: string,
    amount: bigint,
    recipient: string
  ): Promise<string> {
    const tx = new Transaction();
    tx.moveCall({
      target: '0x2::coin::mint_and_transfer',
      typeArguments: [coinType],
      arguments: [
        tx.object(treasuryCapId),
        tx.pure.u64(amount),
        tx.pure.address(recipient),
      ],
    });

    const result = await this.sui.signAndExecute(tx, {
      showEffects: true,
    });

    if (result.effects?.status?.status !== 'success') {
      throw new Error(`Mint failed: ${JSON.stringify(result.effects?.status)}`);
    }

    return result.digest;
  }
}
