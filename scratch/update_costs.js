import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateCostPrices() {
  console.log('Updating cost prices for parfumes...');
  
  // Ambil semua produk tipe PARFUM
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name')
    .eq('type', 'PARFUM');

  if (fetchError) {
    console.error('❌ Error fetching products:', fetchError.message);
    return;
  }

  for (const p of products) {
    // Generate random cost price between 500 and 700 per ml
    const randomCost = Math.floor(Math.random() * (700 - 500 + 1)) + 500;
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        cost_price: randomCost,
        initial_stock: 1000 // Sekalian set stok awal jika kosong
      })
      .eq('id', p.id);

    if (updateError) {
      console.error(`❌ Error updating ${p.name}:`, updateError.message);
    } else {
      console.log(`✅ Updated ${p.name}: Cost Rp ${randomCost}/ml`);
    }
  }
  
  console.log('🚀 Cost price update complete!');
}

updateCostPrices();
