import { supabase } from './supabaseClient';
import { CartItem } from '../types/index';

export const transactionService = {
  saveTransaction: async (transactionData: {
    total: number;
    cash: number;
    change: number;
    items: CartItem[];
    member_id?: string | null;
  }) => {
    // 1. Insert into transactions table
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        total: transactionData.total,
        cash: transactionData.cash,
        change: transactionData.change,
        member_id: transactionData.member_id || null
      })
      .select()
      .single();

    if (txError) throw txError;

    // 2. Insert items into transaction_items table
    const itemsToInsert = transactionData.items.map((item) => ({
      transaction_id: transaction.id,
      product_id: item.id,
      name: item.name,
      price: item.price,
      cost_price: item.cost_price || 0,
      quantity: item.quantity,
      ml: item.ml || null,
      subtotal: item.subtotal,
      notes: item.notes || null,
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // 3. Update product stocks
    for (const item of transactionData.items) {
      if (item.type === 'NON-PARFUM') {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();
        
        if (product) {
          await supabase
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.id);
        }
      } else if (item.type === 'PARFUM') {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();
        
        if (product) {
          await supabase
            .from('products')
            .update({ stock: product.stock - (item.ml || 0) })
            .eq('id', item.id);
        }
      }
    }

    return transaction;
  },
};
