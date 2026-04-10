-- ============================================
-- ZeshViv Perfumes — Settings & Admin Users
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- 1. STORE SETTINGS TABLE (key-value store)
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO store_settings (key, value) VALUES
  ('store_name', 'ZeshViv Perfumes'),
  ('store_tagline', 'Mombasa''s Premium Perfume Store'),
  ('store_phone', '0712 345 678'),
  ('store_email', 'hello@zeshviv.co.ke'),
  ('store_whatsapp', '0712 345 678'),
  ('pochi_number', '0712 345 678'),
  ('pochi_name', 'ZeshViv Perfumes'),
  ('free_delivery_threshold', '3000'),
  ('default_delivery_fee', '200'),
  ('working_hours', '8am – 9pm daily'),
  ('delivery_zones', '[
    {"name":"Mombasa CBD","fee":0,"free_over":3000,"time":"1-2 hours","label":"FREE over KES 3k, else KES 150"},
    {"name":"Nyali & Bamburi","fee":200,"free_over":99999,"time":"2-3 hours","label":"KES 200"},
    {"name":"Likoni & South Coast","fee":250,"free_over":99999,"time":"2-4 hours","label":"KES 250"},
    {"name":"Kisauni & Bombolulu","fee":200,"free_over":99999,"time":"2-3 hours","label":"KES 200"},
    {"name":"Mtwapa","fee":300,"free_over":99999,"time":"3-4 hours","label":"KES 300"},
    {"name":"Diani & Ukunda","fee":400,"free_over":99999,"time":"Next day","label":"KES 400"}
  ]'),
  ('admin_password', 'zeshviv2025')
ON CONFLICT (key) DO NOTHING;

-- 2. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- RLS Policies

-- Store settings: everyone can read, only admins can write
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store settings are publicly readable"
  ON store_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update store settings"
  ON store_settings FOR UPDATE
  USING (true);

CREATE POLICY "Admins can insert store settings"
  ON store_settings FOR INSERT
  WITH CHECK (true);

-- Admin users: authenticated admins can read, super_admin can write
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users are viewable by authenticated admins"
  ON admin_users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert admin users (frontend controlled)"
  ON admin_users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update admin users (frontend controlled)"
  ON admin_users FOR UPDATE
  USING (true);

CREATE POLICY "Super admin can delete admin users"
  ON admin_users FOR DELETE
  USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT key, LEFT(value, 50) as preview FROM store_settings ORDER BY key;
SELECT * FROM admin_users;
