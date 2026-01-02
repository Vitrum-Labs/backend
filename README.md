# Vitrum Backend – Web3 Influencer Credibility Platform

The backend for **Vitrum**, a Web3-based crypto/blockchain influencer credibility platform featuring **Automated Reputation Scoring**, **Bot/Sybil Detection**, **Community Reviews**, and a **Bullish/Bearish Voting System**.

---

## 🌐 Live API

**Production URL:**
`https://backend-production-85c5.up.railway.app`

---

## Overview

This backend provides the following capabilities:

### 🎯 Core Features

1. **Multichain Reputation Scoring**

   * Analyzes wallet activity across **6 blockchain networks**
   * Calculates reputation scores based on:

     * Wallet age
     * Transaction count
     * Multichain activity
   * Automated bot/sybil filtering via scoring
   * Minimum score **100** required for eligibility

2. **Influencer Profiles**

   * Anyone can create an influencer profile (no reputation requirement)
   * Displays influencer social credibility
   * Tracks reviews and voting statistics

3. **Community Reviews**

   * Users can add reviews/comments for influencers (**requires score ≥ 100**)
   * One review per influencer per wallet
   * Permanent, timestamped comments

4. **Bullish / Bearish Voting System** 🆕

   * Vote *bullish* or *bearish* on influencers (**requires score ≥ 100**)
   * **One vote per wallet per influencer (permanent and immutable)**
   * Real-time sentiment tracking and statistics
   * Backend-based voting (off-chain, not smart contracts)

5. **Bot / Sybil Prevention**

   * New or low-activity wallets receive low scores
   * Only eligible wallets (score ≥ 100) can review or vote
   * Multichain activity used to detect genuine users

---

## Tech Stack

* **Runtime:** Node.js 18+ / TypeScript
* **Framework:** Express.js
* **Database:** PostgreSQL (Neon Serverless)
* **Blockchain Provider:** Alchemy SDK (Multichain)
* **Web3 Library:** ethers.js v6
* **Caching:** In-memory cache with TTL
* **Deployment:** Railway
* **Supported Networks:**
  Ethereum, Arbitrum, Polygon, Optimism, Base, Polygon zkEVM

---

## Folder Structure

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
│   │   └── vote.model.ts                   # Vote data model
│   ├── services/
│   │   ├── wallet-analysis.service.ts      # Multichain wallet analysis
│   │   ├── scoring.service.ts              # Reputation scoring logic
│   │   ├── reputation.service.ts           # Main reputation service
│   │   ├── storage.service.ts              # PostgreSQL storage
│   │   ├── influencer.service.ts           # Influencer CRUD
│   │   ├── review.service.ts               # Review CRUD
│   │   └── vote.service.ts                 # Vote CRUD
│   ├── routes/
│   │   ├── reputation.route.ts             # Reputation endpoints
│   │   ├── status.route.ts                 # Health & cache endpoints
│   │   ├── influencer.route.ts             # Influencer endpoints
│   │   ├── review.route.ts                 # Review endpoints
│   │   └── vote.route.ts                   # Vote endpoints
│   └── utils/
│       └── cache.ts                        # In-memory caching
├── database/
│   └── schema.sql                          # Full database schema
├── package.json
├── tsconfig.json
├── .env.example
├── nixpacks.toml                           # Railway build config
├── railway.json                            # Railway deployment config
└── README.md
```

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Database Setup (Neon PostgreSQL)

#### Create Neon Database

1. Register at [https://neon.tech](https://neon.tech)
2. Create a new project
3. Select the nearest region (US East recommended)
4. Copy the provided connection string

#### Configure Environment Variables

Copy `.env.example` to `.env`:

```env
# Alchemy
ALCHEMY_API_KEY=your_alchemy_api_key

# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Server
PORT=3000
NODE_ENV=development

# Cache (optional)
CACHE_TTL=300000
```

**Getting an Alchemy API Key:**

1. Sign up at [https://www.alchemy.com](https://www.alchemy.com)
2. Create a new app
3. Select any network (key works across networks)
4. Copy the API key

---

### 3. Initialize Database Tables

Run the SQL schema in the Neon console:

```sql
-- Paste contents of database/schema.sql
-- or src/config/database.sql
```

**Database Tables:**

* `influencers`
* `reviews`
* `votes`
* Indexes for wallet lookups and timestamps
* Constraints:

  * `UNIQUE(influencer_id, voter_wallet_address)` (one vote per wallet)

---

### 4. Run Development Server

```bash
npm run dev
```

Server will be available at:

```
http://localhost:3000
```

---

### 5. Production Build

```bash
npm run build
npm start
```

---

## API Endpoints

**Base URL:**
`https://backend-production-85c5.up.railway.app`

### Health

```http
GET /
GET /health
```

---

## Reputation

```http
GET  /api/reputation/:wallet
GET  /api/reputation/:wallet/quick
POST /api/reputation/batch
```

---

## Influencer

```http
POST   /api/influencer
GET    /api/influencer
GET    /api/influencer/:id
GET    /api/influencer/wallet/:address
DELETE /api/influencer/:id
```

---

## Reviews

```http
POST /api/review
GET  /api/review/influencer/:id
GET  /api/review/influencer/:id/count
GET  /api/review/check/:wallet/:influencerId
```

---

## Voting 🆕

```http
POST /api/vote
GET  /api/vote/influencer/:id/stats
GET  /api/vote/influencer/:id
GET  /api/vote/check/:wallet/:influencerId
```

---

## Features Summary

✅ Implemented:

* Multichain wallet analysis
* Automated reputation scoring
* Bot/sybil detection
* Influencer profiles
* Community reviews
* Bullish/Bearish voting
* Sentiment analytics
* Reputation-gated actions
* PostgreSQL (Neon)
* Railway deployment

❌ Out of Scope:

* On-chain voting
* Custom blockchain indexer
* Social media API integrations
* Authentication/JWT (wallet-based only)

---

## Deployment

Deployed on **Railway** with GitHub auto-deploy.

**Required Environment Variables:**

* `ALCHEMY_API_KEY`
* `DATABASE_URL`
* `NODE_ENV`
* `PORT`
* `CACHE_TTL`

---

## Security

* Reputation-based access control
* One permanent vote per wallet
* Input validation & sanitization
* SQL injection protection
* Database-level constraints

---

## License

MIT

---

## Support

* GitHub Issues
* This README
* API Base URL:
  `https://backend-production-85c5.up.railway.app`
