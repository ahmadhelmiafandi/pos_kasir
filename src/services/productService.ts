import { supabase } from './supabaseClient';
import { Product } from '../types/index';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      // Fallback to empty array or throw error
      throw error;
    }

    return data || [];
  },
  
  updateStock: async (productId: string, newStock: number) => {
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
    
    return true;
  }
};
