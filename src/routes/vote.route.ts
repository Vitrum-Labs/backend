import { Router, Request, Response } from 'express';
import { voteService } from '../services/vote.service';

const router = Router();

/**
 * POST /api/vote
 * Create new vote (bullish/bearish)
 * Requirements:
 * - Voter must have reputation score >= 100
 * - One vote per wallet per influencer (permanent, no changes)
 * Body: { influencerId, voterWalletAddress, voteType }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const vote = await voteService.createVote(req.body);

    res.status(201).json({
      success: true,
      data: vote,
      message: `Vote "${vote.voteType}" recorded successfully. This vote is permanent and cannot be changed.`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create vote',
    });
  }
});

/**
 * GET /api/vote/influencer/:influencerId/stats
 * Get vote statistics for an influencer
 * Response: { bullishVotes, bearishVotes, totalVotes, netSentiment, sentimentPercentage }
 */
router.get('/influencer/:influencerId/stats', async (req: Request, res: Response) => {
  try {
    const { influencerId } = req.params;
    const stats = await voteService.getVoteStats(influencerId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get vote stats',
    });
  }
});

/**
 * GET /api/vote/influencer/:influencerId
 * Get all votes for an influencer
 */
router.get('/influencer/:influencerId', async (req: Request, res: Response) => {
  try {
    const { influencerId } = req.params;
    const votes = await voteService.getVotesByInfluencer(influencerId);

    res.json({
      success: true,
      data: votes,
      count: votes.length,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get votes',
    });
  }
});

/**
 * GET /api/vote/check/:walletAddress/:influencerId
 * Check if wallet has voted for influencer
 * Response: { hasVoted: boolean, vote: Vote | null }
 */
router.get('/check/:walletAddress/:influencerId', async (req: Request, res: Response) => {
  try {
    const { walletAddress, influencerId } = req.params;
    const vote = await voteService.getVoteByWalletAndInfluencer(walletAddress, influencerId);

    res.json({
      success: true,
      data: {
        hasVoted: vote !== null,
        vote: vote,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to check vote status',
    });
  }
});

export default router;
