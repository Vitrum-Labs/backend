import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

/**
 * Neon PostgreSQL Database Configuration
 * Serverless driver for edge-compatible SQL queries
 */

// Load environment variables
dotenv.config();

// Validate DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create Neon SQL client
export const sql = neon(process.env.DATABASE_URL);

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected successfully:', result[0].current_time);
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Initialize database tables
 * Run schema from database.sql
 */
export async function initializeTables(): Promise<void> {
  try {
    // Create influencers table
    await sql`
      CREATE TABLE IF NOT EXISTS influencers (
        id VARCHAR(36) PRIMARY KEY,
        wallet_address VARCHAR(42) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        bio TEXT NOT NULL,
        social_links JSONB,
        profile_image TEXT,
        created_at BIGINT NOT NULL,
        total_reviews INTEGER DEFAULT 0
      )
    `;

    // Create indexes for influencers
    await sql`CREATE INDEX IF NOT EXISTS idx_influencers_wallet_address ON influencers(wallet_address)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_influencers_created_at ON influencers(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_influencers_total_reviews ON influencers(total_reviews DESC)`;

    // Create reviews table (comments only - votes from smart contract)
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY,
        influencer_id VARCHAR(36) NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
        reviewer_wallet_address VARCHAR(42) NOT NULL,
        comment TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        UNIQUE (influencer_id, reviewer_wallet_address)
      )
    `;

    // Create indexes for reviews
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_influencer_id ON reviews(influencer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_wallet ON reviews(reviewer_wallet_address)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC)`;

    console.log('✅ Database tables initialized successfully');
  } catch (error: any) {
    console.error('❌ Failed to initialize tables:', error.message);
    throw error;
  }
}
