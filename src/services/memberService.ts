import { supabase } from './supabaseClient';

export const memberService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getByPhone: async (phone: string) => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('phone', phone)
      .single();
    if (error) return null;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  create: async (memberData: any) => {
    const { data, error } = await supabase
      .from('members')
      .insert(memberData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, memberData: any) => {
    const { data, error } = await supabase
      .from('members')
      .update(memberData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Logika update saat transaksi sukses
  incrementTransaction: async (id: string, mlAmount: number) => {
    const { data: member } = await supabase
      .from('members')
      .select('total_transactions')
      .eq('id', id)
      .single();

    if (!member) return;

    const { error } = await supabase
      .from('members')
      .update({
        total_transactions: (member.total_transactions || 0) + 1,
        last_ml_purchased: mlAmount || 0
      })
      .eq('id', id);

    if (error) throw error;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getHistory: async (memberId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        created_at,
        total,
        transaction_items (
          name,
          quantity,
          price
        )
      `)
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
