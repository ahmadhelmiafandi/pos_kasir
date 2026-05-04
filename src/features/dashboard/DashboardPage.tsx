import React from 'react';
import { TrendingUp, DollarSign, Users, PackageCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '08:00', total: 400 },
  { name: '10:00', total: 1200 },
  { name: '12:00', total: 900 },
  { name: '14:00', total: 2400 },
  { name: '16:00', total: 1800 },
  { name: '18:00', total: 2800 },
  { name: '20:00', total: 2100 },
];

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
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 font-display">Dashboard</h2>
        <p className="text-slate-400 mt-1">Ringkasan aktivitas toko hari ini</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label="Total Penjualan" value="Rp 4.250.000" subValue="+12% dari kemarin" color="brand-primary" />
        <StatCard icon={Users} label="Transaksi" value="84" subValue="+5 dari jam lalu" color="slate-600" />
        <StatCard icon={PackageCheck} label="Produk Terjual" value="126" subValue="ml/items" color="brand-success" />
        <StatCard icon={TrendingUp} label="Item Terlaris" value="Oud Wood" subValue="24 Transaksi" color="slate-800" />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Grafik Penjualan Hari Ini</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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
              />
              <Area type="monotone" dataKey="total" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
