import { ethers } from 'ethers';
import { walletAnalysisService } from './wallet-analysis.service';
import { scoringService, ReputationScore } from './scoring.service';
import { cache, CacheKeys } from '../utils/cache';

export class ReputationService {
  /**
   * Get full reputation score for a wallet
   * This is the main method that combines wallet analysis and scoring
   */
  async getReputationScore(walletAddress: string): Promise<ReputationScore> {
    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    // Check cache first
    const cacheKey = CacheKeys.walletScore(walletAddress);
    const cached = cache.get<ReputationScore>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Step 1: Analyze wallet across all networks
      const analysis = await walletAnalysisService.analyzeWallet(walletAddress);

      // Step 2: Calculate reputation score based on analysis
      const reputationScore = scoringService.calculateScore(analysis);

      // Cache for 5 minutes
      cache.set(cacheKey, reputationScore, 5 * 60 * 1000);

      return reputationScore;
    } catch (error: any) {
      throw new Error(`Failed to get reputation score: ${error.message}`);
    }
  }

  /**
   * Get quick reputation check (faster, less detailed)
   */
  async getQuickReputation(walletAddress: string) {
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    try {
      const quickStats = await walletAnalysisService.getQuickStats(walletAddress);

      // Simple scoring for quick check (HIGHLY ADJUSTED - matching main scoring)
      const walletAgeScore = quickStats.walletAge >= 365 ? 60 : quickStats.walletAge >= 181 ? 55 : quickStats.walletAge >= 91 ? 45 : quickStats.walletAge >= 31 ? 35 : quickStats.walletAge >= 7 ? 20 : 15;
      const txScore = quickStats.totalTransactions >= 500 ? 110 : quickStats.totalTransactions >= 101 ? 95 : quickStats.totalTransactions >= 51 ? 80 : quickStats.totalTransactions >= 21 ? 65 : quickStats.totalTransactions >= 5 ? 55 : 15;
      const multichainBonus = quickStats.activeNetworks >= 5 ? 50 : quickStats.activeNetworks >= 4 ? 40 : quickStats.activeNetworks >= 3 ? 35 : quickStats.activeNetworks >= 2 ? 30 : 10;

      const totalScore = walletAgeScore + txScore + multichainBonus;

      return {
        walletAddress,
        score: totalScore,
        eligible: totalScore >= 100,
        walletAge: quickStats.walletAge,
        totalTransactions: quickStats.totalTransactions,
        activeNetworks: quickStats.activeNetworks,
      };
    } catch (error: any) {
      throw new Error(`Failed to get quick reputation: ${error.message}`);
    }
  }

  /**
   * Batch check multiple wallets (for bulk verification)
   */
  async batchCheckReputation(walletAddresses: string[]) {
    // Validate all addresses
    const validAddresses = walletAddresses.filter((addr) =>
      ethers.isAddress(addr)
    );

    if (validAddresses.length === 0) {
      throw new Error('No valid wallet addresses provided');
    }

    // Process in parallel with limit to avoid rate limiting
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < validAddresses.length; i += batchSize) {
      const batch = validAddresses.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (addr) => {
          try {
            return await this.getQuickReputation(addr);
          } catch (error: any) {
            return {
              walletAddress: addr,
              error: error.message,
            };
          }
        })
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get scoring formula explanation
   */
  getScoringFormula() {
    return scoringService.getScoringFormula();
  }
}

export const reputationService = new ReputationService();
