import { Router, Request, Response } from 'express';
import { reputationService } from '../services/reputation.service';
import { cache } from '../utils/cache';

const router = Router();

/**
 * GET /api/status/:wallet
 * Get wallet status (quick check for eligibility)
 * Response: { score: number, eligible: boolean, tier: string, walletAge: number, totalTransactions: number }
 */
router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    // Use quick reputation for faster response
    const reputation = await reputationService.getQuickReputation(wallet);

    res.json({
      success: true,
      data: {
        walletAddress: reputation.walletAddress,
        score: reputation.score,
        eligible: reputation.eligible,
        walletAge: reputation.walletAge,
        totalTransactions: reputation.totalTransactions,
        activeNetworks: reputation.activeNetworks,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get wallet status',
    });
  }
});

/**
 * GET /api/status/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', async (req: Request, res: Response) => {
  try {
    const stats = cache.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get cache stats',
    });
  }
});

/**
 * POST /api/status/cache/clear
 * Clear cache (admin function)
 */
router.post('/cache/clear', async (req: Request, res: Response) => {
  try {
    cache.clear();

    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to clear cache',
    });
  }
});

export default router;
