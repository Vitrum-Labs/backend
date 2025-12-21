import dotenv from 'dotenv';
import { sql } from '../config/database';

// Load environment variables
dotenv.config();

/**
 * Migration: Remove sentiment fields from database
 *
 * This migration:
 * 1. Drops sentiment column from reviews table
 * 2. Makes comment column required (NOT NULL)
 * 3. Drops sentiment-related columns from influencers table
 * 4. Drops sentiment index from reviews table
 *
 * Run this ONCE to migrate from old schema to new schema
 *
 * Usage:
 *   npx tsx src/scripts/migrate-remove-sentiment.ts
 */
async function migrate() {
  console.log('='.repeat(50));
  console.log('Migration: Remove Sentiment Fields');
  console.log('='.repeat(50));

  try {
    console.log('\n1. Dropping sentiment index from reviews...');
    await sql`DROP INDEX IF EXISTS idx_reviews_sentiment`;
    console.log('✅ Index dropped');

    console.log('\n2. Dropping sentiment-related indexes from influencers...');
    await sql`DROP INDEX IF EXISTS idx_influencers_sentiment_score`;
    console.log('✅ Indexes dropped');

    console.log('\n3. Updating reviews table...');
    // First, delete reviews without comments (if any)
    await sql`DELETE FROM reviews WHERE comment IS NULL OR comment = ''`;
    console.log('   - Deleted reviews without comments');

    // Drop sentiment column
    await sql`ALTER TABLE reviews DROP COLUMN IF EXISTS sentiment`;
    console.log('   - Dropped sentiment column');

    // Make comment NOT NULL
    await sql`ALTER TABLE reviews ALTER COLUMN comment SET NOT NULL`;
    console.log('   - Made comment column required');

    console.log('\n4. Updating influencers table...');
    // Drop sentiment-related columns
    await sql`ALTER TABLE influencers DROP COLUMN IF EXISTS bullish_count`;
    await sql`ALTER TABLE influencers DROP COLUMN IF EXISTS bearish_count`;
    await sql`ALTER TABLE influencers DROP COLUMN IF EXISTS sentiment_score`;
    console.log('   - Dropped sentiment columns');

    console.log('\n✅ Migration completed successfully!');
    console.log('\nChanges:');
    console.log('  - Reviews table: sentiment column removed, comment now required');
    console.log('  - Influencers table: bullish_count, bearish_count, sentiment_score removed');
    console.log('  - Indexes updated');
    console.log('\nNote: Bullish/bearish votes now handled by smart contract');
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nThis might happen if:');
    console.error('  - Migration already ran');
    console.error('  - Database connection failed');
    console.error('  - Table structure is different');
    throw error;
  }

  console.log('\n' + '='.repeat(50));
}

// Run the migration
migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
