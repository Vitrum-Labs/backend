# Vitrum Backend - Web3 Influencer Credibility Platform

Backend untuk Vitrum - Platform Social Kredibilitas Influencer Crypto/Web3/Blockchain dengan **Automated Reputation Scoring**, **Bot/Sybil Detection**, dan **Community Reviews**.

## Overview

Backend ini menyediakan:

### 🎯 Core Features

1. **Multichain Reputation Scoring**
   - Analyze wallet activity across 6 blockchain networks
   - Calculate reputation score based on: wallet age, transaction count, multichain activity
   - Filter bot/sybil dengan automated scoring
   - Minimum score 100 untuk eligible

2. **Influencer Profiles**
   - Create influencer profile (requires score >= 100)
   - Display social kredibilitas influencer
   - Track review stats (bullish/bearish sentiment)

3. **Community Reviews**
   - Vote bullish/bearish pada influencer (requires score >= 100)
   - Add comments untuk review
   - One vote per influencer per wallet
   - Real-time sentiment tracking

4. **Bot/Sybil Prevention**
   - Wallet baru dengan aktivitas minimal = score rendah
   - Hanya eligible wallets (score >= 100) yang bisa create profile & vote
   - Multichain activity untuk detect real users

## Tech Stack

- **Runtime**: Node.js / TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon serverless)
- **Blockchain Provider**: Alchemy SDK (Multichain)
- **Web3 Library**: ethers.js v6
- **Caching**: In-memory cache dengan TTL
- **Supported Networks**: Ethereum, Arbitrum, Polygon, Optimism, Base, Polygon zkEVM

## Struktur Folder

```
backend/
├── src/
│   ├── app.ts                              # Entry point
│   ├── config/
│   │   ├── alchemy.ts                      # Multichain Alchemy clients
│   │   ├── database.ts                     # Neon PostgreSQL client
│   │   └── database.sql                    # Database schema
│   ├── models/
│   │   ├── influencer.model.ts             # Influencer data model
│   │   └── review.model.ts                 # Review data model
│   ├── services/
│   │   ├── wallet-analysis.service.ts      # Analyze wallet across all chains
│   │   ├── scoring.service.ts              # Calculate reputation score
│   │   ├── reputation.service.ts           # Main reputation service
│   │   ├── storage.service.ts              # PostgreSQL storage service
│   │   ├── influencer.service.ts           # Influencer CRUD
│   │   └── review.service.ts               # Review CRUD
│   ├── scripts/
│   │   └── init-db.ts                      # Database initialization script
│   ├── routes/
│   │   ├── reputation.route.ts             # Reputation endpoints
│   │   ├── status.route.ts                 # Status & cache endpoints
│   │   ├── influencer.route.ts             # Influencer endpoints
│   │   └── review.route.ts                 # Review endpoints
│   └── utils/
│       └── cache.ts                        # In-memory caching
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup (Neon PostgreSQL)

**Cara setup Neon database:**

1. **Create Neon Project**
   - Daftar di https://neon.tech (gratis)
   - Klik "Create Project"
   - Pilih region terdekat (US East recommended)
   - Copy connection string yang diberikan

2. **Update Environment Variables**

Copy `.env.example` ke `.env` dan isi:

```env
# Alchemy Configuration
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Neon PostgreSQL Database
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Server Configuration
PORT=3000
NODE_ENV=development

# Cache Configuration (optional)
CACHE_TTL=300000
```

**Cara mendapatkan Alchemy API Key:**
1. Daftar di https://www.alchemy.com/
2. Create New App
3. Pilih salah satu network (key akan bekerja untuk semua networks)
4. Copy API Key

3. **Initialize Database Tables**

Jalankan script untuk create tables:

```bash
tsx src/scripts/init-db.ts
```

Output yang sukses:
```
==================================================
Vitrum Backend - Database Initialization
==================================================

1. Testing database connection...
✅ Database connected successfully: 2024-01-15T...

2. Creating tables and indexes...
✅ Database tables initialized successfully

Tables created:
  - influencers
  - reviews

You can now start the server with: npm run dev
==================================================
```

**Database Schema:**
- **influencers**: id, wallet_address, name, bio, social_links (JSONB), profile_image, created_at, stats
- **reviews**: id, influencer_id, reviewer_wallet_address, sentiment, comment, created_at
- Indexes: wallet lookups, sorting by date/sentiment, foreign key constraints

### 3. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 4. Build untuk Production

```bash
npm run build
npm start
```

## API Endpoints

### 1. Health Check

```http
GET /
GET /health
```

Response: Server info dan list endpoints

---

## Reputation Endpoints

### 2. Get Full Reputation Score (Recommended)

```http
GET /api/reputation/:wallet
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x...",
    "score": 110,
    "breakdown": {
      "walletAgeScore": 50,
      "transactionScore": 40,
      "multichainBonus": 20,
      "totalScore": 110,
      "maxScore": 120
    },
    "eligible": true,
    "tier": "Expert",
    "analysis": {
      "walletAge": 456,
      "totalTransactions": 342,
      "activeNetworks": 5,
      "networkActivities": [...]
    }
  }
}
```

### 3. Get Quick Reputation (Faster)

```http
GET /api/reputation/:wallet/quick
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x...",
    "score": 105,
    "eligible": true,
    "walletAge": 456,
    "totalTransactions": 342,
    "activeNetworks": 5
  }
}
```

### 4. Get Detailed Wallet Analysis

```http
GET /api/reputation/:wallet/analysis
```

**Response:** Detailed breakdown per network (Ethereum, Arbitrum, Polygon, dll)

### 5. Batch Check Multiple Wallets

```http
POST /api/reputation/batch
Content-Type: application/json

{
  "wallets": ["0x...", "0x...", "0x..."]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "walletAddress": "0x...", "score": 110, "eligible": true },
    { "walletAddress": "0x...", "score": 45, "eligible": false }
  ]
}
```

### 6. Get Scoring Formula

```http
GET /api/reputation/formula
```

**Response:** Detailed explanation of scoring algorithm

### 7. Quick Status Check

```http
GET /api/status/:wallet
```

**Response:** Same as quick reputation

### 8. Cache Management

```http
GET /api/status/cache/stats     # Get cache statistics
POST /api/status/cache/clear    # Clear cache (admin)
```

---

## Influencer/Creator Endpoints

### 9. Create Influencer/Creator Profile

**Anyone can create** - No reputation requirement!

```http
POST /api/influencer
Content-Type: application/json

{
  "walletAddress": "0x...",
  "name": "Vitalik Buterin",
  "bio": "Co-founder of Ethereum. Building decentralized future.",
  "socialLinks": {
    "twitter": "https://twitter.com/VitalikButerin",
    "telegram": "...",
    "discord": "...",
    "website": "https://vitalik.eth.limo"
  },
  "profileImage": "https://..."
}
```

**Requirements:**
- ✅ Valid wallet address
- ✅ Name minimum 2 characters
- ✅ Bio minimum 10 characters
- ✅ One profile per wallet

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-...",
    "walletAddress": "0x...",
    "name": "Vitalik Buterin",
    "bio": "Co-founder of Ethereum...",
    "socialLinks": {
      "twitter": "https://twitter.com/VitalikButerin",
      "website": "https://vitalik.eth.limo"
    },
    "profileImage": "https://...",
    "createdAt": 1703145600000,
    "totalReviews": 0
  }
}
```

### 10. Get All Influencers

```http
GET /api/influencer?sortBy=recent
GET /api/influencer?sortBy=popular
```

**Query Params:**
- `sortBy`: `recent` | `popular` (optional)
  - `recent`: Sort by creation date (newest first)
  - `popular`: Sort by total reviews (most reviewed first)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-...",
      "walletAddress": "0x...",
      "name": "Vitalik Buterin",
      "bio": "...",
      "socialLinks": {...},
      "profileImage": "...",
      "createdAt": 1703145600000,
      "totalReviews": 25
    }
  ],
  "count": 10
}
```

### 11. Get Influencer by ID

```http
GET /api/influencer/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-...",
    "walletAddress": "0x...",
    "name": "...",
    "bio": "...",
    "totalReviews": 25
  }
}
```

### 12. Get Influencer by Wallet

```http
GET /api/influencer/wallet/:address
```

**Response:** Same as Get by ID

---

## Review/Comment Endpoints

**Note:** Bullish/bearish votes handled by smart contract, not backend!

### 13. Create Comment/Review

**Requires wallet score >= 100**

```http
POST /api/review
Content-Type: application/json

{
  "influencerId": "uuid-...",
  "reviewerWalletAddress": "0x...",
  "comment": "Great insights on DeFi trends! Very helpful content."
}
```

**Requirements:**
- ✅ Reviewer wallet score >= 100 (eligible)
- ✅ Influencer must exist
- ✅ One comment per influencer per wallet
- ✅ Comment minimum 10 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-...",
    "influencerId": "uuid-...",
    "reviewerWalletAddress": "0x...",
    "comment": "Great insights on DeFi trends! Very helpful content.",
    "createdAt": 1703145700000
  }
}
```

**Error Response (Ineligible):**
```json
{
  "success": false,
  "error": "Wallet not eligible to comment. Score: 45. Required: 100 or higher."
}
```

**Error Response (Duplicate):**
```json
{
  "success": false,
  "error": "You have already commented on this influencer"
}
```

### 14. Get Influencer Comments

```http
GET /api/review/influencer/:influencerId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-...",
      "influencerId": "uuid-...",
      "reviewerWalletAddress": "0x...",
      "comment": "Great insights!",
      "createdAt": 1703145700000
    }
  ],
  "count": 5
}
```

### 15. Get Comment Count

```http
GET /api/review/influencer/:influencerId/count
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviews": 25
  }
}
```

### 16. Get Comments by Reviewer

```http
GET /api/review/reviewer/:walletAddress
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-...",
      "influencerId": "uuid-...",
      "comment": "...",
      "createdAt": 1703145700000
    }
  ],
  "count": 3
}
```

### 17. Check if Already Commented

```http
GET /api/review/check/:walletAddress/:influencerId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasReviewed": true
  }
}
```

**Use case:** Disable comment button if user already commented

## Reputation Scoring Formula

### Components (HIGHLY ADJUSTED - Sangat mudah mencapai 100)

**1. Wallet Age Score (Max 60 points)**
- < 7 days: 15 points - Very new wallet
- 7-30 days: 20 points
- 31-90 days: 35 points
- 91-180 days: 45 points
- 181-365 days: 55 points
- > 365 days: 60 points

**2. Transaction Score (Max 110 points)**
- < 5 tx: 15 points - Minimal activity
- 5-20 tx: 55 points
- 21-50 tx: 65 points
- 51-100 tx: 80 points
- 101-500 tx: 95 points
- > 500 tx: 110 points

**3. Multichain Bonus (Max 50 points)**
- 1 network: 10 points
- 2 networks: 30 points
- 3 networks: 35 points
- 4 networks: 40 points
- 5+ networks: 50 points

**Total Max Score: 220 points**

### Tiers

- **Suspicious (< 50)**: Very low activity
- **Beginner (50-69)**: New user
- **Intermediate (70-99)**: Regular user, **NOT eligible**
- **Advanced (100-149)**: **ELIGIBLE** ✅
- **Expert (150-220)**: Power user, highly trusted ⭐

**Minimum score untuk eligible: 100**

### Examples

| Scenario | Calculation | Eligible? |
|----------|-------------|-----------|
| Wallet 0 hari + 232 tx + 2 networks | 15 + 95 + 30 = **140** | ✅ |
| Wallet 0 hari + 15 tx + 2 networks | 15 + 55 + 30 = **100** | ✅ (exactly!) |
| Wallet 30 hari + 50 tx + 2 networks | 20 + 65 + 30 = **115** | ✅ |
| Wallet 90 hari + 50 tx + 2 networks | 35 + 65 + 30 = **130** | ✅ |
| Wallet 90 hari + 100 tx + 2 networks | 35 + 80 + 30 = **145** | ✅ |
| Wallet 365+ hari + 500+ tx + 5+ networks | 60 + 110 + 50 = **220** | ✅⭐ |

## Performance Optimization

### In-Memory Caching

- Cache TTL: 5 minutes (default)
- Automatic cleanup expired entries
- Cache per wallet address dan per network
- Significant performance improvement untuk repeated requests

### Multichain Parallel Processing

- Query semua networks secara parallel
- Batch processing untuk multiple wallets
- Rate limiting protection

## Error Handling

Backend menangani:
- Invalid wallet address
- Alchemy RPC timeout
- Network errors
- Rate limiting

Error Response:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Data Models

### Influencer Model

```typescript
{
  id: string;
  walletAddress: string;
  name: string;
  bio: string;
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
  };
  profileImage?: string;
  createdAt: number;
  totalReviews: number; // Comment count only
}
```

**Note:** Bullish/bearish votes handled by smart contract, not stored in backend.

### Review/Comment Model

```typescript
{
  id: string;
  influencerId: string;
  reviewerWalletAddress: string;
  comment: string; // Required, min 10 chars
  createdAt: number;
}
```

**Note:** No sentiment field - bullish/bearish votes from smart contract only.

---

## Testing Endpoints

### Reputation Testing:

```bash
# Health check
curl http://localhost:3000/health

# Get full reputation score
curl http://localhost:3000/api/reputation/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Get quick reputation (faster)
curl http://localhost:3000/api/reputation/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/quick

# Get detailed analysis
curl http://localhost:3000/api/reputation/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/analysis

# Get scoring formula
curl http://localhost:3000/api/reputation/formula

# Batch check
curl -X POST http://localhost:3000/api/reputation/batch \
  -H "Content-Type: application/json" \
  -d '{"wallets": ["0x...", "0x..."]}'

# Quick status
curl http://localhost:3000/api/status/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Cache stats
curl http://localhost:3000/api/status/cache/stats
```

### Influencer & Review Testing:

```bash
# Create influencer (wallet must have score >= 100)
curl -X POST http://localhost:3000/api/influencer \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x2d652C400d6bDBEE878de3f29231F09F4119AE06",
    "name": "Crypto Influencer",
    "bio": "Expert in DeFi and Web3 trends",
    "socialLinks": {
      "twitter": "https://twitter.com/example"
    }
  }'

# Get all influencers
curl http://localhost:3000/api/influencer

# Get influencers sorted by bullish sentiment
curl http://localhost:3000/api/influencer?sortBy=bullish

# Create review (vote bullish)
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "influencerId": "uuid-from-previous-response",
    "reviewerWalletAddress": "0xYourWallet",
    "sentiment": "bullish",
    "comment": "Great analysis!"
  }'

# Get influencer reviews
curl http://localhost:3000/api/review/influencer/:influencerId

# Get review stats
curl http://localhost:3000/api/review/influencer/:influencerId/stats

# Check if already reviewed
curl http://localhost:3000/api/review/check/0xYourWallet/:influencerId
```

## Features

Yang DIBANGUN:
- ✅ Multichain wallet analysis (6 networks)
- ✅ Automated reputation scoring
- ✅ Bot/Sybil detection via on-chain analysis
- ✅ In-memory caching untuk performance
- ✅ Batch processing untuk multiple wallets
- ✅ Quick check endpoint untuk fast response
- ✅ Detailed breakdown per network
- ✅ **Influencer profile creation & management**
- ✅ **Community reviews (bullish/bearish voting)**
- ✅ **Sentiment scoring & stats tracking**
- ✅ **Reputation-gated actions (score >= 100)**
- ✅ **One vote per influencer per wallet**

Yang TIDAK DIBANGUN (out of scope MVP):
- ❌ Custom indexer
- ❌ Persistent database (in-memory storage untuk MVP)
- ❌ Social media API integration
- ❌ Smart contract interaction (write operations)
- ❌ Authentication/JWT system (wallet-based)

## Security Features

### Reputation Gating
- ✅ Only wallets with score >= 100 can create influencer profiles
- ✅ Only wallets with score >= 100 can vote (create reviews)
- ✅ Automated score calculation based on real on-chain activity
- ✅ Bot/Sybil resistance through multichain analysis

### Vote Integrity
- ✅ One vote per influencer per wallet address
- ✅ Wallet address validation (ethers.js)
- ✅ Influencer existence validation
- ✅ Sentiment validation (only bullish/bearish)

### Data Integrity
- ✅ Automatic stats update on every vote
- ✅ Real-time sentiment score calculation
- ✅ Indexed queries for fast lookups

---

## Use Cases

### 1. Check Wallet Eligibility
Frontend dapat cek apakah wallet eligible untuk create profile atau vote:

```javascript
const response = await fetch(`/api/status/${walletAddress}`);
const { data } = await response.json();

if (data.eligible) {
  // Allow voting or NFT creation
} else {
  // Show message: "Score >= 100 required"
}
```

### 2. Display Reputation Badge
Tampilkan tier user sebagai badge:

```javascript
const { data } = await fetch(`/api/reputation/${walletAddress}`).then(r => r.json());
// data.tier: "Suspicious", "Beginner", "Intermediate", "Advanced", "Expert"
```

### 3. Filter Bot Wallets
Bulk check multiple wallets untuk filter bot:

```javascript
const { data } = await fetch('/api/reputation/batch', {
  method: 'POST',
  body: JSON.stringify({ wallets: [...] })
}).then(r => r.json());

const legitimateUsers = data.filter(w => w.eligible);
```

### 4. Create Influencer Profile
User dengan score >= 100 bisa create profile:

```javascript
const { data: reputation } = await fetch(`/api/status/${walletAddress}`).then(r => r.json());

if (reputation.eligible) {
  const response = await fetch('/api/influencer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress,
      name: 'My Name',
      bio: 'My bio...',
      socialLinks: { twitter: '...' }
    })
  });
}
```

### 5. Vote on Influencer
Vote bullish or bearish:

```javascript
const response = await fetch('/api/review', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    influencerId: 'uuid-...',
    reviewerWalletAddress: walletAddress,
    sentiment: 'bullish',
    comment: 'Great insights!'
  })
});
```

### 6. Display Influencer Stats
Show sentiment score and review stats:

```javascript
const { data: stats } = await fetch(`/api/review/influencer/${influencerId}/stats`).then(r => r.json());

// stats.sentimentScore = 70.0 (70% bullish)
// stats.bullishCount = 35
// stats.bearishCount = 15
```

## Notes

### Storage (MVP)
- **In-Memory Storage**: Data stored in memory untuk MVP hackathon
- **No Persistence**: Data hilang saat server restart
- **Upgrade Path**: Nanti bisa migrate ke PostgreSQL/MongoDB untuk production
- **Fast**: No database overhead, instant CRUD operations

### Performance
- **Real-time Analysis**: Reputation score query langsung ke Alchemy
- **Caching**: 5 menit cache untuk wallet analysis
- **Rate Limiting**: Alchemy free tier: 300 compute units/second
- **Parallel Queries**: Multichain analysis berjalan parallel

### Production Considerations
Untuk production, consider:
1. **Database**: ✅ Already using PostgreSQL (Neon)
2. **Caching**: Redis untuk distributed caching
3. **Queue**: Bull/BullMQ untuk background jobs
4. **Rate Limiting**: Implement API rate limiting
5. **Authentication**: Add JWT/session management

---

## 🚀 Deployment to Railway

### Prerequisites
- Railway account (https://railway.app)
- Neon database already setup
- GitHub repository (optional but recommended)

### Step 1: Prepare Environment Variables

Create a `.env` file with all required variables:

```env
# Alchemy Configuration
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Neon PostgreSQL Database
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Server Configuration
PORT=3000
NODE_ENV=production

# Cache Configuration
CACHE_TTL=300000
```

### Step 2: Deploy to Railway

#### Option A: Deploy from GitHub (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "feat: ready for deployment"
   git push origin main
   ```

2. **Connect to Railway**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js project

3. **Add Environment Variables**
   - Go to your project → Variables tab
   - Add each environment variable:
     - `ALCHEMY_API_KEY`
     - `DATABASE_URL`
     - `NODE_ENV=production`
     - `PORT=3000`
     - `CACHE_TTL=300000`

4. **Configure Build Settings**
   Railway auto-detects `package.json`:
   - Build Command: `npm run build`
   - Start Command: `npm start`

#### Option B: Deploy from CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Add Environment Variables**
   ```bash
   railway variables set ALCHEMY_API_KEY=your_key
   railway variables set DATABASE_URL=your_neon_url
   railway variables set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   railway up
   ```

### Step 3: Run Database Migration (One-Time)

After first deployment, you need to run the migration script ONCE:

```bash
# Via Railway CLI
railway run npx tsx src/scripts/migrate-remove-sentiment.ts

# Or use Railway's web dashboard shell
```

**Note:** Migration only needs to run once if you're migrating from old schema. For fresh deployment, run init-db instead:

```bash
railway run npx tsx src/scripts/init-db.ts
```

### Step 4: Generate Public URL

1. Go to Railway project Settings
2. Click "Generate Domain"
3. Railway will provide a public URL: `https://your-project.up.railway.app`

### Step 5: Test Deployment

```bash
# Test health check
curl https://your-project.up.railway.app/health

# Test reputation endpoint
curl https://your-project.up.railway.app/api/reputation/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/quick
```

### Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create Railway project
- [ ] Add all environment variables
- [ ] Database connected (verify DATABASE_URL)
- [ ] Run database migration/initialization
- [ ] Generate public domain
- [ ] Test health endpoint
- [ ] Test reputation endpoint
- [ ] Test create influencer
- [ ] Test create comment
- [ ] Update frontend API URL

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `ALCHEMY_API_KEY` | Alchemy API key for blockchain data | `LkLykb8aTBMU...` |
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@...` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Railway auto-assigns) | `3000` |
| `CACHE_TTL` | Cache time-to-live in ms | `300000` |

### Common Issues & Solutions

**Issue: Database connection failed**
- ✅ Check DATABASE_URL format includes `?sslmode=require`
- ✅ Verify Neon database is active
- ✅ Check if pooling is enabled in Neon

**Issue: Build failed**
- ✅ Make sure `package.json` has all dependencies
- ✅ Check TypeScript compiles locally: `npm run build`
- ✅ Verify Node version compatibility

**Issue: Migration failed**
- ✅ Only run migration once
- ✅ For fresh deploy, use `init-db.ts` instead
- ✅ Check database has proper permissions

**Issue: Rate limiting / Alchemy errors**
- ✅ Verify ALCHEMY_API_KEY is valid
- ✅ Check Alchemy dashboard for rate limits
- ✅ Consider upgrading Alchemy plan if needed

### Monitoring

Railway provides built-in monitoring:
- **Logs**: View real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: Track deployment history
- **Rollback**: Easy rollback to previous versions

### Auto-Deploy

Railway automatically deploys on every push to `main` branch:
```bash
git push origin main
# Railway automatically rebuilds and deploys
```

### Custom Domain (Optional)

1. Go to project Settings → Domains
2. Click "Custom Domain"
3. Add your domain (e.g., `api.vitrum.xyz`)
4. Update DNS records as instructed by Railway

---

## 📊 Production Monitoring

**Recommended tools:**
- **Railway Metrics**: Built-in CPU/Memory monitoring
- **Neon Dashboard**: Database performance & queries
- **Alchemy Dashboard**: API usage & rate limits
- **Sentry**: Error tracking (optional)
- **LogTail**: Log aggregation (optional)

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` to git
2. **API Keys**: Rotate Alchemy API keys periodically
3. **Database**: Use connection pooling (Neon handles this)
4. **Rate Limiting**: Implement on production
5. **CORS**: Configure allowed origins in production
6. **Input Validation**: Already implemented (ethers.js + custom validation)

---

## 📝 License

MIT
6. **IPFS**: Store profile images di IPFS
7. **Events**: Emit events untuk NFT minting

**MVP Priority: Reliability > Complexity** - Simple tapi solid untuk hackathon demo! 🚀
