export interface CartItem {
  productId: number;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: 'men' | 'women' | 'unisex' | 'oud';
  size: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: 'bestseller' | 'new' | 'sale' | 'hot';
  description: string;
  notes: { top: string[]; middle: string[]; base: string[] };
  emoji: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerName: string;
  phone: string;
  location: string;
  deliveryZone: string;
  paymentMethod: 'mpesa' | 'cash';
  mpesaNumber?: string;
  total: number;
  deliveryFee: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export type Page = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'order-success' | 'viability' | 'admin' | 'auth' | 'profile' | 'admin-profile';
