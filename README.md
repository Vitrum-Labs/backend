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
│   │   └── alchemy.ts                      # Multichain Alchemy clients
│   ├── models/
│   │   ├── influencer.model.ts             # Influencer data model
│   │   └── review.model.ts                 # Review data model
│   ├── services/
│   │   ├── wallet-analysis.service.ts      # Analyze wallet across all chains
│   │   ├── scoring.service.ts              # Calculate reputation score
│   │   ├── reputation.service.ts           # Main reputation service
│   │   ├── storage.service.ts              # In-memory storage (MVP)
│   │   ├── influencer.service.ts           # Influencer CRUD
│   │   └── review.service.ts               # Review CRUD
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

### 2. Environment Variables

Copy `.env.example` ke `.env` dan isi dengan Alchemy API Key:

```env
# Alchemy Configuration
ALCHEMY_API_KEY=your_alchemy_api_key_here

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

## Influencer Endpoints

### 9. Create Influencer Profile

```http
POST /api/influencer
Content-Type: application/json

{
  "walletAddress": "0x...",
  "name": "Vitalik Buterin",
  "bio": "Co-founder of Ethereum...",
  "socialLinks": {
    "twitter": "https://twitter.com/VitalikButerin",
    "telegram": "...",
    "website": "..."
  },
  "profileImage": "https://..."
}
```

**Requirements:**
- ✅ Wallet score >= 100 (eligible)
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
    "bio": "...",
    "socialLinks": {...},
    "createdAt": 1234567890,
    "totalReviews": 0,
    "bullishCount": 0,
    "bearishCount": 0,
    "sentimentScore": 0
  }
}
```

### 10. Get All Influencers

```http
GET /api/influencer?sortBy=recent
```

**Query Params:**
- `sortBy`: `recent` | `popular` | `bullish` (optional)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### 11. Get Influencer by ID

```http
GET /api/influencer/:id
```

### 12. Get Influencer by Wallet

```http
GET /api/influencer/wallet/:address
```

---

## Review Endpoints

### 13. Create Review (Vote Bullish/Bearish)

```http
POST /api/review
Content-Type: application/json

{
  "influencerId": "uuid-...",
  "reviewerWalletAddress": "0x...",
  "sentiment": "bullish",
  "comment": "Great insights on DeFi trends!"
}
```

**Requirements:**
- ✅ Reviewer wallet score >= 100 (eligible)
- ✅ Influencer must exist
- ✅ One vote per influencer per wallet
- ✅ Sentiment: `bullish` or `bearish`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-...",
    "influencerId": "uuid-...",
    "reviewerWalletAddress": "0x...",
    "sentiment": "bullish",
    "comment": "...",
    "createdAt": 1234567890
  }
}
```

### 14. Get Influencer Reviews

```http
GET /api/review/influencer/:influencerId
```

### 15. Get Review Stats

```http
GET /api/review/influencer/:influencerId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviews": 50,
    "bullishCount": 35,
    "bearishCount": 15,
    "sentimentScore": 70.0
  }
}
```

### 16. Get Reviews by Reviewer

```http
GET /api/review/reviewer/:walletAddress
```

### 17. Check if Reviewed

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
  totalReviews: number;
  bullishCount: number;
  bearishCount: number;
  sentimentScore: number; // 0-100 percentage
}
```

### Review Model

```typescript
{
  id: string;
  influencerId: string;
  reviewerWalletAddress: string;
  sentiment: 'bullish' | 'bearish';
  comment?: string;
  createdAt: number;
}
```

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
1. **Database**: Migrate ke PostgreSQL/MongoDB
2. **Caching**: Redis untuk distributed caching
3. **Queue**: Bull/BullMQ untuk background jobs
4. **Rate Limiting**: Implement API rate limiting
5. **Authentication**: Add JWT/session management
6. **IPFS**: Store profile images di IPFS
7. **Events**: Emit events untuk NFT minting

**MVP Priority: Reliability > Complexity** - Simple tapi solid untuk hackathon demo! 🚀
