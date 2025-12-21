import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateConfig, initializeAlchemyClients } from './config/alchemy';

// Import routes
import reputationRoute from './routes/reputation.route';
import statusRoute from './routes/status.route';
import influencerRoute from './routes/influencer.route';
import reviewRoute from './routes/review.route';

// Load environment variables
dotenv.config();

// Validate configuration and initialize Alchemy clients
try {
  validateConfig();
  initializeAlchemyClients();
} catch (error: any) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Vitrum Backend API - Multichain Reputation Scoring',
    version: '2.0.0',
    description: 'Web3 Influencer Credibility Score based on wallet age and transaction history',
    features: [
      'Multichain wallet analysis (Ethereum, Arbitrum, Polygon, Optimism, Base, Polygon zkEVM)',
      'Automated reputation scoring',
      'Bot/Sybil detection via on-chain analysis',
      'Creator profiles (anyone can create)',
      'Comments/reviews system (requires score >= 100)',
      'Bullish/bearish votes from smart contract',
    ],
    endpoints: {
      reputation: '/api/reputation/:wallet - Full reputation score with breakdown',
      quickCheck: '/api/reputation/:wallet/quick - Fast eligibility check',
      analysis: '/api/reputation/:wallet/analysis - Detailed multichain analysis',
      batch: 'POST /api/reputation/batch - Batch check multiple wallets',
      formula: '/api/reputation/formula - Get scoring formula',
      status: '/api/status/:wallet - Quick wallet status',
      influencer: 'POST /api/influencer - Create influencer/creator profile (anyone can create)',
      influencers: 'GET /api/influencer - List all influencers',
      review: 'POST /api/review - Create comment/review (REQUIRES score >= 100)',
      reviews: 'GET /api/review/influencer/:id - Get influencer reviews',
      reviewCount: 'GET /api/review/influencer/:id/count - Get review count',
    },
    scoring: {
      maxScore: 220,
      eligibilityThreshold: 100,
      note: 'HIGHLY ADJUSTED - Sangat mudah mencapai eligible',
      components: {
        walletAge: 'Max 60 points',
        transactions: 'Max 110 points',
        multichainBonus: 'Max 50 points',
      },
    },
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/reputation', reputationRoute);
app.use('/api/status', statusRoute);
app.use('/api/influencer', influencerRoute);
app.use('/api/review', reviewRoute);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('Vitrum Backend API');
  console.log('Alchemy-based Architecture');
  console.log('='.repeat(50));
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Network: Arbitrum via Alchemy`);
  console.log('='.repeat(50));
});

export default app;
