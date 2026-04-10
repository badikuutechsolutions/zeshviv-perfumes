# 💎 ZeshViv Perfumes

> **Mombasa's Premium Online Fragrance Store** — Powered by React + Supabase

A full-stack e-commerce application for selling perfumes online in Mombasa, Kenya. Built with React, TypeScript, Tailwind CSS, and Supabase backend.

**Features:**
- 🛍️ Full product catalog with filtering, sorting, and search
- 🛒 Shopping cart with localStorage persistence
- 💳 Checkout with M-Pesa and Cash on Delivery options
- 📦 Orders stored in Supabase database
- 👥 Customer tracking and order history
- 📊 Business viability report built-in
- 📱 Fully responsive design

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier works perfectly)

### 1. Clone & Install

```bash
npm install
```

### 2. Set Up Supabase

#### Step A: Create a Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in / Sign up
3. Click **"New Project"**
4. Choose your organization
5. Fill in:
   - **Project name**: `zeshviv-perfumes`
   - **Database password**: (save this securely)
   - **Region**: Choose closest to Kenya (EU West or East US)
6. Click **"Create new project"**

#### Step B: Run the Database Schema
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)
6. You should see: `Products: 12` and `Tables created: 4`

#### Step C: Get Your API Credentials
1. In Supabase dashboard, go to **Project Settings** (gear icon ⚙️)
2. Click **"API"** in the left sidebar
3. Under **Project URL**, copy the URL (looks like: `https://xxxxx.supabase.co`)
4. Under **Project API keys**, copy the **`anon` / `public`** key

### 3. Configure Environment Variables

1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and paste your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📁 Project Structure

```
├── supabase-schema.sql        # Database schema & seed data (run in Supabase)
├── .env.example               # Environment variables template
├── .env                       # Your credentials (gitignored)
├── src/
│   ├── lib/
│   │   └── supabase.ts        # Supabase client initialization
│   ├── services/
│   │   └── products.ts        # Product data fetching utilities
│   ├── types/
│   │   ├── index.ts           # App-level TypeScript interfaces
│   │   └── database.types.ts  # Supabase database type definitions
│   ├── components/
│   │   ├── Navbar.tsx         # Navigation bar
│   │   └── ProductCard.tsx    # Reusable product card
│   ├── pages/
│   │   ├── HomePage.tsx       # Landing page
│   │   ├── ShopPage.tsx       # Product catalog
│   │   ├── ProductPage.tsx    # Product details
│   │   ├── CartPage.tsx       # Shopping cart
│   │   ├── CheckoutPage.tsx   # Checkout form
│   │   ├── OrderSuccessPage.tsx  # Order confirmation
│   │   └── ViabilityPage.tsx  # Business report
│   ├── App.tsx                # Main app with state management
│   └── main.tsx               # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🗄️ Database Schema

### Tables

| Table | Description |
|---|---|
| **`products`** | 12 perfume products with full metadata |
| **`customers`** | Customer records (auto-created on checkout) |
| **`orders`** | Order records with delivery and payment info |
| **`order_items`** | Individual items per order |

### Relationships
```
customers 1 ──⟨ orders 1 ──⟨ order_items ⟀── 1 products
```

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🔐 Security Notes

- **Row Level Security (RLS)** is enabled on all tables
- Products are publicly readable (required for browsing)
- Orders and customers can be inserted by anyone (for checkout)
- The `anon` key is safe to expose in frontend code — RLS policies protect your data
- **Never** commit your `.env` file to version control

---

## 🎨 Brand Identity

**ZeshViv Perfumes** = **Zesh** (from Zeinab) + **Viv** (from Vivian) + **Odipo**

A unique, memorable name that reflects the founders' identity while sounding premium and professional.

---

## 🌍 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```
Add your environment variables in the Vercel dashboard.

### Netlify
```bash
npm run build
# Drag the `dist` folder to Netlify
```

### Manual
```bash
npm run build
# Upload the `dist` folder to any static hosting
```

---

## 📞 Support

For issues or questions:
- 📧 hello@zeshviv.co.ke
- 📞 0712 345 678
- 📍 Mombasa, Kenya

---

## 📄 License

© 2025 ZeshViv Perfumes. All rights reserved.

Made with ❤️ in Mombasa, Kenya
