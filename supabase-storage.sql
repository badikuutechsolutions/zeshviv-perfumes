-- ============================================
-- ZeshViv Perfumes — Storage Bucket Setup
-- ============================================
-- Run this SQL in Supabase SQL Editor to enable
-- product image uploads.
-- ============================================

-- 1. Create the product-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB max
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow anyone to view product images (public bucket)
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- 3. Allow authenticated users (admins) to upload/update/delete
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- ============================================
-- After running this SQL:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Verify "product-images" bucket exists
-- 3. Make sure it's set to "Public"
-- ============================================
