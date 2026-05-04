export type ProductType = 'PARFUM' | 'NON-PARFUM';

export interface Product {
  id: string;
  name: string;
  price: number;
  cost_price: number;
  initial_stock: number; // Stok Awal
  stock: number; // Stok Saat Ini
  category: string;
  type: ProductType;
  image?: string;
}

export interface CartItem extends Product {
  cost_price: number;
  ml?: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  cash: number;
  change: number;
  date: string;
}

export interface User {
  email: string;
  name?: string;
  role: 'ADMIN' | 'KASIR';
}
