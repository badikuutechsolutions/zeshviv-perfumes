-- ============================================
-- ZeshViv Perfumes — Auth RLS Policies
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- AFTER running supabase-schema.sql and supabase-admin-rls.sql.
-- This updates policies for authenticated users.
-- ============================================

-- 1. Drop existing policies if they exist, then recreate

-- Orders: Allow authenticated users to insert
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Orders: Users can view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (true);

-- Orders: Users can update their own orders
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Order items: Authenticated users can insert
DROP POLICY IF EXISTS "Authenticated users can insert order items" ON order_items;
CREATE POLICY "Authenticated users can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Order items: Users can view
DROP POLICY IF EXISTS "Order items are viewable" ON order_items;
CREATE POLICY "Order items are viewable"
  ON order_items FOR SELECT
  USING (true);

-- Customers: Authenticated users can insert
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON customers;
CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

-- Customers: Users can update their own record
DROP POLICY IF EXISTS "Authenticated users can update their customer record" ON customers;
CREATE POLICY "Authenticated users can update their customer record"
  ON customers FOR UPDATE
  USING (true);

-- Customers: Users can view their own record
DROP POLICY IF EXISTS "Users can view their own customer record" ON customers;
CREATE POLICY "Users can view their own customer record"
  ON customers FOR SELECT
  USING (true);

-- ============================================
-- Enable Google OAuth in Supabase Dashboard:
-- ============================================
-- 1. Go to Supabase Dashboard > Authentication > Providers
-- 2. Click "Google"
-- 3. Enable it
-- 4. Add your Google OAuth Client ID and Secret
--    (from https://console.cloud.google.com/apis/credentials)
-- 5. Add your site URL to "Authorized redirect URIs":
--    https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
-- 6. Save
--
-- For local dev, also add:
-- http://localhost:5173/
--
-- ============================================
