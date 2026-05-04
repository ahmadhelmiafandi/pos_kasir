import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your .env file.');
} else {
  console.log('Supabase Client Initialized with URL:', supabaseUrl);
  // Log only first 5 chars of key for safety
  console.log('API Key Status:', supabaseAnonKey.substring(0, 5) + '...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

