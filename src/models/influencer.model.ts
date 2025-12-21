export interface SocialLinks {
  twitter?: string;
  telegram?: string;
  discord?: string;
  website?: string;
}

export interface Influencer {
  id: string;
  walletAddress: string; // Creator's wallet (anyone can create)
  name: string;
  bio: string;
  socialLinks?: SocialLinks;
  profileImage?: string;
  createdAt: number;

  // Stats
  totalReviews: number; // Total comments/reviews (bullish/bearish from smart contract)
}

export interface CreateInfluencerDto {
  walletAddress: string;
  name: string;
  bio: string;
  socialLinks?: SocialLinks;
  profileImage?: string;
}
