import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedProducts() {
  console.log('Seeding products via API...');
  
  const products = [
    { name: 'Scandalous', price: 2000, category: 'Female', type: 'PARFUM', stock: 1000 },
    { name: 'Dior Sauvage', price: 2000, category: 'Male', type: 'PARFUM', stock: 1000 },
    { name: 'Roman Wish', price: 2000, category: 'Female', type: 'PARFUM', stock: 1000 },
    { name: 'Black Opium', price: 2000, category: 'Female', type: 'PARFUM', stock: 1000 },
    { name: 'Bacarat Rouge 540', price: 2000, category: 'Unisex', type: 'PARFUM', stock: 1000 },
    { name: 'Victoria Secret Bombshell', price: 2000, category: 'Female', type: 'PARFUM', stock: 1000 },
    { name: 'Gucci Bloom', price: 2000, category: 'Female', type: 'PARFUM', stock: 1000 },
    { name: 'Creed Aventus', price: 2000, category: 'Male', type: 'PARFUM', stock: 1000 },
    { name: 'Jo Malone English Pear', price: 2000, category: 'Unisex', type: 'PARFUM', stock: 1000 },
    { name: 'YSL Libre', price: 2000, category: 'Female', type: 'PARFUM', stock: 1000 },
  ];

  for (const p of products) {
    const id = Math.random().toString(36).substr(2, 9);
    const { data, error } = await supabase
      .from('products')
      .insert({ id, ...p });

    if (error) {
      console.error(`❌ Error adding ${p.name}:`, error.message);
    } else {
      console.log(`✅ Added: ${p.name}`);
    }
  }
  
  console.log('🚀 Seeding complete!');
}

seedProducts();
