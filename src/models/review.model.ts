export interface Review {
  id: string;
  influencerId: string;
  reviewerWalletAddress: string; // Reviewer's wallet (must have score >= 100)
  comment: string;
  createdAt: number;
}

export interface CreateReviewDto {
  influencerId: string;
  reviewerWalletAddress: string;
  comment: string;
}
