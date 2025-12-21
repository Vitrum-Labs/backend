import { Router, Request, Response } from 'express';
import { influencerService } from '../services/influencer.service';

const router = Router();

/**
 * POST /api/influencer
 * Create new influencer/creator profile
 * Anyone can create - no reputation requirement
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const influencer = await influencerService.createInfluencer(req.body);

    res.status(201).json({
      success: true,
      data: influencer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create influencer',
    });
  }
});

/**
 * GET /api/influencer
 * Get all influencers
 * Query params:
 *  - sortBy: recent | popular
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const sortBy = req.query.sortBy as 'recent' | 'popular' | undefined;

    const influencers = await influencerService.getAllInfluencers({ sortBy });

    res.json({
      success: true,
      data: influencers,
      count: influencers.length,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get influencers',
    });
  }
});

/**
 * GET /api/influencer/:id
 * Get influencer by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const influencer = await influencerService.getInfluencerById(id);

    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found',
      });
    }

    res.json({
      success: true,
      data: influencer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get influencer',
    });
  }
});

/**
 * GET /api/influencer/wallet/:address
 * Get influencer by wallet address
 */
router.get('/wallet/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const influencer = await influencerService.getInfluencerByWallet(address);

    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found',
      });
    }

    res.json({
      success: true,
      data: influencer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get influencer',
    });
  }
});

export default router;
