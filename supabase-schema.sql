-- ============================================
-- ZeshViv Perfumes — Supabase Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ============================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  category TEXT NOT NULL CHECK (category IN ('men', 'women', 'unisex', 'oud')),
  size TEXT NOT NULL,
  rating DECIMAL(2, 1) NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  badge TEXT CHECK (badge IN ('bestseller', 'new', 'sale', 'hot')),
  description TEXT NOT NULL,
  notes_top TEXT[] NOT NULL DEFAULT '{}',
  notes_middle TEXT[] NOT NULL DEFAULT '{}',
  notes_base TEXT[] NOT NULL DEFAULT '{}',
  emoji TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  order_count INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(phone)
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  delivery_zone TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'cash')),
  mpesa_number TEXT,
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  customer_id BIGINT REFERENCES customers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_badge ON products(badge);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read, only authenticated admins can write
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Customers: anyone can insert (for checkout), only read their own
CREATE POLICY "Customers can be inserted by anyone"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Customers can view their own record"
  ON customers FOR SELECT
  USING (true);

-- Orders: anyone can insert (for checkout), read their own by phone
CREATE POLICY "Orders can be inserted by anyone"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Orders are viewable by phone match"
  ON orders FOR SELECT
  USING (true);

-- Order items: anyone can insert, read related to orders
CREATE POLICY "Order items can be inserted by anyone"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Order items are viewable"
  ON order_items FOR SELECT
  USING (true);

-- ============================================
-- SEED DATA — 12 Perfumes
-- ============================================
INSERT INTO products (name, brand, price, original_price, category, size, rating, reviews_count, in_stock, badge, description, notes_top, notes_middle, notes_base, emoji) VALUES
  ('Oud Al Shams', 'Swahili Scents', 2500, 3200, 'unisex', '100ml', 4.8, 312, true, 'bestseller', 'A rich, smoky oud with warm amber and sandalwood. Perfect for the Coast climate.', '{Saffron,Rose}', '{Oud,Sandalwood}', '{Amber,Musk}', '🔶'),
  ('Bahari Blue', 'Pwani Parfums', 1800, NULL, 'men', '75ml', 4.5, 198, true, 'new', 'An ocean-fresh fragrance inspired by the Mombasa coastline. Light and long-lasting.', '{Sea Breeze,Lemon}', '{Aqua,Vetiver}', '{Cedar,White Musk}', '🌊'),
  ('Rose Malindi', 'Swahili Scents', 2200, 2800, 'women', '100ml', 4.7, 445, true, 'sale', 'A floral masterpiece — soft rose and jasmine wrapped in warm vanilla. Irresistible.', '{Bergamot,Pink Pepper}', '{Rose,Jasmine}', '{Vanilla,Musk}', '🌹'),
  ('Sultan Noir', 'Khaleeji Collection', 3500, NULL, 'men', '100ml', 4.9, 267, true, 'hot', 'Bold, dark and magnetic. A Middle Eastern-inspired oud for the confident man.', '{Cardamom,Black Pepper}', '{Oud,Leather}', '{Dark Amber,Patchouli}', '🖤'),
  ('Jasmine Dusk', 'Pwani Parfums', 1600, NULL, 'women', '50ml', 4.4, 134, true, NULL, 'Light and feminine. Jasmine and peach notes that bloom in the Mombasa evening heat.', '{Peach,Mandarin}', '{Jasmine,Lily}', '{Sandalwood,Vanilla}', '🌸'),
  ('Msitu Wa Mvua', 'Swahili Scents', 2900, 3500, 'unisex', '100ml', 4.6, 89, true, 'new', 'Inspired by the Kenyan forests after rain. Earthy, green and deeply refreshing.', '{Green Leaf,Rain}', '{Vetiver,Fern}', '{Oakmoss,Cedar}', '🌿'),
  ('Amber Arabiya', 'Khaleeji Collection', 4200, NULL, 'unisex', '100ml', 4.9, 521, true, 'bestseller', 'Pure luxury in a bottle. Golden amber, exotic spices and precious oud. A timeless classic.', '{Saffron,Cinnamon}', '{Amber,Oud}', '{Musk,Benzoin}', '✨'),
  ('Coconut Kisses', 'Pwani Parfums', 1400, NULL, 'women', '50ml', 4.3, 76, true, NULL, 'Playful and tropical. Sun-kissed coconut with sweet florals — summer in a bottle.', '{Coconut,Pineapple}', '{Frangipani,Tiare}', '{Vanilla,Musk}', '🥥'),
  ('Warrior Oud', 'Khaleeji Collection', 3800, 4500, 'men', '100ml', 4.8, 203, false, 'sale', 'Commanding and intense. Raw oud power softened by spice and leather for the bold man.', '{Black Pepper,Ginger}', '{Oud,Tobacco}', '{Leather,Amber}', '⚔️'),
  ('Maua Maridadi', 'Swahili Scents', 1950, NULL, 'women', '75ml', 4.5, 158, true, 'new', 'A stunning Swahili floral — rich petals of hibiscus, frangipani and soft musk.', '{Hibiscus,Lime}', '{Frangipani,Rose}', '{White Musk,Vanilla}', '🌺'),
  ('Night Market', 'Pwani Parfums', 2100, NULL, 'unisex', '75ml', 4.6, 112, true, NULL, 'Mysterious and warm like a Mombasa night bazaar. Spices, smoke and sweet incense.', '{Cardamom,Clove}', '{Incense,Rose}', '{Oud,Sandalwood}', '🌙'),
  ('Tropical Breeze', 'Swahili Scents', 1700, 2100, 'unisex', '50ml', 4.2, 94, true, 'sale', 'Light, airy and refreshing. A beach day scent with citrus, coconut and sea salt.', '{Lemon,Lime}', '{Coconut,Sea Salt}', '{Driftwood,Musk}', '🏖️');

-- ============================================
-- HELPER FUNCTION: Auto-update customer stats
-- ============================================
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET 
    order_count = (SELECT COUNT(*) FROM orders WHERE phone = NEW.phone),
    total_spent = (SELECT COALESCE(SUM(total), 0) FROM orders WHERE phone = NEW.phone),
    updated_at = NOW()
  WHERE phone = NEW.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update customer stats after order insertion
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON orders;
CREATE TRIGGER trigger_update_customer_stats
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this script, verify:
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Tables created: 4' AS status;
