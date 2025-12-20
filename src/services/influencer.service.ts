import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { Influencer, CreateInfluencerDto } from '../models/influencer.model';
import { storageService } from './storage.service';
import { reputationService } from './reputation.service';

export class InfluencerService {
  /**
   * Create new influencer profile
   * Requires: wallet score >= 100 (eligible)
   */
  async createInfluencer(dto: CreateInfluencerDto): Promise<Influencer> {
    // Validate wallet address
    if (!ethers.isAddress(dto.walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    // Check if wallet already has influencer profile
    const existing = storageService.getInfluencerByWallet(dto.walletAddress);
    if (existing) {
      throw new Error('Wallet already has an influencer profile');
    }

    // Validate reputation score (must be >= 100 to create influencer)
    const reputation = await reputationService.getQuickReputation(dto.walletAddress);
    if (!reputation.eligible) {
      throw new Error(
        `Wallet not eligible. Score: ${reputation.score}. Required: 100 or higher.`
      );
    }

    // Validate required fields
    if (!dto.name || dto.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    if (!dto.bio || dto.bio.trim().length < 10) {
      throw new Error('Bio must be at least 10 characters');
    }

    // Create influencer
    const influencer: Influencer = {
      id: uuidv4(),
      walletAddress: dto.walletAddress.toLowerCase(),
      name: dto.name.trim(),
      bio: dto.bio.trim(),
      socialLinks: dto.socialLinks,
      profileImage: dto.profileImage,
      createdAt: Date.now(),
      totalReviews: 0,
      bullishCount: 0,
      bearishCount: 0,
      sentimentScore: 0,
    };

    return storageService.createInfluencer(influencer);
  }

  /**
   * Get influencer by ID
   */
  getInfluencerById(id: string): Influencer | null {
    return storageService.getInfluencerById(id);
  }

  /**
   * Get influencer by wallet address
   */
  getInfluencerByWallet(walletAddress: string): Influencer | null {
    if (!ethers.isAddress(walletAddress)) {
      return null;
    }
    return storageService.getInfluencerByWallet(walletAddress);
  }

  /**
   * Get all influencers
   */
  getAllInfluencers(options?: { sortBy?: 'recent' | 'popular' | 'bullish' }): Influencer[] {
    let influencers = storageService.getAllInfluencers();

    // Sort
    if (options?.sortBy === 'recent') {
      influencers.sort((a, b) => b.createdAt - a.createdAt);
    } else if (options?.sortBy === 'popular') {
      influencers.sort((a, b) => b.totalReviews - a.totalReviews);
    } else if (options?.sortBy === 'bullish') {
      influencers.sort((a, b) => b.sentimentScore - a.sentimentScore);
    }

    return influencers;
  }

  /**
   * Update influencer stats after review
   */
  updateInfluencerStats(influencerId: string, sentiment: 'bullish' | 'bearish'): Influencer | null {
    const influencer = storageService.getInfluencerById(influencerId);
    if (!influencer) return null;

    const totalReviews = influencer.totalReviews + 1;
    const bullishCount =
      sentiment === 'bullish' ? influencer.bullishCount + 1 : influencer.bullishCount;
    const bearishCount =
      sentiment === 'bearish' ? influencer.bearishCount + 1 : influencer.bearishCount;

    const sentimentScore = totalReviews > 0 ? (bullishCount / totalReviews) * 100 : 0;

    return storageService.updateInfluencer(influencerId, {
      totalReviews,
      bullishCount,
      bearishCount,
      sentimentScore,
    });
  }
}

export const influencerService = new InfluencerService();
