import { Router, Request, Response } from 'express';
import { reviewService } from '../services/review.service';

const router = Router();

/**
 * POST /api/review
 * Create new review/comment
 * Requires: reviewer wallet score >= 100
 * Note: Bullish/bearish votes handled by smart contract
 * Body: { influencerId, reviewerWalletAddress, comment }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const review = await reviewService.createReview(req.body);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create review',
    });
  }
});

/**
 * GET /api/review/influencer/:influencerId
 * Get all reviews for an influencer
 */
router.get('/influencer/:influencerId', async (req: Request, res: Response) => {
  try {
    const { influencerId } = req.params;
    const reviews = await reviewService.getReviewsByInfluencer(influencerId);

    res.json({
      success: true,
      data: reviews,
      count: reviews.length,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get reviews',
    });
  }
});

/**
 * GET /api/review/influencer/:influencerId/count
 * Get review count for an influencer
 */
router.get('/influencer/:influencerId/count', async (req: Request, res: Response) => {
  try {
    const { influencerId } = req.params;
    const stats = await reviewService.getInfluencerReviewCount(influencerId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get review count',
    });
  }
});

/**
 * GET /api/review/reviewer/:walletAddress
 * Get all reviews by a reviewer
 */
router.get('/reviewer/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const reviews = await reviewService.getReviewsByReviewer(walletAddress);

    res.json({
      success: true,
      data: reviews,
      count: reviews.length,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get reviews',
    });
  }
});

/**
 * GET /api/review/check/:walletAddress/:influencerId
 * Check if wallet has reviewed influencer
 */
router.get('/check/:walletAddress/:influencerId', async (req: Request, res: Response) => {
  try {
    const { walletAddress, influencerId } = req.params;
    const hasReviewed = await reviewService.hasReviewed(walletAddress, influencerId);

    res.json({
      success: true,
      data: {
        hasReviewed,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to check review status',
    });
  }
});

/**
 * GET /api/review/:id
 * Get review by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await reviewService.getReviewById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get review',
    });
  }
});

export default router;
