import dotenv from 'dotenv';
import { testConnection, initializeTables } from '../config/database';

// Load environment variables
dotenv.config();

/**
 * Database Initialization Script
 * Run this script to create tables and indexes in Neon PostgreSQL
 *
 * Usage:
 *   tsx src/scripts/init-db.ts
 */
async function main() {
  console.log('='.repeat(50));
  console.log('Vitrum Backend - Database Initialization');
  console.log('='.repeat(50));

  // Test connection
  console.log('\n1. Testing database connection...');
  const connected = await testConnection();

  if (!connected) {
    console.error('\n❌ Cannot connect to database. Please check:');
    console.error('   - DATABASE_URL is set in .env');
    console.error('   - Neon project is active');
    console.error('   - Network connection is working');
    process.exit(1);
  }

  // Initialize tables
  console.log('\n2. Creating tables and indexes...');
  try {
    await initializeTables();
    console.log('\n✅ Database initialization complete!');
    console.log('\nTables created:');
    console.log('  - influencers');
    console.log('  - reviews');
    console.log('\nYou can now start the server with: npm run dev');
  } catch (error: any) {
    console.error('\n❌ Initialization failed:', error.message);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
