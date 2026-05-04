import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('✅ Connection successful, but "products" table does not exist yet.');
        console.log('Next step: Create tables.');
      } else {
        console.error('❌ Connection error:', error.message);
      }
    } else {
      console.log('✅ Connection successful! Found', data.length, 'products.');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnection();
