# 💎 ZeshViv Perfumes

> **Mombasa's Premium Online Fragrance Store** — Powered by React + Supabase + Google Auth

A full-stack e-commerce application for selling perfumes online in Mombasa, Kenya. Guests can browse freely, but must sign in with Google to purchase.

**Features:**
- 🛍️ Guest browsing — no signup needed to view products
- 🔐 **Google Sign-In** — secure authentication via Gmail
- 🛒 Cart persists for guests (localStorage)
- 💳 Checkout requires Google sign-in
- 📦 Orders linked to authenticated user
- ⚙️ Admin Dashboard — manage inventory with password protection
- 📊 Business viability report included
- 📱 Fully responsive design

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier)
- A [Google Cloud](https://console.cloud.google.com) account (free)

### 1. Install Dependencies

```bash
git clone https://github.com/badikuutechsolutions/zeshviv-perfumes.git
cd zeshviv-perfumes
npm install
```

### 2. Set Up Supabase

#### A. Create Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **New Project** → name it `zeshviv-perfumes`
3. Save your database password
4. Region: EU West or East US

#### B. Run Database Migrations (in order)

Open **SQL Editor** in Supabase and run these files **one at a time**:

1. **`supabase-schema.sql`** — Creates tables + seeds 12 products
2. **`supabase-admin-rls.sql`** — Enables admin write access
3. **`supabase-auth-columns.sql`** — Adds auth columns (user_id, email)
4. **`supabase-auth.sql`** — Sets up auth RLS policies

#### C. Get API Credentials
1. **Settings** ⚙️ → **API**
2. Copy **Project URL** and **anon/public key**

### 3. Set Up Google OAuth

#### A. Create Google Cloud Credentials
1. Go to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
3. If prompted, configure the **OAuth consent screen**:
   - User Type: **External**
   - App name: `ZeshViv Perfumes`
   - User support email: your email
   - Scopes: `email`, `profile`, `openid` (add these)
   - Test users: add your test email
4. Back to **Create OAuth Client ID**:
   - Application type: **Web application**
   - Name: `ZeshViv Supabase Auth`
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (local dev)
     - `https://your-domain.vercel.app` (production)
   - **Authorized redirect URIs**:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - `http://localhost:5173/`
   - Click **Create**
5. Copy the **Client ID** and **Client Secret**

#### B. Enable Google in Supabase
1. Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** → click to enable
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

### 4. Configure Environment Variables

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Start Development Server

```bash
npm run dev
```

Open **http://localhost:5173** — browse as guest, sign in to purchase!

---

## 🔐 How Authentication Works

### Guest Users (No Sign-In Required)
- ✅ Browse all products
- ✅ View product details
- ✅ Add items to cart
- ✅ View cart

### Signed-In Users (Google/Gmail)
- ✅ Everything guests can do, PLUS:
- ✅ Proceed to checkout
- ✅ Place orders (tracked to their account)
- ✅ View order history
- ✅ Faster checkout (email auto-filled)

### Checkout Flow
1. User adds items to cart
2. Clicks "Proceed to Checkout"
3. If not signed in → redirected to **Sign In with Google** page
4. After Google login → redirected back to checkout
5. Email auto-filled from Google account
6. Complete order → order linked to their account

---

## ⚙️ Admin Panel

Access: Click **⚙️ Admin** in the navbar

**Password:** `zeshviv2025`

> To change: Edit `ADMIN_PASSWORD` in `src/pages/AdminPage.tsx` line 5

### Admin Features
- 📋 View all products in sortable table
- ➕ Add new perfumes
- ✏️ Edit existing products
- 🗑️ Delete products
- 📦 Toggle stock status
- 📊 Stats dashboard

---

## 📁 Project Structure

```
├── supabase-schema.sql            # Database schema + 12 seed products
├── supabase-admin-rls.sql         # Admin write access RLS
├── supabase-auth.sql              # Auth RLS policies
├── supabase-auth-columns.sql      # Add user_id, email columns
├── vercel.json                    # Vercel deployment config
├── .env                           # Your credentials (gitignored)
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx        # Google Auth provider
│   ├── lib/
│   │   └── supabase.ts            # Supabase client
│   ├── services/
│   │   └── products.ts            # Product fetching
│   ├── pages/
│   │   ├── HomePage.tsx           # Landing page
│   │   ├── ShopPage.tsx           # Product catalog
│   │   ├── ProductPage.tsx        # Product details
│   │   ├── CartPage.tsx           # Shopping cart
│   │   ├── CheckoutPage.tsx       # Checkout (auth required)
│   │   ├── AuthPage.tsx           # 🔐 Google Sign-In page
│   │   ├── OrderSuccessPage.tsx   # Order confirmation
│   │   ├── ViabilityPage.tsx      # Business report
│   │   └── AdminPage.tsx          # 🔐 Admin Dashboard
│   └── App.tsx                    # Main app + auth routing
```

---

## 🗄️ Database Schema

### Tables

| Table | Description |
|---|---|
| **`products`** | Perfume products (name, brand, price, notes, badges) |
| **`customers`** | Customer records (auto-created on checkout, tracks email) |
| **`orders`** | Orders with user_id, email, delivery, payment, status |
| **`order_items`** | Line items per order |

### Relationships
```
auth.users 1 ──⟨ orders 1 ──⟨ order_items ⟀── 1 products
               └── email ──⟨ customers
```

---

## 🌐 Deploy to Vercel

### 1. Connect GitHub
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Import: `badikuutechsolutions/zeshviv-perfumes`

### 2. Add Environment Variables
In Vercel → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### 3. Update Google OAuth Redirect
Add your production URL to Google OAuth:
- `https://your-app.vercel.app/`

And in Supabase Auth → URL Configuration:
- Add `https://your-app.vercel.app` to **Site URL**

### 4. Deploy
```bash
vercel --prod
```

---

## 🛠️ Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |

---

## 🔐 Security

- **Google OAuth** via Supabase Auth (secure, no password storage)
- **Row Level Security (RLS)** on all tables
- Orders linked to authenticated `user_id`
- Admin panel password-protected
- `.env` file gitignored

---

## 🎨 Brand

**ZeshViv Perfumes** = **Zesh** (Zeinab) + **Viv** (Vivian) + **Odipo**

---

## 📞 Support

- 📧 hello@zeshviv.co.ke
- 📞 0712 345 678
- 📍 Mombasa, Kenya

---

© 2025 ZeshViv Perfumes. All rights reserved.
Made with ❤️ in Mombasa, Kenya
