import { Router, Request, Response } from 'express';
import { reputationService } from '../services/reputation.service';
import { walletAnalysisService } from '../services/wallet-analysis.service';

const router = Router();

/**
 * GET /api/reputation/:wallet
 * Get full reputation score with detailed breakdown
 * Response: { score, breakdown, eligible, tier, analysis }
 */
router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const reputation = await reputationService.getReputationScore(wallet);

    res.json({
      success: true,
      data: reputation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get reputation score',
    });
  }
});

/**
 * GET /api/reputation/:wallet/quick
 * Get quick reputation check (faster, less detailed)
 * Response: { score, eligible, walletAge, totalTransactions, activeNetworks }
 */
router.get('/:wallet/quick', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const reputation = await reputationService.getQuickReputation(wallet);

    res.json({
      success: true,
      data: reputation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get quick reputation',
    });
  }
});

/**
 * POST /api/reputation/batch
 * Batch check reputation for multiple wallets
 * Body: { wallets: string[] }
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { wallets } = req.body;

    if (!Array.isArray(wallets)) {
      return res.status(400).json({
        success: false,
        error: 'wallets must be an array',
      });
    }

    const results = await reputationService.batchCheckReputation(wallets);

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to batch check reputation',
    });
  }
});

/**
 * GET /api/reputation/:wallet/analysis
 * Get detailed wallet analysis across all networks
 */
router.get('/:wallet/analysis', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const analysis = await walletAnalysisService.analyzeWallet(wallet);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get wallet analysis',
    });
  }
});

/**
 * GET /api/reputation/formula
 * Get scoring formula explanation
 */
router.get('/formula', async (req: Request, res: Response) => {
  try {
    const formula = reputationService.getScoringFormula();

    res.json({
      success: true,
      data: formula,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get formula',
    });
  }
});

export default router;
