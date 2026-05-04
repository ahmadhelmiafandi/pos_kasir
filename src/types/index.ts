export type ProductType = 'PARFUM' | 'NON-PARFUM';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  type: ProductType;
  image?: string;
}

export interface CartItem extends Product {
  ml?: number;
  quantity: number;
  subtotal: number;
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
