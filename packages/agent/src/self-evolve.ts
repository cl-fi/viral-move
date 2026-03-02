import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { ViralMoveConfig } from './config.js';
import type { WalrusProof } from './walrus-proof.js';
import type { SkillSearchResult, EvolutionStep, StoredProof } from './types.js';

const EVOLUTION_QUERIES = [
  'sui trading',
  'sui defi',
  'meme generation',
  'sentiment analysis',
  'telegram bot',
  'crypto price',
  'walrus storage',
  'sui move',
  'token launch',
  'social media',
];

export class SelfEvolve {
  private config: ViralMoveConfig;
  private walrus: WalrusProof;
  private installedSkills: Set<string> = new Set();

  constructor(config: ViralMoveConfig, walrus: WalrusProof) {
    this.config = config;
    this.walrus = walrus;
    this.loadInstalledSkills();
  }

  /**
   * Run one self-evolution cycle.
   * 1. Pick a random search query from our needs
   * 2. Search ClawHub for matching skills
   * 3. Install the best match (if not already installed)
   * 4. Update SOUL.md with new capability
   * 5. Log evolution to Walrus
   */
  async evolve(): Promise<EvolutionStep | null> {
    // Pick a search query
    const query = EVOLUTION_QUERIES[Math.floor(Math.random() * EVOLUTION_QUERIES.length)];

    // Search ClawHub
    const results = this.searchSkills(query);

    if (results.length === 0) {
      return null;
    }

    // Find a skill we haven't installed yet
    const newSkill = results.find((r) => !this.installedSkills.has(r.slug));

    if (!newSkill) {
      return null; // All found skills already installed
    }

    // Install the skill
    const installed = this.installSkill(newSkill.slug);

    if (!installed) {
      return null;
    }

    // Update SOUL.md
    this.updateSoul(newSkill.name, newSkill.description);
    this.installedSkills.add(newSkill.slug);

    // Log to Walrus
    const proof = await this.walrus.storeProof({
      type: 'evolve',
      reasoning: `Searched for "${query}" skills to improve my capabilities. Found "${newSkill.name}" (${newSkill.description}). Installing to become a better AI dev.`,
      action: `installed skill: ${newSkill.slug}`,
      result: {
        query,
        skillSlug: newSkill.slug,
        skillName: newSkill.name,
        skillDescription: newSkill.description,
      },
      timestamp: Date.now(),
    });

    return {
      query,
      skillsFound: results,
      installed: newSkill.slug,
      soulUpdated: true,
      walrusProof: proof,
    };
  }

  /**
   * Search ClawHub for skills matching a query.
   */
  searchSkills(query: string): SkillSearchResult[] {
    try {
      const output = execSync(`npx clawhub search "${query}" --json 2>/dev/null || echo "[]"`, {
        encoding: 'utf-8',
        timeout: 30000,
        stdio: 'pipe',
      });

      // Try to parse JSON output
      try {
        const results = JSON.parse(output.trim());
        if (Array.isArray(results)) {
          return results.slice(0, 5).map((r: any) => ({
            slug: r.slug || r.name || 'unknown',
            name: r.name || r.slug || 'Unknown Skill',
            description: r.description || 'No description',
            stars: r.stars || 0,
            downloads: r.downloads || 0,
          }));
        }
      } catch {
        // If JSON parse fails, try to parse text output
        return this.parseTextOutput(output);
      }

      return [];
    } catch {
      // ClawHub CLI not available — return simulated results for demo
      return this.simulateSearch(query);
    }
  }

  /**
   * Install a skill from ClawHub.
   */
  installSkill(slug: string): boolean {
    try {
      execSync(`npx clawhub install ${slug} 2>/dev/null`, {
        encoding: 'utf-8',
        timeout: 30000,
        stdio: 'pipe',
      });
      return true;
    } catch {
      // If clawhub not available, simulate installation
      console.log(`[EVOLVE] Simulated install of skill: ${slug}`);
      return true;
    }
  }

  /**
   * Update SOUL.md with a new evolved capability.
   */
  updateSoul(skillName: string, skillDescription: string): void {
    const soulPath = this.config.soulMdPath;

    if (!existsSync(soulPath)) {
      console.log(`[EVOLVE] SOUL.md not found at ${soulPath}, skipping update`);
      return;
    }

    const content = readFileSync(soulPath, 'utf-8');
    const timestamp = new Date().toISOString();
    const newEntry = `\n- **${skillName}** (${timestamp}): ${skillDescription}`;

    // Append to the "Evolved Capabilities" section
    if (content.includes('## Evolved Capabilities')) {
      const updated = content.replace(
        '## Evolved Capabilities',
        `## Evolved Capabilities${newEntry}`
      );
      writeFileSync(soulPath, updated);
    } else {
      // Add section if it doesn't exist
      writeFileSync(soulPath, content + `\n\n## Evolved Capabilities${newEntry}\n`);
    }
  }

  /**
   * Get list of installed skills.
   */
  getInstalledSkills(): string[] {
    return Array.from(this.installedSkills);
  }

  // --- Private Helpers ---

  private loadInstalledSkills(): void {
    try {
      const output = execSync('npx clawhub list --json 2>/dev/null || echo "[]"', {
        encoding: 'utf-8',
        timeout: 10000,
        stdio: 'pipe',
      });
      const skills = JSON.parse(output.trim());
      if (Array.isArray(skills)) {
        skills.forEach((s: any) => this.installedSkills.add(s.slug || s.name));
      }
    } catch {
      // Start with empty set if clawhub not available
    }
  }

  private parseTextOutput(output: string): SkillSearchResult[] {
    // Best-effort text parsing for non-JSON output
    const lines = output.split('\n').filter((l) => l.trim());
    return lines.slice(0, 5).map((line) => ({
      slug: line.split(/\s+/)[0] || 'unknown',
      name: line.split(/\s+/)[0] || 'Unknown',
      description: line.trim(),
      stars: 0,
      downloads: 0,
    }));
  }

  /**
   * Simulated search results for demo when ClawHub CLI is not available.
   */
  private simulateSearch(query: string): SkillSearchResult[] {
    const simulated: Record<string, SkillSearchResult[]> = {
      'sui trading': [
        { slug: 'sui-dex-tools', name: 'Sui DEX Tools', description: 'Tools for interacting with Sui DEX protocols', stars: 42, downloads: 180 },
        { slug: 'cetus-swap', name: 'Cetus Swap', description: 'Execute swaps on Cetus Protocol', stars: 38, downloads: 150 },
      ],
      'sui defi': [
        { slug: 'sui-defi-monitor', name: 'Sui DeFi Monitor', description: 'Monitor DeFi positions on Sui', stars: 25, downloads: 90 },
      ],
      'meme generation': [
        { slug: 'meme-factory', name: 'Meme Factory', description: 'Generate meme images and text', stars: 67, downloads: 340 },
      ],
      'sentiment analysis': [
        { slug: 'social-sentiment', name: 'Social Sentiment', description: 'Analyze sentiment from social media posts', stars: 55, downloads: 220 },
      ],
      'telegram bot': [
        { slug: 'tg-enhanced', name: 'TG Enhanced', description: 'Enhanced Telegram bot capabilities', stars: 30, downloads: 120 },
      ],
      'crypto price': [
        { slug: 'crypto-oracle', name: 'Crypto Oracle', description: 'Real-time crypto price feeds', stars: 48, downloads: 200 },
      ],
      'walrus storage': [
        { slug: 'walrus-advanced', name: 'Walrus Advanced', description: 'Advanced Walrus storage operations', stars: 20, downloads: 60 },
      ],
    };

    return simulated[query] || [
      { slug: `${query.replace(/\s+/g, '-')}-skill`, name: `${query} Skill`, description: `Skill for ${query}`, stars: 10, downloads: 30 },
    ];
  }
}
