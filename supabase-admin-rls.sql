-- ============================================
-- ZeshViv Perfumes — Admin Write Access
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- AFTER running the main schema first.
-- This enables INSERT, UPDATE, DELETE on products.
-- ============================================

-- Allow anyone to INSERT/UPDATE/DELETE products
-- NOTE: This is protected by the admin password in the frontend.
-- For production, you should use Supabase Auth with service roles.

CREATE POLICY "Products can be inserted by anyone"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Products can be updated by anyone"
  ON products FOR UPDATE
  USING (true);

CREATE POLICY "Products can be deleted by anyone"
  ON products FOR DELETE
  USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run: SELECT * FROM products;
-- You should see 12 seeded perfumes.
