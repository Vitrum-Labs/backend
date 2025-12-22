# Vitrum Backend - Web3 Influencer Credibility Platform

Backend untuk Vitrum - Platform Social Kredibilitas Influencer Crypto/Web3/Blockchain dengan **Automated Reputation Scoring**, **Bot/Sybil Detection**, **Community Reviews**, dan **Bullish/Bearish Voting System**.

## 🌐 Live API

**Production URL:** `https://backend-production-85c5.up.railway.app`

## Overview

Backend ini menyediakan:

### 🎯 Core Features

1. **Multichain Reputation Scoring**
   - Analyze wallet activity across 6 blockchain networks
   - Calculate reputation score based on: wallet age, transaction count, multichain activity
   - Filter bot/sybil dengan automated scoring
   - Minimum score 100 untuk eligible

2. **Influencer Profiles**
   - Anyone can create influencer profile (no reputation requirement)
   - Display social kredibilitas influencer
   - Track review & vote stats

3. **Community Reviews**
   - Add comments/reviews untuk influencer (requires score >= 100)
   - One review per influencer per wallet
   - Permanent comments with timestamp

4. **Bullish/Bearish Voting System** 🆕
   - Vote bullish atau bearish pada influencer (requires score >= 100)
   - **One vote per wallet per influencer (permanent, cannot be changed)**
   - Real-time sentiment tracking & statistics
   - Backend-based voting (not smart contract)

5. **Bot/Sybil Prevention**
   - Wallet baru dengan aktivitas minimal = score rendah
   - Hanya eligible wallets (score >= 100) yang bisa review & vote
   - Multichain activity untuk detect real users

## Tech Stack

- **Runtime**: Node.js 18+ / TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon serverless)
- **Blockchain Provider**: Alchemy SDK (Multichain)
- **Web3 Library**: ethers.js v6
- **Caching**: In-memory cache dengan TTL
- **Deployment**: Railway
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
│   │   ├── review.model.ts                 # Review data model
│   │   └── vote.model.ts                   # Vote data model (NEW!)
│   ├── services/
│   │   ├── wallet-analysis.service.ts      # Analyze wallet across all chains
│   │   ├── scoring.service.ts              # Calculate reputation score
│   │   ├── reputation.service.ts           # Main reputation service
│   │   ├── storage.service.ts              # PostgreSQL storage service
│   │   ├── influencer.service.ts           # Influencer CRUD
│   │   ├── review.service.ts               # Review CRUD
│   │   └── vote.service.ts                 # Vote CRUD (NEW!)
│   ├── routes/
│   │   ├── reputation.route.ts             # Reputation endpoints
│   │   ├── status.route.ts                 # Status & cache endpoints
│   │   ├── influencer.route.ts             # Influencer endpoints
│   │   ├── review.route.ts                 # Review endpoints
│   │   └── vote.route.ts                   # Vote endpoints (NEW!)
│   └── utils/
│       └── cache.ts                        # In-memory caching
├── database/
│   └── schema.sql                          # Complete database schema with votes table
├── package.json
├── tsconfig.json
├── .env.example
├── nixpacks.toml                           # Railway build configuration
├── railway.json                            # Railway deployment settings
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

Run SQL schema di Neon Console:

```sql
-- Copy semua isi dari database/schema.sql
-- Atau src/config/database.sql
```

**Database Schema:**
- **influencers**: id, wallet_address, name, bio, social_links (JSONB), profile_image, created_at, total_reviews
- **reviews**: id, influencer_id, reviewer_wallet_address, comment, created_at
- **votes**: id, influencer_id, voter_wallet_address, vote_type, created_at (NEW!)
- Indexes: wallet lookups, sorting by date, foreign key constraints
- Constraints: UNIQUE(influencer_id, voter_wallet_address) untuk one vote per wallet

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

Base URL (Production): `https://backend-production-85c5.up.railway.app`

### Health Check

```http
GET /
GET /health
```

---

## Reputation Endpoints

### Get Full Reputation Score

```http
GET /api/reputation/:wallet
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": "0x...",
    "score": 165,
    "eligible": true,
    "tier": "Elite",
    "breakdown": {
      "walletAge": 55,
      "transactions": 90,
      "multichainBonus": 20
    },
    "analysis": {
      "firstTransaction": "2015-07-30T...",
      "totalTransactions": 2500,
      "activeNetworks": 6,
      "isSuspicious": false
    }
  }
}
```

### Quick Reputation Check

```http
GET /api/reputation/:wallet/quick
```

### Batch Check

```http
POST /api/reputation/batch
Body: { "wallets": ["0x...", "0x..."] }
```

---

## Influencer Endpoints

### Create Influencer

**No reputation requirement - anyone can create!**

```http
POST /api/influencer

Body:
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
  "name": "Crypto Influencer",
  "bio": "DeFi expert and Web3 educator",
  "socialLinks": {
    "twitter": "https://twitter.com/example",
    "instagram": "https://instagram.com/example"
  },
  "profileImage": "https://..."
}
```

### Get All Influencers

```http
GET /api/influencer
GET /api/influencer?sortBy=recent
GET /api/influencer?sortBy=popular
```

### Get Influencer by ID

```http
GET /api/influencer/:id
```

### Get Influencer by Wallet

```http
GET /api/influencer/wallet/:address
```

### Delete Influencer

```http
DELETE /api/influencer/:id
```

---

## Review Endpoints

### Create Review

**Requires score >= 100**

```http
POST /api/review

Body:
{
  "influencerId": "uuid-...",
  "reviewerWalletAddress": "0x...",
  "comment": "Great insights on DeFi! Very helpful content."
}
```

### Get Reviews for Influencer

```http
GET /api/review/influencer/:influencerId
```

### Get Review Count

```http
GET /api/review/influencer/:influencerId/count
```

### Check if Reviewed

```http
GET /api/review/check/:walletAddress/:influencerId
```

---

## Vote Endpoints 🆕

### Create Vote

**Requires score >= 100. One vote per wallet (permanent, cannot be changed!)**

```http
POST /api/vote

Body:
{
  "influencerId": "550e8400-e29b-41d4-a716-446655440000",
  "voterWalletAddress": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  "voteType": "bullish"  // or "bearish"
}

Response (Success):
{
  "success": true,
  "data": {
    "id": "vote-123",
    "influencerId": "550e8400...",
    "voterWalletAddress": "0x5aaeb6053...",
    "voteType": "bullish",
    "createdAt": 1703235000000
  },
  "message": "Vote \"bullish\" recorded successfully. This vote is permanent and cannot be changed."
}

Response (Already Voted):
{
  "success": false,
  "error": "You have already voted for this influencer. Votes cannot be changed."
}

Response (Low Score):
{
  "success": false,
  "error": "Voter must have reputation score of at least 100. Current score: 85"
}
```

### Get Vote Statistics

```http
GET /api/vote/influencer/:influencerId/stats

Response:
{
  "success": true,
  "data": {
    "influencerId": "550e8400...",
    "bullishVotes": 150,
    "bearishVotes": 30,
    "totalVotes": 180,
    "netSentiment": 120,        // bullish - bearish
    "sentimentPercentage": 83.3  // % bullish
  }
}
```

### Get All Votes

```http
GET /api/vote/influencer/:influencerId
```

### Check if Voted

```http
GET /api/vote/check/:walletAddress/:influencerId

Response:
{
  "success": true,
  "data": {
    "hasVoted": true,
    "vote": {
      "id": "vote-123",
      "voteType": "bullish",
      "createdAt": 1703232000000
    }
  }
}
```

---

## Complete API Reference

```bash
# Base URL
https://backend-production-85c5.up.railway.app

# Reputation
GET  /api/reputation/:wallet
GET  /api/reputation/:wallet/quick
POST /api/reputation/batch

# Influencer
POST   /api/influencer
GET    /api/influencer
GET    /api/influencer/:id
GET    /api/influencer/wallet/:address
DELETE /api/influencer/:id

# Review
POST /api/review
GET  /api/review/influencer/:id
GET  /api/review/influencer/:id/count
GET  /api/review/check/:wallet/:influencerId

# Vote (NEW!)
POST /api/vote
GET  /api/vote/influencer/:id/stats
GET  /api/vote/influencer/:id
GET  /api/vote/check/:wallet/:influencerId
```

---

## Features

✅ **Implemented:**
- Multichain wallet analysis (6 networks)
- Automated reputation scoring
- Bot/Sybil detection via on-chain analysis
- In-memory caching untuk performance
- Batch processing untuk multiple wallets
- Influencer profile creation & management
- Community reviews system
- **Bullish/Bearish voting system** 🆕
- **Vote statistics & sentiment tracking** 🆕
- **One-time permanent votes** 🆕
- Reputation-gated actions (score >= 100)
- PostgreSQL database (Neon)
- Railway deployment ready

❌ **Not in Scope:**
- Smart contract voting (using backend instead)
- Custom indexer
- Social media API integration
- Authentication/JWT system (wallet-based)

---

## Testing

### Quick Test

```bash
# Health check
curl https://backend-production-85c5.up.railway.app/health

# Check reputation
curl https://backend-production-85c5.up.railway.app/api/reputation/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/quick

# Get all influencers
curl https://backend-production-85c5.up.railway.app/api/influencer
```

### Complete Flow Test

```bash
# 1. Create influencer
curl -X POST https://backend-production-85c5.up.railway.app/api/influencer \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
    "name": "Test Creator",
    "bio": "DeFi expert and educator"
  }'

# 2. Check voter reputation
curl https://backend-production-85c5.up.railway.app/api/reputation/0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed

# 3. Vote bullish (if score >= 100)
curl -X POST https://backend-production-85c5.up.railway.app/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "influencerId": "{ID_FROM_STEP_1}",
    "voterWalletAddress": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "voteType": "bullish"
  }'

# 4. Check vote stats
curl https://backend-production-85c5.up.railway.app/api/vote/influencer/{ID}/stats
```

---

## Deployment

Deployed on **Railway** with auto-deploy from GitHub.

**Environment Variables:**
- `ALCHEMY_API_KEY` - Alchemy API key
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NODE_ENV` - production
- `PORT` - 3000 (Railway auto-assigns)
- `CACHE_TTL` - 300000

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed deployment guide.

---

## Security

- ✅ Reputation gating (score >= 100 for votes)
- ✅ One vote per wallet per influencer
- ✅ Permanent votes (cannot be changed)
- ✅ Wallet address validation
- ✅ Input sanitization
- ✅ Database constraints (UNIQUE)
- ✅ SQL injection protection (parameterized queries)

---

## License

MIT

---

## Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: This README
- API Base URL: https://backend-production-85c5.up.railway.app
