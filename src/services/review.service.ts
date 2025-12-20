import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { Review, CreateReviewDto, ReviewSentiment } from '../models/review.model';
import { storageService } from './storage.service';
import { reputationService } from './reputation.service';
import { influencerService } from './influencer.service';

export class ReviewService {
  /**
   * Create new review (vote bullish/bearish)
   * Requires: reviewer wallet score >= 100 (eligible)
   */
  async createReview(dto: CreateReviewDto): Promise<Review> {
    // Validate wallet address
    if (!ethers.isAddress(dto.reviewerWalletAddress)) {
      throw new Error('Invalid reviewer wallet address');
    }

    // Check if influencer exists
    const influencer = storageService.getInfluencerById(dto.influencerId);
    if (!influencer) {
      throw new Error('Influencer not found');
    }

    // Validate reputation score (must be >= 100 to vote)
    const reputation = await reputationService.getQuickReputation(dto.reviewerWalletAddress);
    if (!reputation.eligible) {
      throw new Error(
        `Wallet not eligible to vote. Score: ${reputation.score}. Required: 100 or higher.`
      );
    }

    // Check if user already reviewed this influencer
    const hasReviewed = storageService.hasReviewedInfluencer(
      dto.reviewerWalletAddress,
      dto.influencerId
    );
    if (hasReviewed) {
      throw new Error('You have already reviewed this influencer');
    }

    // Validate sentiment
    if (dto.sentiment !== ReviewSentiment.BULLISH && dto.sentiment !== ReviewSentiment.BEARISH) {
      throw new Error('Sentiment must be either "bullish" or "bearish"');
    }

    // Create review
    const review: Review = {
      id: uuidv4(),
      influencerId: dto.influencerId,
      reviewerWalletAddress: dto.reviewerWalletAddress.toLowerCase(),
      sentiment: dto.sentiment,
      comment: dto.comment?.trim(),
      createdAt: Date.now(),
    };

    // Save review
    const savedReview = storageService.createReview(review);

    // Update influencer stats
    influencerService.updateInfluencerStats(dto.influencerId, dto.sentiment);

    return savedReview;
  }

  /**
   * Get review by ID
   */
  getReviewById(id: string): Review | null {
    return storageService.getReviewById(id);
  }

  /**
   * Get all reviews for an influencer
   */
  getReviewsByInfluencer(influencerId: string): Review[] {
    return storageService.getReviewsByInfluencer(influencerId);
  }

  /**
   * Get all reviews by a reviewer
   */
  getReviewsByReviewer(reviewerWallet: string): Review[] {
    if (!ethers.isAddress(reviewerWallet)) {
      return [];
    }
    return storageService.getReviewsByReviewer(reviewerWallet);
  }

  /**
   * Get review stats for an influencer
   */
  getInfluencerReviewStats(influencerId: string) {
    const reviews = this.getReviewsByInfluencer(influencerId);

    const bullishCount = reviews.filter((r) => r.sentiment === ReviewSentiment.BULLISH).length;
    const bearishCount = reviews.filter((r) => r.sentiment === ReviewSentiment.BEARISH).length;
    const totalReviews = reviews.length;
    const sentimentScore = totalReviews > 0 ? (bullishCount / totalReviews) * 100 : 0;

    return {
      totalReviews,
      bullishCount,
      bearishCount,
      sentimentScore: Math.round(sentimentScore * 10) / 10, // Round to 1 decimal
    };
  }

  /**
   * Check if wallet has reviewed influencer
   */
  hasReviewed(reviewerWallet: string, influencerId: string): boolean {
    if (!ethers.isAddress(reviewerWallet)) {
      return false;
    }
    return storageService.hasReviewedInfluencer(reviewerWallet, influencerId);
  }
}

export const reviewService = new ReviewService();
