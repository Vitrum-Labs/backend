import { WalletAnalysis } from './wallet-analysis.service';

export interface ScoreBreakdown {
  walletAgeScore: number;
  transactionScore: number;
  multichainBonus: number;
  totalScore: number;
  maxScore: number;
}

export interface ReputationScore {
  walletAddress: string;
  score: number;
  breakdown: ScoreBreakdown;
  eligible: boolean;
  tier: string;
  analysis: WalletAnalysis;
}

export class ScoringService {
  // Scoring thresholds
  private readonly ELIGIBLE_THRESHOLD = 100;
  private readonly MAX_WALLET_AGE_SCORE = 60;
  private readonly MAX_TRANSACTION_SCORE = 110;
  private readonly MAX_MULTICHAIN_BONUS = 50;
  private readonly MAX_TOTAL_SCORE = 220;

  /**
   * Calculate wallet age score (0-60 points)
   *
   * Formula (HIGHLY ADJUSTED - Lebih mudah dapat points):
   * - < 7 days (1 week): 15 points - Very new wallet, slight credit
   * - 7-30 days: 20 points - New wallet
   * - 31-90 days (1-3 months): 35 points - Young wallet
   * - 91-180 days (3-6 months): 45 points - Maturing wallet
   * - 181-365 days (6-12 months): 55 points - Established wallet
   * - > 365 days (1+ year): 60 points - Veteran wallet
   */
  private calculateWalletAgeScore(walletAgeDays: number): number {
    if (walletAgeDays < 7) return 15;
    if (walletAgeDays < 31) return 20;
    if (walletAgeDays < 91) return 35;
    if (walletAgeDays < 181) return 45;
    if (walletAgeDays < 365) return 55;
    return 60;
  }

  /**
   * Calculate transaction count score (0-110 points)
   *
   * Formula (HIGHLY ADJUSTED - Sangat mudah dapat points):
   * - < 5 tx: 15 points - Minimal activity
   * - 5-20 tx: 55 points - Low activity
   * - 21-50 tx: 65 points - Moderate activity
   * - 51-100 tx: 80 points - Good activity
   * - 101-500 tx: 95 points - High activity
   * - > 500 tx: 110 points - Very high activity, power user
   */
  private calculateTransactionScore(totalTransactions: number): number {
    if (totalTransactions < 5) return 15;
    if (totalTransactions < 21) return 55;
    if (totalTransactions < 51) return 65;
    if (totalTransactions < 101) return 80;
    if (totalTransactions < 501) return 95;
    return 110;
  }

  /**
   * Calculate multichain activity bonus (0-50 points)
   *
   * Formula (HIGHLY ADJUSTED - Sangat mudah dapat points):
   * - 1 network: 10 points - Single chain user, good credit
   * - 2 networks: 30 points - Starting to explore
   * - 3 networks: 35 points - Multi-chain user
   * - 4 networks: 40 points - Advanced multi-chain user
   * - 5+ networks: 50 points - Cross-chain power user
   *
   * Bonus menunjukkan user yang aktif di berbagai ekosistem,
   * lebih kecil kemungkinannya bot yang hanya farming di 1 chain
   */
  private calculateMultichainBonus(activeNetworks: number): number {
    if (activeNetworks < 2) return 10;
    if (activeNetworks === 2) return 30;
    if (activeNetworks === 3) return 35;
    if (activeNetworks === 4) return 40;
    return 50;
  }

  /**
   * Determine tier based on score
   */
  private determineTier(score: number): string {
    if (score < 50) return 'Suspicious'; // Likely bot/sybil
    if (score < 70) return 'Beginner'; // New user
    if (score < 100) return 'Intermediate'; // Regular user, not eligible yet
    if (score < 110) return 'Advanced'; // Eligible
    return 'Expert'; // Power user, highly trusted
  }

  /**
   * Calculate reputation score from wallet analysis
   */
  calculateScore(analysis: WalletAnalysis): ReputationScore {
    // Calculate individual scores
    const walletAgeScore = this.calculateWalletAgeScore(analysis.walletAge);
    const transactionScore = this.calculateTransactionScore(
      analysis.totalTransactions
    );
    const multichainBonus = this.calculateMultichainBonus(
      analysis.activeNetworks
    );

    // Calculate total score
    const totalScore = walletAgeScore + transactionScore + multichainBonus;

    // Determine eligibility (score >= 100)
    const eligible = totalScore >= this.ELIGIBLE_THRESHOLD;

    // Determine tier
    const tier = this.determineTier(totalScore);

    const breakdown: ScoreBreakdown = {
      walletAgeScore,
      transactionScore,
      multichainBonus,
      totalScore,
      maxScore: this.MAX_TOTAL_SCORE,
    };

    return {
      walletAddress: analysis.walletAddress,
      score: totalScore,
      breakdown,
      eligible,
      tier,
      analysis,
    };
  }

  /**
   * Get scoring formula explanation
   */
  getScoringFormula() {
    return {
      maxScore: this.MAX_TOTAL_SCORE,
      eligibleThreshold: this.ELIGIBLE_THRESHOLD,
      note: 'Formula ADJUSTED - Lebih mudah mencapai eligible threshold',
      components: {
        walletAge: {
          maxScore: this.MAX_WALLET_AGE_SCORE,
          tiers: [
            { range: '< 7 days', score: 15, description: 'Very new wallet, slight credit' },
            { range: '7-30 days', score: 20, description: 'New wallet' },
            { range: '31-90 days', score: 35, description: 'Young wallet' },
            { range: '91-180 days', score: 45, description: 'Maturing wallet' },
            { range: '181-365 days', score: 55, description: 'Established wallet' },
            { range: '> 365 days', score: 60, description: 'Veteran wallet' },
          ],
        },
        transactions: {
          maxScore: this.MAX_TRANSACTION_SCORE,
          tiers: [
            { range: '< 5 tx', score: 15, description: 'Minimal activity' },
            { range: '5-20 tx', score: 55, description: 'Low activity' },
            { range: '21-50 tx', score: 65, description: 'Moderate activity' },
            { range: '51-100 tx', score: 80, description: 'Good activity' },
            { range: '101-500 tx', score: 95, description: 'High activity' },
            { range: '> 500 tx', score: 110, description: 'Very high activity, power user' },
          ],
        },
        multichainBonus: {
          maxScore: this.MAX_MULTICHAIN_BONUS,
          tiers: [
            { range: '1 network', score: 10, description: 'Single chain user, good credit' },
            { range: '2 networks', score: 30, description: 'Starting to explore' },
            { range: '3 networks', score: 35, description: 'Multi-chain user' },
            { range: '4 networks', score: 40, description: 'Advanced multi-chain user' },
            { range: '5+ networks', score: 50, description: 'Cross-chain power user' },
          ],
        },
      },
      tiers: [
        { name: 'Suspicious', range: '< 50', description: 'Very low activity' },
        { name: 'Beginner', range: '50-69', description: 'New user' },
        { name: 'Intermediate', range: '70-99', description: 'Regular user, not eligible yet' },
        { name: 'Advanced', range: '100-149', description: 'Eligible user ✅' },
        { name: 'Expert', range: '150-220', description: 'Power user, highly trusted ⭐' },
      ],
      examples: [
        {
          scenario: 'Wallet 0 hari + 232 tx + 2 networks',
          calculation: '5 + 95 + 30 = 130 points ✅',
          eligible: true,
        },
        {
          scenario: 'Wallet 30 hari + 50 tx + 2 networks',
          calculation: '20 + 65 + 30 = 115 points ✅',
          eligible: true,
        },
        {
          scenario: 'Wallet 90 hari + 50 tx + 2 networks',
          calculation: '35 + 65 + 30 = 130 points ✅',
          eligible: true,
        },
        {
          scenario: 'Wallet 90 hari + 100 tx + 2 networks',
          calculation: '35 + 80 + 30 = 145 points ✅',
          eligible: true,
        },
        {
          scenario: 'Wallet 365+ hari + 500+ tx + 5+ networks',
          calculation: '60 + 110 + 50 = 220 points ⭐',
          eligible: true,
        },
      ],
    };
  }
}

export const scoringService = new ScoringService();
