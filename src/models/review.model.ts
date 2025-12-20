export enum ReviewSentiment {
  BULLISH = 'bullish',
  BEARISH = 'bearish',
}

export interface Review {
  id: string;
  influencerId: string;
  reviewerWalletAddress: string; // Reviewer's wallet (must have score >= 100)
  sentiment: ReviewSentiment;
  comment?: string;
  createdAt: number;
}

export interface CreateReviewDto {
  influencerId: string;
  reviewerWalletAddress: string;
  sentiment: ReviewSentiment;
  comment?: string;
}
