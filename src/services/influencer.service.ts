import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { Influencer, CreateInfluencerDto } from '../models/influencer.model';
import { storageService } from './storage.service';
import { reputationService } from './reputation.service';

export class InfluencerService {
  /**
   * Create new influencer/creator profile
   * No reputation requirement - anyone can create
   */
  async createInfluencer(dto: CreateInfluencerDto): Promise<Influencer> {
    // Validate wallet address
    if (!ethers.isAddress(dto.walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    // Check if wallet already has influencer profile
    const existing = await storageService.getInfluencerByWallet(dto.walletAddress);
    if (existing) {
      throw new Error('Wallet already has an influencer profile');
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
    };

    return await storageService.createInfluencer(influencer);
  }

  /**
   * Get influencer by ID
   */
  async getInfluencerById(id: string): Promise<Influencer | null> {
    return await storageService.getInfluencerById(id);
  }

  /**
   * Get influencer by wallet address
   */
  async getInfluencerByWallet(walletAddress: string): Promise<Influencer | null> {
    if (!ethers.isAddress(walletAddress)) {
      return null;
    }
    return await storageService.getInfluencerByWallet(walletAddress);
  }

  /**
   * Get all influencers
   */
  async getAllInfluencers(options?: { sortBy?: 'recent' | 'popular' }): Promise<Influencer[]> {
    let influencers = await storageService.getAllInfluencers();

    // Sort
    if (options?.sortBy === 'recent') {
      influencers.sort((a, b) => b.createdAt - a.createdAt);
    } else if (options?.sortBy === 'popular') {
      influencers.sort((a, b) => b.totalReviews - a.totalReviews);
    }

    return influencers;
  }

  /**
   * Update influencer review count after review
   */
  async incrementReviewCount(influencerId: string): Promise<Influencer | null> {
    const influencer = await storageService.getInfluencerById(influencerId);
    if (!influencer) return null;

    const totalReviews = influencer.totalReviews + 1;

    return await storageService.updateInfluencer(influencerId, {
      totalReviews,
    });
  }

  /**
   * Delete influencer by ID
   */
  async deleteInfluencer(id: string): Promise<boolean> {
    const influencer = await storageService.getInfluencerById(id);
    if (!influencer) {
      throw new Error('Influencer not found');
    }

    return await storageService.deleteInfluencer(id);
  }
}

export const influencerService = new InfluencerService();
