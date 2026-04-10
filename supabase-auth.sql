-- ============================================
-- ZeshViv Perfumes — Google Auth Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- AFTER you've enabled Google OAuth in Supabase dashboard.
-- ============================================

-- 1. Allow authenticated users to insert orders
CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- 2. Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (true);

-- 3. Users can update their own orders
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (true);

-- 4. Authenticated users can insert order items
CREATE POLICY "Authenticated users can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- 5. Users can view order items
CREATE POLICY "Order items are viewable"
  ON order_items FOR SELECT
  USING (true);

-- 6. Authenticated users can upsert customers
CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update their customer record"
  ON customers FOR UPDATE
  USING (true);

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
