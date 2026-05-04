import { supabase } from './supabaseClient';

export const dashboardService = {
  getStats: async (range: 'day' | 'week' | 'month' | 'year') => {
    const startDate = new Date();
    if (range === 'day') startDate.setHours(0, 0, 0, 0);
    else if (range === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (range === 'month') startDate.setMonth(startDate.getMonth() - 1);
    else if (range === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

    const startISO = startDate.toISOString();

    // 1. Total Penjualan & Jumlah Transaksi
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('total')
      .gte('created_at', startISO);

    if (txError) throw txError;

    const totalSales = transactions.reduce((acc, curr) => acc + curr.total, 0);
    const transactionCount = transactions.length;

    // 2. Produk Terjual
    const { data: items, error: itemsError } = await supabase
      .from('transaction_items')
      .select('quantity, ml')
      .gte('created_at', startISO);

    if (itemsError) throw itemsError;

    const itemsSold = items.reduce((acc, curr) => acc + (curr.quantity || 0) + (curr.ml || 0), 0);

    return {
      totalSales,
      transactionCount,
      itemsSold,
      topItem: 'Agmal Mix', // Placeholder
    };
  },

  getChartData: async (range: 'day' | 'week' | 'month' | 'year') => {
    const startDate = new Date();
    if (range === 'day') startDate.setHours(0, 0, 0, 0);
    else if (range === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (range === 'month') startDate.setMonth(startDate.getMonth() - 1);
    else if (range === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

    const { data, error } = await supabase
      .from('transactions')
      .select('total, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (range === 'day') {
      // 24 Hour Format
      const hours: Record<string, number> = {};
      for (let i = 0; i < 24; i++) hours[`${String(i).padStart(2, '0')}:00`] = 0;
      
      data.forEach(tx => {
        const hour = new Date(tx.created_at).getHours();
        hours[`${String(hour).padStart(2, '0')}:00`] += tx.total;
      });
      return Object.entries(hours).map(([name, total]) => ({ name, total }));
    }

    if (range === 'week') {
      const days: Record<string, number> = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
      data.forEach(tx => {
        const day = new Date(tx.created_at).toLocaleDateString('en-US', { weekday: 'short' });
        if (days[day] !== undefined) days[day] += tx.total;
      });
      return Object.entries(days).map(([name, total]) => ({ name, total }));
    }

    if (range === 'month') {
      // Simple day of month view
      const days: Record<string, number> = {};
      data.forEach(tx => {
        const date = new Date(tx.created_at).getDate();
        days[date] = (days[date] || 0) + tx.total;
      });
      return Object.entries(days).map(([name, total]) => ({ name: `Tgl ${name}`, total }));
    }

    if (range === 'year') {
      const months: Record<string, number> = {
        'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
        'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
      };
      data.forEach(tx => {
        const month = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short' });
        if (months[month] !== undefined) months[month] += tx.total;
      });
      return Object.entries(months).map(([name, total]) => ({ name, total }));
    }

    return [];
  }
};
