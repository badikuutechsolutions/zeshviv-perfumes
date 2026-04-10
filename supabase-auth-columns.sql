-- ============================================
-- ZeshViv Perfumes — Add Auth Columns
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- to add user_id and email columns to orders
-- and email column to customers table.
-- ============================================

-- Add user_id and email to orders table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'user_id') THEN
    ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'email') THEN
    ALTER TABLE orders ADD COLUMN email TEXT;
  END IF;
END $$;

-- Add email to customers table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'customers' AND column_name = 'email') THEN
    ALTER TABLE customers ADD COLUMN email TEXT;
  END IF;
END $$;

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- ============================================
-- Update RLS to allow authenticated users
-- ============================================

-- Allow authenticated users to insert orders
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own orders
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Everyone can view orders (for order confirmation)
DROP POLICY IF EXISTS "Orders are viewable by phone match" ON orders;
CREATE POLICY "Orders are viewable"
  ON orders FOR SELECT
  USING (true);
