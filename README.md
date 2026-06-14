# HL App - Sales & Receivables Management

Aplikasi single-user internal untuk mengelola **Customer**, **Produk**, **Transaksi (Bon)**, **Piutang**, **Bonus**, dan **Laporan** untuk bisnis "HL".

**Mata uang:** IDR (Rp) only, no tax/PPN.  
**Basis akuntansi:** Cash basis — omzet, laba, dan bonus diakui hanya saat transaksi **Lunas**.

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Supabase** (Auth + Database)
- **TypeScript**

## Demo Credentials

Setelah setup Supabase, buat user di **Supabase Dashboard > Authentication > Add User**:

| Field    | Value         |
| -------- | ------------- |
| Email    | `admin@hl.com` |
| Password | `password123`  |

## Setup

### 1. Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan seluruh isi file `schema.sql`
3. Catat `Project URL` dan `anon public key` dari **Settings > API**

### 2. Environment Variables

Copy `.env.local` dan isi dengan kredensial Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### 4. Create User

Di **Supabase Dashboard > Authentication > Add User**, buat user:

- Email: `admin@hl.com`
- Password: `password123`

## Fitur

### 🔐 Authentication
- Single user login (Supabase Auth)
- Session persistent dengan cookie httpOnly
- Logout tersedia di sidebar

### 👥 Customer Management (CRUD)
- Nama, Diskon LM, Diskon BR, Threshold Bonus
- **Cascading discount**: diskon diterapkan berurutan (bukan dijumlahkan)
  - Contoh: Base 100, Diskon [20, 20, 10] → 100 × 0.8 × 0.8 × 0.9 = 57.6
- Soft-delete: customer disembunyikan dari selection baru, history tetap utuh

### 📦 Product Management (CRUD)
- Nama, Harga Modal, Harga Base/Jual, Tipe (LM/BR)
- Harga Modal digunakan hanya untuk perhitungan laba (tidak ditampilkan ke customer)
- Soft-delete

### 📝 Transaction (Bon) Management
- Tanggal, Nomor Bon (unique), Customer, Produk line items, Ongkir, Deskripsi
- **Diskon otomatis** dihitung dari customer × tipe produk — user tidak mengetik diskon manual
- Status: Piutang / Lunas
- Perhitungan real-time: omzet, laba, total piutang

### 🎁 Bonus Logic
- Akumulasi omzet Lunas per customer
- Bonus = floor(akumulasi / threshold) - bonus sudah diberikan
- Bonus stacking: multiple bonus dalam satu bon
- Bonus items gratis — tidak mempengaruhi omzet dan laba

### 💰 Settlement (Pelunasan)
- **Lunas per Bon**: satu transaksi ditandai Lunas dengan tanggal pelunasan
- **Lunas per Bulan**: semua transaksi Piutang dalam 1 bulan untuk 1 customer dilunasi sekaligus
- Omzet dan Laba diakui saat Lunas (cash basis)

### 📊 Recap / Reporting
- Per customer, per tipe (LM/BR), overall
- Filter per bulan & per tahun
- Download PDF

## Struktur Proyek

```
hl-app/
├── proxy.ts                    # Auth guard (Next.js 16 proxy)
├── schema.sql                  # Database schema
├── src/
│   ├── app/
│   │   ├── api/                # API routes
│   │   ├── customers/          # Customer pages
│   │   ├── login/              # Login page
│   │   ├── products/           # Product pages
│   │   ├── reports/            # Reports page
│   │   ├── transactions/       # Transaction pages
│   │   ├── globals.css
│   │   ├── layout.tsx          # Root layout with sidebar
│   │   └── page.tsx            # Dashboard
│   ├── components/             # Shared components
│   ├── lib/
│   │   ├── auth.ts             # Session verification
│   │   ├── calculations.ts     # Business logic (discount, omzet, bonus)
│   │   ├── db/                 # Database operations (server-only)
│   │   └── supabase/           # Supabase clients
│   └── types/                  # TypeScript types
└── public/
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables di Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Manual

```bash
npm run build
npm start
```
