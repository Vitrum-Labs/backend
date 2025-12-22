export type VoteType = 'bullish' | 'bearish';

export interface Vote {
  id: string;
  influencerId: string;
  voterWalletAddress: string;
  voteType: VoteType;
  createdAt: number;
}

export interface CreateVoteDto {
  influencerId: string;
  voterWalletAddress: string;
  voteType: VoteType;
}

export interface VoteStats {
  influencerId: string;
  bullishVotes: number;
  bearishVotes: number;
  totalVotes: number;
  netSentiment: number; // bullish - bearish
  sentimentPercentage: number; // bullish / total * 100
}
