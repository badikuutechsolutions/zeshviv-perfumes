export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          name: string;
          brand: string;
          price: number;
          original_price: number | null;
          category: 'men' | 'women' | 'unisex' | 'oud';
          size: string;
          rating: number;
          reviews_count: number;
          in_stock: boolean;
          badge: 'bestseller' | 'new' | 'sale' | 'hot' | null;
          description: string;
          notes_top: string[];
          notes_middle: string[];
          notes_base: string[];
          emoji: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          phone: string;
          location: string;
          delivery_zone: string;
          payment_method: 'mpesa' | 'cash';
          mpesa_number: string | null;
          subtotal: number;
          delivery_fee: number;
          total: number;
          status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
          user_id: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: number;
          order_id: string;
          product_id: number;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      customers: {
        Row: {
          id: number;
          name: string;
          phone: string;
          location: string;
          email: string | null;
          order_count: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at' | 'order_count' | 'total_spent'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
    };
  };
}
