# Panduan Deploy ke Railway

Panduan lengkap untuk deploy Vitrum Backend ke Railway.

## Prerequisites

1. Akun Railway (gratis) - [railway.app](https://railway.app)
2. Akun GitHub (untuk deploy via Git)
3. Alchemy API Key - [alchemy.com](https://www.alchemy.com)
4. Neon PostgreSQL Database - [neon.tech](https://neon.tech)

---

## Langkah 1: Persiapan Database PostgreSQL

### Opsi A: Menggunakan Neon (Recommended)

1. Buka [console.neon.tech](https://console.neon.tech)
2. Login/Sign up (gratis)
3. Buat project baru
4. Salin **Connection String**:
   ```
   postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Opsi B: Menggunakan Railway Postgres

Railway juga menyediakan PostgreSQL built-in (akan dijelaskan di langkah deployment).

---

## Langkah 2: Push Code ke GitHub

1. **Inisialisasi Git Repository** (jika belum):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Buat Repository di GitHub**:
   - Buka [github.com/new](https://github.com/new)
   - Buat repository baru (public/private)
   - Jangan initialize dengan README

3. **Push ke GitHub**:
   ```bash
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## Langkah 3: Deploy ke Railway

### A. Buat Project Baru di Railway

1. Buka [railway.app](https://railway.app)
2. Login dengan GitHub
3. Click **"New Project"**
4. Pilih **"Deploy from GitHub repo"**
5. Pilih repository Anda
6. Railway akan otomatis detect dan mulai build

### B. Setup Environment Variables

Setelah project terbuat:

1. Click pada service yang baru dibuat
2. Pilih tab **"Variables"**
3. Tambahkan environment variables berikut:

```env
# Alchemy API Key
ALCHEMY_API_KEY=your_actual_alchemy_api_key_here

# Database URL dari Neon
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Server Configuration
PORT=3000
NODE_ENV=production

# Cache Configuration
CACHE_TTL=300000
```

**Cara mendapatkan Alchemy API Key:**
1. Buka [dashboard.alchemy.com](https://dashboard.alchemy.com)
2. Login/Sign up (gratis)
3. Create new App
   - Chain: Arbitrum
   - Network: Arbitrum Mainnet
4. Salin API Key

### C. Tambahkan PostgreSQL Database (Opsional)

Jika ingin menggunakan Railway Postgres daripada Neon:

1. Di Railway dashboard, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Database akan otomatis terbuat
3. Railway akan otomatis inject `DATABASE_URL` ke environment variables
4. **Hapus** `DATABASE_URL` yang manual jika sudah ada

---

## Langkah 4: Setup Database Schema

Setelah deployment berhasil, Anda perlu membuat tables di PostgreSQL.

### Opsi A: Via Railway Shell

1. Di Railway dashboard, pilih service Anda
2. Click tab **"Settings"** → scroll ke bawah
3. Atau gunakan fitur **Connect** untuk akses database

### Opsi B: Via Neon Console

1. Buka Neon Console → pilih project Anda
2. Click **"SQL Editor"**
3. Run SQL berikut:

```sql
-- Create influencers table
CREATE TABLE IF NOT EXISTS influencers (
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
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(255) PRIMARY KEY,
  influencer_id VARCHAR(255) REFERENCES influencers(id) ON DELETE CASCADE,
  reviewer_wallet_address VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_influencers_wallet ON influencers(wallet_address);
CREATE INDEX idx_reviews_influencer ON reviews(influencer_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_wallet_address);
```

---

## Langkah 5: Verifikasi Deployment

1. **Dapatkan URL Deployment**:
   - Railway akan generate URL otomatis: `https://your-app.up.railway.app`
   - Bisa dilihat di tab **"Settings"** → **"Domains"**

2. **Test API**:
   ```bash
   # Health check
   curl https://your-app.up.railway.app/health

   # Get all influencers
   curl https://your-app.up.railway.app/api/influencer
   ```

3. **Cek Logs**:
   - Di Railway dashboard, pilih tab **"Deployments"**
   - Click deployment terakhir untuk lihat logs
   - Pastikan tidak ada error

---

## Langkah 6: Custom Domain (Opsional)

1. Di Railway dashboard, pilih service Anda
2. Click tab **"Settings"** → **"Domains"**
3. Click **"Custom Domain"**
4. Masukkan domain Anda (contoh: `api.vitrum.app`)
5. Update DNS records di domain provider Anda:
   - Type: `CNAME`
   - Name: `api` (atau subdomain lain)
   - Value: URL yang diberikan Railway

---

## Troubleshooting

### Build Failed

Jika build gagal, cek:
1. Logs di Railway dashboard
2. Pastikan `package.json` memiliki script `build` dan `start`
3. Pastikan dependencies sudah benar

### Database Connection Error

1. Pastikan `DATABASE_URL` sudah benar
2. Test connection string di local dulu
3. Cek apakah IP Railway sudah di-whitelist (kalau pakai Neon, default semua IP diizinkan)

### Application Not Starting

1. Cek environment variables sudah lengkap
2. Lihat logs untuk error message
3. Pastikan PORT variable sudah di-set

### TypeScript Build Error

Jika ada error TypeScript saat build:
```bash
# Local test build
npm run build
```

Perbaiki error yang muncul, lalu push lagi ke GitHub.

---

## Monitoring dan Maintenance

### View Logs
```bash
# Di Railway, click service → tab "Deployments" → pilih deployment
# Atau gunakan Railway CLI:
railway logs
```

### Redeploy
Setiap kali Anda push ke GitHub branch `main`, Railway akan otomatis redeploy.

### Rollback
Di Railway dashboard:
1. Tab **"Deployments"**
2. Pilih deployment sebelumnya
3. Click **"Redeploy"**

---

## Railway CLI (Opsional)

Install Railway CLI untuk manage dari terminal:

```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Open in browser
railway open
```

---

## Checklist Deployment

- [ ] Code sudah di push ke GitHub
- [ ] Alchemy API Key sudah didapat
- [ ] Database PostgreSQL sudah dibuat (Neon/Railway)
- [ ] Tables sudah dibuat di database
- [ ] Railway project sudah dibuat
- [ ] Environment variables sudah di-set
- [ ] Deployment berhasil (cek logs)
- [ ] Health check endpoint works
- [ ] API endpoints tested
- [ ] (Opsional) Custom domain configured

---

## Estimasi Biaya

- **Railway Free Tier**: $5 credit/bulan (cukup untuk development)
- **Neon Free Tier**: 0.5 GB storage, 10 GB transfer (cukup untuk MVP)
- **Alchemy Free Tier**: 300M compute units/bulan

Untuk production, consider upgrade ke:
- Railway Hobby: $5/bulan
- Neon Pro: $19/bulan
- Alchemy Growth: $49/bulan

---

## Next Steps

Setelah deployment berhasil:
1. Test semua endpoint
2. Setup monitoring (Railway sudah include basic metrics)
3. Setup CI/CD jika diperlukan
4. Configure alerts untuk downtime
5. Backup database secara regular

---

## Support

Jika ada masalah:
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Neon Docs: [neon.tech/docs](https://neon.tech/docs)
