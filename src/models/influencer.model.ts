export interface SocialLinks {
  twitter?: string;
  telegram?: string;
  discord?: string;
  website?: string;
}

export interface Influencer {
  id: string;
  walletAddress: string; // Creator's wallet (must have score >= 100)
  name: string;
  bio: string;
  socialLinks?: SocialLinks;
  profileImage?: string;
  createdAt: number;

  // Stats
  totalReviews: number;
  bullishCount: number;
  bearishCount: number;

  // Calculated
  sentimentScore: number; // percentage bullish (0-100)
}

export interface CreateInfluencerDto {
  walletAddress: string;
  name: string;
  bio: string;
  socialLinks?: SocialLinks;
  profileImage?: string;
}
