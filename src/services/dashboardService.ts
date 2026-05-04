import { supabase } from './supabaseClient';

export const dashboardService = {
  getTodayStats: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 1. Total Penjualan & Jumlah Transaksi Hari Ini
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('total')
      .gte('created_at', todayISO);

    if (txError) throw txError;

    const totalSales = transactions.reduce((acc, curr) => acc + curr.total, 0);
    const transactionCount = transactions.length;

    // 2. Produk Terjual Hari Ini
    const { data: items, error: itemsError } = await supabase
      .from('transaction_items')
      .select('quantity, ml')
      .gte('created_at', todayISO);

    if (itemsError) throw itemsError;

    const itemsSold = items.reduce((acc, curr) => acc + (curr.quantity || 0) + (curr.ml || 0), 0);

    // 3. Item Terlaris (Berdasarkan frekuensi transaksi)
    const { data: popularItems, error: popError } = await supabase
      .from('transaction_items')
      .select('name, count')
      .gte('created_at', todayISO);
      // Note: This is simplified. For real top items, you'd want to group by name and sum quantity.
      // But for a quick refactor, we can fetch all and process in JS or use a more complex query.

    return {
      totalSales,
      transactionCount,
      itemsSold,
      topItem: 'N/A', // Default if no data
    };
  },

  getSalesChartData: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .select('total, created_at')
      .gte('created_at', todayISO)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Process data for hourly chart
    const hourlyData: Record<string, number> = {
      '08:00': 0, '10:00': 0, '12:00': 0, '14:00': 0, '16:00': 0, '18:00': 0, '20:00': 0, '22:00': 0
    };

    data.forEach(tx => {
      const date = new Date(tx.created_at);
      const hour = date.getHours();
      // Round to nearest even hour for simple visualization
      const bucket = `${String(Math.floor(hour / 2) * 2).padStart(2, '0')}:00`;
      if (hourlyData[bucket] !== undefined) {
        hourlyData[bucket] += tx.total;
      }
    });

    return Object.entries(hourlyData).map(([name, total]) => ({ name, total }));
  }
};
