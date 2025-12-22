-- Vitrum Backend Database Schema
-- PostgreSQL (Neon)
-- This schema supports the influencer reputation system

-- ========================================
-- TABLE: influencers
-- Stores influencer profiles (creators)
-- ========================================
CREATE TABLE IF NOT EXISTS influencers (
  id VARCHAR(36) PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  social_links JSONB,
  profile_image TEXT,
  created_at BIGINT NOT NULL,
  total_reviews INTEGER DEFAULT 0
);

-- Indexes for influencers table
CREATE INDEX IF NOT EXISTS idx_influencers_wallet_address ON influencers(wallet_address);
CREATE INDEX IF NOT EXISTS idx_influencers_created_at ON influencers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_influencers_total_reviews ON influencers(total_reviews DESC);

-- ========================================
-- TABLE: reviews
-- Stores reviews/comments only
-- ========================================
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) PRIMARY KEY,
  influencer_id VARCHAR(36) NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  reviewer_wallet_address VARCHAR(42) NOT NULL,
  comment TEXT NOT NULL,
  created_at BIGINT NOT NULL,

  -- Ensure one comment per wallet per influencer
  UNIQUE (influencer_id, reviewer_wallet_address)
);

-- Indexes for reviews table
CREATE INDEX IF NOT EXISTS idx_reviews_influencer_id ON reviews(influencer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_wallet ON reviews(reviewer_wallet_address);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ========================================
-- TABLE: votes
-- Stores bullish/bearish votes (backend, not smart contract)
-- ========================================
CREATE TABLE IF NOT EXISTS votes (
  id VARCHAR(36) PRIMARY KEY,
  influencer_id VARCHAR(36) NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  voter_wallet_address VARCHAR(42) NOT NULL,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('bullish', 'bearish')),
  created_at BIGINT NOT NULL,

  -- One vote per wallet per influencer (permanent, cannot be changed)
  UNIQUE (influencer_id, voter_wallet_address)
);

-- Indexes for votes table
CREATE INDEX IF NOT EXISTS idx_votes_influencer_id ON votes(influencer_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_wallet ON votes(voter_wallet_address);
CREATE INDEX IF NOT EXISTS idx_votes_vote_type ON votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at DESC);

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON TABLE influencers IS 'Influencer/creator profiles - anyone can create';
COMMENT ON TABLE reviews IS 'Comments/reviews on influencers, one comment per wallet per influencer (requires score >= 100)';
COMMENT ON TABLE votes IS 'Bullish/bearish votes for influencers - requires score >= 100, one vote per wallet (permanent, cannot be changed)';

COMMENT ON COLUMN influencers.wallet_address IS 'Creator wallet address (lowercase)';
COMMENT ON COLUMN reviews.reviewer_wallet_address IS 'Reviewer wallet address (lowercase, must be eligible with score >= 100)';
COMMENT ON COLUMN votes.voter_wallet_address IS 'Voter wallet address (lowercase, must be eligible with score >= 100)';
COMMENT ON COLUMN votes.vote_type IS 'Vote type: bullish or bearish (permanent, cannot be changed)';
