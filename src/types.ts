export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number | string; // mysql returns decimals as strings sometimes
  stock: number;
  category: string;
  image_url: string;
  created_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number | string;
  product_name?: string;
  product_image?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total: number | string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  created_at: string;
  items?: OrderItem[];
  user_name?: string;
  user_email?: string;
}
