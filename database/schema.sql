-- Vitrum Backend Database Schema
-- PostgreSQL (Neon/Railway)

-- Drop tables if exists (untuk clean setup)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS influencers CASCADE;

-- Create influencers table
CREATE TABLE influencers (
  id VARCHAR(255) PRIMARY KEY,
  wallet_address VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  social_links JSONB,
  profile_image TEXT,
  created_at BIGINT NOT NULL,
  total_reviews INTEGER DEFAULT 0
);

-- Create reviews table
CREATE TABLE reviews (
  id VARCHAR(255) PRIMARY KEY,
  influencer_id VARCHAR(255) REFERENCES influencers(id) ON DELETE CASCADE,
  reviewer_wallet_address VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_influencers_wallet ON influencers(wallet_address);
CREATE INDEX idx_influencers_created_at ON influencers(created_at);
CREATE INDEX idx_influencers_total_reviews ON influencers(total_reviews);

CREATE INDEX idx_reviews_influencer ON reviews(influencer_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_wallet_address);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- Add comments for documentation
COMMENT ON TABLE influencers IS 'Creator/influencer profiles - anyone can create';
COMMENT ON TABLE reviews IS 'Reviews/comments for influencers - requires reputation score >= 100';

COMMENT ON COLUMN influencers.wallet_address IS 'Ethereum wallet address (unique)';
COMMENT ON COLUMN influencers.created_at IS 'Unix timestamp in milliseconds';
COMMENT ON COLUMN influencers.total_reviews IS 'Cached count of total reviews';

COMMENT ON COLUMN reviews.influencer_id IS 'Foreign key to influencers.id';
COMMENT ON COLUMN reviews.reviewer_wallet_address IS 'Wallet address of reviewer';
COMMENT ON COLUMN reviews.created_at IS 'Unix timestamp in milliseconds';
