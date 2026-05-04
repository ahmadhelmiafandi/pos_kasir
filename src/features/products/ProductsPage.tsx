import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { productService } from '../../services/productService';
import { Product } from '../../types/index';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productService.getAll();
        setProducts(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 font-display">Kelola Produk</h2>
          <p className="text-slate-400 mt-1">Daftar inventori parfum dan aksesoris</p>
        </div>
        <button className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform active:scale-95">
          + Tambah Produk
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            placeholder="Cari nama produk..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 transition-all outline-hidden font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 transition-all outline-hidden font-medium text-slate-600">
          <option>Semua Kategori</option>
          <option>Parfum</option>
          <option>Aksesoris</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading products...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold italic">
                        {p.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{p.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.type === 'PARFUM' ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-600'}`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">Rp {p.price.toLocaleString()}{p.type === 'PARFUM' ? '/ml' : ''}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-brand-success' : 'bg-brand-danger'}`} />
                      <span className="font-semibold text-slate-600">{p.stock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded-lg transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
