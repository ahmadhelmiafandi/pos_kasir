import { Product } from './types/index';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Oud Wood Special', price: 15000, type: 'PARFUM', stock: 1000, category: 'Woody' },
  { id: '2', name: 'Rose Petal Bliss', price: 12000, type: 'PARFUM', stock: 500, category: 'Floral' },
  { id: '3', name: 'Ocean Breeze', price: 10000, type: 'PARFUM', stock: 2000, category: 'Fresh' },
  { id: '4', name: 'Vanilla Sky', price: 18000, type: 'PARFUM', stock: 800, category: 'Sweet' },
  { id: '5', name: 'Empty Bottle 30ml', price: 5000, type: 'NON-PARFUM', stock: 50, category: 'Accessories' },
  { id: '6', name: 'Empty Bottle 50ml', price: 7500, type: 'NON-PARFUM', stock: 30, category: 'Accessories' },
  { id: '7', name: 'Gift Box Medium', price: 15000, type: 'NON-PARFUM', stock: 20, category: 'Packaging' },
  { id: '8', name: 'Atomizer Spray', price: 2500, type: 'NON-PARFUM', stock: 100, category: 'Accessories' },
];

export const COLORS = {
  primary: '#0ea5e9', // Sky 500
  success: '#10b981', // Emerald 500
  danger: '#ef4444',  // Red 500
  warning: '#f59e0b', // Amber 500
};
