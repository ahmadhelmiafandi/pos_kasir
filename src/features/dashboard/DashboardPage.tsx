import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, PackageCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import { toast } from 'sonner';

const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white hover:scale-110 transition-transform`} style={{ backgroundColor: `var(--color-${color})` }}>
      <Icon size={24} />
    </div>
    <p className="text-slate-400 text-sm font-medium">{label}</p>
    <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
    <p className="text-brand-success text-xs font-semibold mt-2">{subValue}</p>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    transactionCount: 0,
    itemsSold: 0,
    topItem: 'N/A'
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, chartRes] = await Promise.all([
          dashboardService.getTodayStats(),
          dashboardService.getSalesChartData()
        ]);
        setStats(statsData);
        setChartData(chartRes);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        toast.error('Gagal mengambil data dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 font-display">Dashboard</h2>
        <p className="text-slate-400 mt-1">Ringkasan aktivitas toko hari ini</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={DollarSign} 
          label="Total Penjualan" 
          value={`Rp ${stats.totalSales.toLocaleString()}`} 
          subValue="Hari ini" 
          color="brand-primary" 
        />
        <StatCard 
          icon={Users} 
          label="Transaksi" 
          value={stats.transactionCount.toString()} 
          subValue="Transaksi hari ini" 
          color="slate-600" 
        />
        <StatCard 
          icon={PackageCheck} 
          label="Produk Terjual" 
          value={stats.itemsSold.toString()} 
          subValue="ml/items terjual" 
          color="brand-success" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Item Terlaris" 
          value={stats.topItem} 
          subValue="Produk paling dicari" 
          color="slate-800" 
        />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Grafik Penjualan Hari Ini</h3>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400">Loading chart data...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Total']}
                />
                <Area type="monotone" dataKey="total" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
