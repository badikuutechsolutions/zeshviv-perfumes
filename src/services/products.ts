import { supabase } from '../lib/supabase';
import { Product } from '../types';

// Map Supabase DB product to app Product type
function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    category: row.category,
    size: row.size,
    rating: Number(row.rating),
    reviews: row.reviews_count,
    inStock: row.in_stock,
    badge: row.badge ?? undefined,
    description: row.description,
    notes: {
      top: row.notes_top || [],
      middle: row.notes_middle || [],
      base: row.notes_base || [],
    },
    emoji: row.emoji,
    imageUrl: row.image_url ?? undefined,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return (data || []).map(mapProduct);
}

export async function fetchProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data ? mapProduct(data) : null;
}

export async function fetchRelatedProducts(productId: number, category: string, brand: string, limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .neq('id', productId)
    .or(`category.eq.${category},brand.eq.${brand}`)
    .limit(limit);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return (data || []).map(mapProduct);
}
