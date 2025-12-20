import { Influencer } from '../models/influencer.model';
import { Review } from '../models/review.model';

/**
 * In-memory storage for MVP
 * For production, replace with proper database (PostgreSQL, MongoDB, etc)
 */
class StorageService {
  private influencers: Map<string, Influencer> = new Map();
  private reviews: Map<string, Review> = new Map();
  private reviewsByInfluencer: Map<string, string[]> = new Map(); // influencerId -> reviewIds[]
  private reviewsByReviewer: Map<string, string[]> = new Map(); // reviewerWallet -> reviewIds[]

  // ========== INFLUENCER OPERATIONS ==========

  createInfluencer(influencer: Influencer): Influencer {
    this.influencers.set(influencer.id, influencer);
    return influencer;
  }

  getInfluencerById(id: string): Influencer | null {
    return this.influencers.get(id) || null;
  }

  getInfluencerByWallet(walletAddress: string): Influencer | null {
    for (const influencer of this.influencers.values()) {
      if (influencer.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
        return influencer;
      }
    }
    return null;
  }

  getAllInfluencers(): Influencer[] {
    return Array.from(this.influencers.values());
  }

  updateInfluencer(id: string, updates: Partial<Influencer>): Influencer | null {
    const influencer = this.influencers.get(id);
    if (!influencer) return null;

    const updated = { ...influencer, ...updates };
    this.influencers.set(id, updated);
    return updated;
  }

  deleteInfluencer(id: string): boolean {
    return this.influencers.delete(id);
  }

  // ========== REVIEW OPERATIONS ==========

  createReview(review: Review): Review {
    this.reviews.set(review.id, review);

    // Index by influencer
    const influencerReviews = this.reviewsByInfluencer.get(review.influencerId) || [];
    influencerReviews.push(review.id);
    this.reviewsByInfluencer.set(review.influencerId, influencerReviews);

    // Index by reviewer
    const reviewerReviews = this.reviewsByReviewer.get(review.reviewerWalletAddress.toLowerCase()) || [];
    reviewerReviews.push(review.id);
    this.reviewsByReviewer.set(review.reviewerWalletAddress.toLowerCase(), reviewerReviews);

    return review;
  }

  getReviewById(id: string): Review | null {
    return this.reviews.get(id) || null;
  }

  getReviewsByInfluencer(influencerId: string): Review[] {
    const reviewIds = this.reviewsByInfluencer.get(influencerId) || [];
    return reviewIds
      .map((id) => this.reviews.get(id))
      .filter((review): review is Review => review !== undefined);
  }

  getReviewsByReviewer(reviewerWallet: string): Review[] {
    const reviewIds = this.reviewsByReviewer.get(reviewerWallet.toLowerCase()) || [];
    return reviewIds
      .map((id) => this.reviews.get(id))
      .filter((review): review is Review => review !== undefined);
  }

  hasReviewedInfluencer(reviewerWallet: string, influencerId: string): boolean {
    const reviews = this.getReviewsByReviewer(reviewerWallet);
    return reviews.some((review) => review.influencerId === influencerId);
  }

  getAllReviews(): Review[] {
    return Array.from(this.reviews.values());
  }

  // ========== STATS ==========

  getStorageStats() {
    return {
      influencers: this.influencers.size,
      reviews: this.reviews.size,
    };
  }

  clearAll() {
    this.influencers.clear();
    this.reviews.clear();
    this.reviewsByInfluencer.clear();
    this.reviewsByReviewer.clear();
  }
}

// Singleton instance
export const storageService = new StorageService();
