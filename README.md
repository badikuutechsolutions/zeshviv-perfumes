# 💎 ZeshViv Perfumes

> **Mombasa's Premium Online Fragrance Store** — Powered by React + Supabase

A full-stack e-commerce application for selling perfumes online in Mombasa, Kenya. Built with React, TypeScript, Tailwind CSS, and Supabase backend.

**Features:**
- 🛍️ Full product catalog with filtering, sorting, and search
- 🛒 Shopping cart with localStorage persistence
- 💳 Checkout with M-Pesa and Cash on Delivery options
- 📦 Orders stored in Supabase database
- 👥 Customer tracking and order history
- ⚙️ **Admin Dashboard** — Add, edit, delete, manage inventory
- 📊 Business viability report built-in
- 📱 Fully responsive design

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier works perfectly)

### 1. Clone & Install

```bash
git clone https://github.com/badikuutechsolutions/zeshviv-perfumes.git
cd zeshviv-perfumes
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

#### Step C: Enable Admin Write Access
1. Still in SQL Editor, create another **"New Query"**
2. Open `supabase-admin-rls.sql` from this project
3. Copy and paste, then **"Run"**
4. This enables adding/editing/deleting products from the admin panel

#### Step D: Get Your API Credentials
1. In Supabase dashboard, go to **Project Settings** (gear icon ⚙️)
2. Click **"API"** in the left sidebar
3. Under **Project URL**, copy the URL (looks like: `https://xxxxx.supabase.co`)
4. Under **Project API keys**, copy the **`anon` / `public`** key

### 3. Configure Environment Variables

1. Create a `.env` file in the project root:
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

## ⚙️ Admin Panel

Access the admin dashboard at: **http://localhost:5173/#admin** (or click **⚙️ Admin** in the navbar)

### Admin Password
Default password: `zeshviv2025`

> **To change it:** Open `src/pages/AdminPage.tsx` and change the `ADMIN_PASSWORD` constant at the top of the file.

### Features
- 📋 **View all products** in a sortable table
- ➕ **Add new perfumes** with full details (name, brand, price, notes, badges, etc.)
- ✏️ **Edit existing products** inline
- 🗑️ **Delete products** with confirmation
- 📦 **Toggle stock** status (in stock / out of stock)
- 📊 **Stats dashboard** (total products, in stock, out of stock)

---

## 📁 Project Structure

```
├── supabase-schema.sql          # Database schema + seed data (run in Supabase)
├── supabase-admin-rls.sql       # Admin write access RLS policies
├── vercel.json                  # Vercel deployment config
├── .env.example                 # Environment variables template
├── .env                         # Your credentials (gitignored)
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabase client initialization
│   ├── services/
│   │   └── products.ts          # Product data fetching utilities
│   ├── types/
│   │   ├── index.ts             # App-level TypeScript interfaces
│   │   └── database.types.ts    # Supabase database type definitions
│   ├── components/
│   │   ├── Navbar.tsx           # Navigation bar with Admin link
│   │   └── ProductCard.tsx      # Reusable product card
│   ├── pages/
│   │   ├── HomePage.tsx         # Landing page
│   │   ├── ShopPage.tsx         # Product catalog with filters
│   │   ├── ProductPage.tsx      # Product details + related products
│   │   ├── CartPage.tsx         # Shopping cart
│   │   ├── CheckoutPage.tsx     # Checkout with M-Pesa/Cash
│   │   ├── OrderSuccessPage.tsx # Order confirmation
│   │   ├── ViabilityPage.tsx    # Business viability report
│   │   └── AdminPage.tsx        # 🔐 Admin Dashboard (CRUD)
│   ├── App.tsx                  # Main app with state management
│   └── main.tsx                 # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🗄️ Database Schema

### Tables

| Table | Description |
|---|---|
| **`products`** | Perfume products with full metadata (name, brand, price, notes, badges) |
| **`customers`** | Customer records (auto-created on checkout, tracks order history) |
| **`orders`** | Order records with delivery zone, payment method, status |
| **`order_items`** | Individual line items per order |

### Relationships
```
customers 1 ──⟨ orders 1 ──⟨ order_items ⟀── 1 products
```

### RLS Policies
- Products: publicly readable, writable via admin panel
- Customers: insertable by anyone, readable publicly
- Orders: insertable by anyone, readable publicly
- Order items: insertable and readable by anyone

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🌐 Deploy to Vercel

### Option 1: Connect GitHub (Recommended)

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Sign in with your GitHub account
3. Click **"Import Git Repository"**
4. Select: `badikuutechsolutions/zeshviv-perfumes`
5. Click **"Import"**

### Option 2: Deploy via CLI

```bash
npm install -g vercel
vercel
```

### Add Environment Variables in Vercel

In your Vercel project dashboard → **Settings** → **Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

### Deploy!
```bash
vercel --prod
```

Your store will be live at `https://zeshviv-perfumes.vercel.app` (or your custom domain).

---

## 🔐 Security Notes

- **Row Level Security (RLS)** is enabled on all tables
- Admin panel has a **password gate** (default: `zeshviv2025`)
- The `anon` key is safe to expose in frontend code — RLS policies protect your data
- **Never** commit your `.env` file to version control
- For production, consider upgrading to Supabase Auth for admin access

---

## 🎨 Brand Identity

**ZeshViv Perfumes** = **Zesh** (from Zeinab) + **Viv** (from Vivian) + **Odipo**

A unique, memorable name that reflects the founders' identity while sounding premium and professional.

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
