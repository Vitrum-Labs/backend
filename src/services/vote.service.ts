import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { Vote, CreateVoteDto, VoteStats } from '../models/vote.model';
import { storageService } from './storage.service';
import { reputationService } from './reputation.service';

export class VoteService {
  /**
   * Create new vote (bullish/bearish)
   * Requirements:
   * - Voter must have reputation score >= 100
   * - One vote per wallet per influencer (no changes allowed)
   */
  async createVote(dto: CreateVoteDto): Promise<Vote> {
    // Validate wallet address
    if (!ethers.isAddress(dto.voterWalletAddress)) {
      throw new Error('Invalid wallet address');
    }

    // Validate vote type
    if (dto.voteType !== 'bullish' && dto.voteType !== 'bearish') {
      throw new Error('Vote type must be either "bullish" or "bearish"');
    }

    // Check if influencer exists
    const influencer = await storageService.getInfluencerById(dto.influencerId);
    if (!influencer) {
      throw new Error('Influencer not found');
    }

    // Check if voter has already voted for this influencer
    const existingVote = await storageService.getVoteByWalletAndInfluencer(
      dto.voterWalletAddress,
      dto.influencerId
    );

    if (existingVote) {
      throw new Error('You have already voted for this influencer. Votes cannot be changed.');
    }

    // Check voter reputation score
    const reputation = await reputationService.getQuickReputation(dto.voterWalletAddress);
    if (reputation.score < 100) {
      throw new Error(
        `Voter must have reputation score of at least 100. Current score: ${reputation.score}`
      );
    }

    // Create vote
    const vote: Vote = {
      id: uuidv4(),
      influencerId: dto.influencerId,
      voterWalletAddress: dto.voterWalletAddress.toLowerCase(),
      voteType: dto.voteType,
      createdAt: Date.now(),
    };

    return await storageService.createVote(vote);
  }

  /**
   * Get vote statistics for an influencer
   */
  async getVoteStats(influencerId: string): Promise<VoteStats> {
    return await storageService.getVoteStats(influencerId);
  }

  /**
   * Get all votes for an influencer
   */
  async getVotesByInfluencer(influencerId: string): Promise<Vote[]> {
    return await storageService.getVotesByInfluencer(influencerId);
  }

  /**
   * Check if wallet has voted for influencer
   */
  async hasVoted(voterWallet: string, influencerId: string): Promise<boolean> {
    const vote = await storageService.getVoteByWalletAndInfluencer(voterWallet, influencerId);
    return vote !== null;
  }

  /**
   * Get voter's vote for an influencer (if exists)
   */
  async getVoteByWalletAndInfluencer(
    voterWallet: string,
    influencerId: string
  ): Promise<Vote | null> {
    if (!ethers.isAddress(voterWallet)) {
      return null;
    }
    return await storageService.getVoteByWalletAndInfluencer(voterWallet, influencerId);
  }
}

export const voteService = new VoteService();
