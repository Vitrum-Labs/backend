import { sql } from '../config/database';
import { Influencer } from '../models/influencer.model';
import { Review } from '../models/review.model';
import { Vote, VoteStats } from '../models/vote.model';

/**
 * PostgreSQL Storage Service (Neon)
 * Migrated from in-memory storage to persistent database
 */
class StorageService {
  // ========== INFLUENCER OPERATIONS ==========

  async createInfluencer(influencer: Influencer): Promise<Influencer> {
    try {
      await sql`
        INSERT INTO influencers (
          id, wallet_address, name, bio, social_links, profile_image,
          created_at, total_reviews
        ) VALUES (
          ${influencer.id},
          ${influencer.walletAddress.toLowerCase()},
          ${influencer.name},
          ${influencer.bio},
          ${JSON.stringify(influencer.socialLinks || null)},
          ${influencer.profileImage || null},
          ${influencer.createdAt},
          ${influencer.totalReviews}
        )
      `;
      return influencer;
    } catch (error: any) {
      console.error('Error creating influencer:', error.message);
      throw new Error('Failed to create influencer');
    }
  }

  async getInfluencerById(id: string): Promise<Influencer | null> {
    try {
      const result = await sql`
        SELECT * FROM influencers WHERE id = ${id}
      `;

      if (result.length === 0) return null;

      return this.mapInfluencerFromDB(result[0]);
    } catch (error: any) {
      console.error('Error getting influencer by ID:', error.message);
      return null;
    }
  }

  async getInfluencerByWallet(walletAddress: string): Promise<Influencer | null> {
    try {
      const result = await sql`
        SELECT * FROM influencers
        WHERE LOWER(wallet_address) = ${walletAddress.toLowerCase()}
      `;

      if (result.length === 0) return null;

      return this.mapInfluencerFromDB(result[0]);
    } catch (error: any) {
      console.error('Error getting influencer by wallet:', error.message);
      return null;
    }
  }

  async getAllInfluencers(): Promise<Influencer[]> {
    try {
      const result = await sql`
        SELECT * FROM influencers
        ORDER BY created_at DESC
      `;

      return result.map((row) => this.mapInfluencerFromDB(row));
    } catch (error: any) {
      console.error('Error getting all influencers:', error.message);
      return [];
    }
  }

  async updateInfluencer(id: string, updates: Partial<Influencer>): Promise<Influencer | null> {
    try {
      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }
      if (updates.bio !== undefined) {
        fields.push(`bio = $${paramIndex++}`);
        values.push(updates.bio);
      }
      if (updates.socialLinks !== undefined) {
        fields.push(`social_links = $${paramIndex++}`);
        values.push(JSON.stringify(updates.socialLinks));
      }
      if (updates.profileImage !== undefined) {
        fields.push(`profile_image = $${paramIndex++}`);
        values.push(updates.profileImage);
      }
      if (updates.totalReviews !== undefined) {
        fields.push(`total_reviews = $${paramIndex++}`);
        values.push(updates.totalReviews);
      }

      if (fields.length === 0) {
        return this.getInfluencerById(id);
      }

      // Use sql template literal with dynamic fields
      const result = await sql`
        UPDATE influencers
        SET
          name = COALESCE(${updates.name}, name),
          bio = COALESCE(${updates.bio}, bio),
          social_links = COALESCE(${updates.socialLinks ? JSON.stringify(updates.socialLinks) : null}, social_links),
          profile_image = COALESCE(${updates.profileImage}, profile_image),
          total_reviews = COALESCE(${updates.totalReviews}, total_reviews)
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) return null;

      return this.mapInfluencerFromDB(result[0]);
    } catch (error: any) {
      console.error('Error updating influencer:', error.message);
      return null;
    }
  }

  async deleteInfluencer(id: string): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM influencers WHERE id = ${id} RETURNING id
      `;
      return result.length > 0;
    } catch (error: any) {
      console.error('Error deleting influencer:', error.message);
      return false;
    }
  }

  // ========== REVIEW OPERATIONS ==========

  async createReview(review: Review): Promise<Review> {
    try {
      await sql`
        INSERT INTO reviews (
          id, influencer_id, reviewer_wallet_address, comment, created_at
        ) VALUES (
          ${review.id},
          ${review.influencerId},
          ${review.reviewerWalletAddress.toLowerCase()},
          ${review.comment},
          ${review.createdAt}
        )
      `;
      return review;
    } catch (error: any) {
      console.error('Error creating review:', error.message);
      throw new Error('Failed to create review');
    }
  }

  async getReviewById(id: string): Promise<Review | null> {
    try {
      const result = await sql`
        SELECT * FROM reviews WHERE id = ${id}
      `;

      if (result.length === 0) return null;

      return this.mapReviewFromDB(result[0]);
    } catch (error: any) {
      console.error('Error getting review by ID:', error.message);
      return null;
    }
  }

  async getReviewsByInfluencer(influencerId: string): Promise<Review[]> {
    try {
      const result = await sql`
        SELECT * FROM reviews
        WHERE influencer_id = ${influencerId}
        ORDER BY created_at DESC
      `;

      return result.map((row) => this.mapReviewFromDB(row));
    } catch (error: any) {
      console.error('Error getting reviews by influencer:', error.message);
      return [];
    }
  }

  async getReviewsByReviewer(reviewerWallet: string): Promise<Review[]> {
    try {
      const result = await sql`
        SELECT * FROM reviews
        WHERE LOWER(reviewer_wallet_address) = ${reviewerWallet.toLowerCase()}
        ORDER BY created_at DESC
      `;

      return result.map((row) => this.mapReviewFromDB(row));
    } catch (error: any) {
      console.error('Error getting reviews by reviewer:', error.message);
      return [];
    }
  }

  async hasReviewedInfluencer(reviewerWallet: string, influencerId: string): Promise<boolean> {
    try {
      const result = await sql`
        SELECT EXISTS(
          SELECT 1 FROM reviews
          WHERE LOWER(reviewer_wallet_address) = ${reviewerWallet.toLowerCase()}
          AND influencer_id = ${influencerId}
        ) as exists
      `;

      return result[0].exists;
    } catch (error: any) {
      console.error('Error checking reviewed status:', error.message);
      return false;
    }
  }

  async getAllReviews(): Promise<Review[]> {
    try {
      const result = await sql`
        SELECT * FROM reviews
        ORDER BY created_at DESC
      `;

      return result.map((row) => this.mapReviewFromDB(row));
    } catch (error: any) {
      console.error('Error getting all reviews:', error.message);
      return [];
    }
  }

  // ========== STATS ==========

  async getStorageStats() {
    try {
      const influencersResult = await sql`SELECT COUNT(*) as count FROM influencers`;
      const reviewsResult = await sql`SELECT COUNT(*) as count FROM reviews`;

      return {
        influencers: Number(influencersResult[0].count),
        reviews: Number(reviewsResult[0].count),
      };
    } catch (error: any) {
      console.error('Error getting storage stats:', error.message);
      return {
        influencers: 0,
        reviews: 0,
      };
    }
  }

  async clearAll() {
    try {
      await sql`DELETE FROM reviews`;
      await sql`DELETE FROM influencers`;
      console.log('All data cleared');
    } catch (error: any) {
      console.error('Error clearing data:', error.message);
      throw new Error('Failed to clear data');
    }
  }

  // ========== HELPER METHODS ==========

  private mapInfluencerFromDB(row: any): Influencer {
    return {
      id: row.id,
      walletAddress: row.wallet_address,
      name: row.name,
      bio: row.bio,
      socialLinks: row.social_links || undefined,
      profileImage: row.profile_image || undefined,
      createdAt: Number(row.created_at),
      totalReviews: Number(row.total_reviews),
    };
  }

  private mapReviewFromDB(row: any): Review {
    return {
      id: row.id,
      influencerId: row.influencer_id,
      reviewerWalletAddress: row.reviewer_wallet_address,
      comment: row.comment,
      createdAt: Number(row.created_at),
    };
  }

  // ========== VOTE OPERATIONS ==========

  async createVote(vote: Vote): Promise<Vote> {
    try {
      await sql`
        INSERT INTO votes (
          id, influencer_id, voter_wallet_address, vote_type, created_at
        ) VALUES (
          ${vote.id},
          ${vote.influencerId},
          ${vote.voterWalletAddress.toLowerCase()},
          ${vote.voteType},
          ${vote.createdAt}
        )
      `;
      return vote;
    } catch (error: any) {
      console.error('Error creating vote:', error.message);
      throw new Error('Failed to create vote');
    }
  }

  async getVoteByWalletAndInfluencer(
    voterWallet: string,
    influencerId: string
  ): Promise<Vote | null> {
    try {
      const result = await sql`
        SELECT * FROM votes
        WHERE LOWER(voter_wallet_address) = ${voterWallet.toLowerCase()}
        AND influencer_id = ${influencerId}
      `;

      if (result.length === 0) return null;

      return this.mapVoteFromDB(result[0]);
    } catch (error: any) {
      console.error('Error getting vote:', error.message);
      return null;
    }
  }

  async getVotesByInfluencer(influencerId: string): Promise<Vote[]> {
    try {
      const result = await sql`
        SELECT * FROM votes
        WHERE influencer_id = ${influencerId}
        ORDER BY created_at DESC
      `;

      return result.map((row) => this.mapVoteFromDB(row));
    } catch (error: any) {
      console.error('Error getting votes by influencer:', error.message);
      return [];
    }
  }

  async getVoteStats(influencerId: string): Promise<VoteStats> {
    try {
      const result = await sql`
        SELECT
          COUNT(*) FILTER (WHERE vote_type = 'bullish') as bullish_count,
          COUNT(*) FILTER (WHERE vote_type = 'bearish') as bearish_count,
          COUNT(*) as total_count
        FROM votes
        WHERE influencer_id = ${influencerId}
      `;

      const bullishVotes = Number(result[0].bullish_count || 0);
      const bearishVotes = Number(result[0].bearish_count || 0);
      const totalVotes = Number(result[0].total_count || 0);
      const netSentiment = bullishVotes - bearishVotes;
      const sentimentPercentage = totalVotes > 0 ? (bullishVotes / totalVotes) * 100 : 0;

      return {
        influencerId,
        bullishVotes,
        bearishVotes,
        totalVotes,
        netSentiment,
        sentimentPercentage: Math.round(sentimentPercentage * 10) / 10, // Round to 1 decimal
      };
    } catch (error: any) {
      console.error('Error getting vote stats:', error.message);
      return {
        influencerId,
        bullishVotes: 0,
        bearishVotes: 0,
        totalVotes: 0,
        netSentiment: 0,
        sentimentPercentage: 0,
      };
    }
  }

  private mapVoteFromDB(row: any): Vote {
    return {
      id: row.id,
      influencerId: row.influencer_id,
      voterWalletAddress: row.voter_wallet_address,
      voteType: row.vote_type,
      createdAt: Number(row.created_at),
    };
  }
}

// Singleton instance
export const storageService = new StorageService();
