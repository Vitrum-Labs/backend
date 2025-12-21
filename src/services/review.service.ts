import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { Review, CreateReviewDto } from '../models/review.model';
import { storageService } from './storage.service';
import { reputationService } from './reputation.service';
import { influencerService } from './influencer.service';

export class ReviewService {
  /**
   * Create new review/comment
   * Requires: reviewer wallet score >= 100 (eligible)
   * Note: Bullish/bearish votes are handled by smart contract
   */
  async createReview(dto: CreateReviewDto): Promise<Review> {
    // Validate wallet address
    if (!ethers.isAddress(dto.reviewerWalletAddress)) {
      throw new Error('Invalid reviewer wallet address');
    }

    // Check if influencer exists
    const influencer = await storageService.getInfluencerById(dto.influencerId);
    if (!influencer) {
      throw new Error('Influencer not found');
    }

    // Validate reputation score (must be >= 100 to comment)
    const reputation = await reputationService.getQuickReputation(dto.reviewerWalletAddress);
    if (!reputation.eligible) {
      throw new Error(
        `Wallet not eligible to comment. Score: ${reputation.score}. Required: 100 or higher.`
      );
    }

    // Check if user already reviewed this influencer
    const hasReviewed = await storageService.hasReviewedInfluencer(
      dto.reviewerWalletAddress,
      dto.influencerId
    );
    if (hasReviewed) {
      throw new Error('You have already commented on this influencer');
    }

    // Validate comment
    if (!dto.comment || dto.comment.trim().length < 10) {
      throw new Error('Comment must be at least 10 characters');
    }

    // Create review
    const review: Review = {
      id: uuidv4(),
      influencerId: dto.influencerId,
      reviewerWalletAddress: dto.reviewerWalletAddress.toLowerCase(),
      comment: dto.comment.trim(),
      createdAt: Date.now(),
    };

    // Save review
    const savedReview = await storageService.createReview(review);

    // Update influencer review count
    await influencerService.incrementReviewCount(dto.influencerId);

    return savedReview;
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string): Promise<Review | null> {
    return await storageService.getReviewById(id);
  }

  /**
   * Get all reviews for an influencer
   */
  async getReviewsByInfluencer(influencerId: string): Promise<Review[]> {
    return await storageService.getReviewsByInfluencer(influencerId);
  }

  /**
   * Get all reviews by a reviewer
   */
  async getReviewsByReviewer(reviewerWallet: string): Promise<Review[]> {
    if (!ethers.isAddress(reviewerWallet)) {
      return [];
    }
    return await storageService.getReviewsByReviewer(reviewerWallet);
  }

  /**
   * Get review count for an influencer
   */
  async getInfluencerReviewCount(influencerId: string) {
    const reviews = await this.getReviewsByInfluencer(influencerId);

    return {
      totalReviews: reviews.length,
    };
  }

  /**
   * Check if wallet has reviewed influencer
   */
  async hasReviewed(reviewerWallet: string, influencerId: string): Promise<boolean> {
    if (!ethers.isAddress(reviewerWallet)) {
      return false;
    }
    return await storageService.hasReviewedInfluencer(reviewerWallet, influencerId);
  }
}

export const reviewService = new ReviewService();
