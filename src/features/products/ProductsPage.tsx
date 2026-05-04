import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Edit2, Trash2, X, Plus, TrendingUp, PackagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { productService } from '../../services/productService';
import { Product } from '../../types/index';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: 0,
    cost_price: 0,
    initial_stock: 0,
    stock: 0,
    category: '',
    type: 'PARFUM' as 'PARFUM' | 'NON-PARFUM'
  });

  // Calculator states
  const [calcMl, setCalcMl] = useState('');
  const [calcPrice, setCalcPrice] = useState('');
  
  // Restock state
  const [restockAmount, setRestockAmount] = useState('');

  // Get unique categories from products
  const categories = ['Semua Kategori', ...new Set(products.map(p => p.category).filter(Boolean))];

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      toast.error('Gagal mengambil data produk');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        id: product.id,
        name: product.name,
        price: product.price,
        cost_price: product.cost_price || 0,
        initial_stock: product.initial_stock || product.stock,
        stock: product.stock,
        category: product.category,
        type: product.type
      });
    } else {
      setEditingProduct(null);
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        price: 0,
        cost_price: 0,
        initial_stock: 0,
        stock: 0,
        category: '',
        type: 'PARFUM'
      });
    }
    setCalcMl('');
    setCalcPrice('');
    setIsModalOpen(true);
  };

  const handleOpenRestock = (product: Product) => {
    setEditingProduct(product);
    setRestockAmount('');
    setIsRestockOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
        toast.success('Produk berhasil diperbarui');
      } else {
        // When creating, set initial_stock same as current stock
        const newProduct = { ...formData, initial_stock: formData.stock };
        await productService.create(newProduct);
        toast.success('Produk berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Gagal menyimpan produk');
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !restockAmount) return;
    
    try {
      const additional = parseFloat(restockAmount);
      await productService.updateStock(editingProduct.id, editingProduct.stock + additional);
      toast.success(`Stok ${editingProduct.name} berhasil ditambah`);
      setIsRestockOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Gagal menambah stok');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await productService.delete(id);
        toast.success('Produk berhasil dihapus');
        fetchProducts();
      } catch (err) {
        toast.error('Gagal menghapus produk');
      }
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua Kategori' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 font-display">Kelola Produk</h2>
          <p className="text-slate-400 mt-1">Daftar inventori parfum dan aksesoris</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          Tambah Produk
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
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 transition-all outline-hidden font-medium text-slate-600"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading products...</div>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Harga Jual</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Harga Modal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Stok Awal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Stok Saat Ini</th>
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
                      <div>
                        <p className="font-semibold text-slate-700">{p.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.type === 'PARFUM' ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-600'}`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 text-right">Rp {p.price.toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-400 text-right text-sm italic">Rp {p.cost_price?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-400">{p.initial_stock || p.stock}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-brand-success' : 'bg-brand-danger'}`} />
                        <span className="font-bold text-slate-800 text-lg">{p.stock}</span>
                      </div>
                      {p.stock <= 10 && <span className="text-[9px] font-bold text-brand-danger uppercase">Stok Menipis!</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleOpenRestock(p)}
                        className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all title='Tambah Stok'"
                      >
                        <PackagePlus size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-400 hover:text-brand-danger hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 font-display">
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nama Produk</label>
                    <input 
                      required value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                      placeholder="Contoh: Oud Wood Special"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tipe Produk</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as 'PARFUM' | 'NON-PARFUM'})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                    >
                      <option value="PARFUM">Parfum (ml)</option>
                      <option value="NON-PARFUM">Non-Parfum (pcs)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 ml-1">Kategori</label>
                    <input 
                      required value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                      placeholder="Woody, Floral, dll"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 ml-1">Harga Jual (Rp)</label>
                    <input 
                      type="number" required value={formData.price}
                      onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 ml-1">Harga Modal (Rp)</label>
                    <input 
                      type="number" required value={formData.cost_price}
                      onChange={e => setFormData({...formData, cost_price: parseInt(e.target.value)})}
                      className="w-full px-5 py-3 bg-slate-50 border border-brand-primary/20 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all font-bold"
                    />
                  </div>

                  {formData.type === 'PARFUM' && (
                    <div className="col-span-2 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 space-y-3">
                      <p className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp size={14} /> Kalkulator Modal (Bantu Hitung Per Ml)
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Beli Berapa Ml?</label>
                          <input 
                            type="number" placeholder="Contoh: 1000" value={calcMl}
                            className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-sm outline-hidden"
                            onChange={(e) => {
                              const ml = e.target.value; setCalcMl(ml);
                              if (ml && calcPrice) setFormData({ ...formData, cost_price: Math.round(parseFloat(calcPrice) / parseFloat(ml)) });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Total Harga Beli (Rp)</label>
                          <input 
                            type="number" placeholder="Contoh: 679000" value={calcPrice}
                            className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-sm outline-hidden"
                            onChange={(e) => {
                              const price = e.target.value; setCalcPrice(price);
                              if (calcMl && price) setFormData({ ...formData, cost_price: Math.round(parseFloat(price) / parseFloat(calcMl)) });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-bold text-slate-700 ml-1">Stok Awal</label>
                    <input 
                      type="number" required value={formData.stock}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/25 hover:bg-sky-600 transition-all text-lg active:scale-[0.98]">
                    {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Restock */}
      <AnimatePresence>
        {isRestockOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsRestockOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 font-display">Tambah Stok</h3>
                <button onClick={() => setIsRestockOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-slate-500 text-sm">Produk:</p>
                <p className="text-xl font-bold text-slate-800">{editingProduct.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Stok Saat Ini:</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-lg font-bold text-slate-600">{editingProduct.stock}</span>
                </div>
              </div>

              <form onSubmit={handleRestock} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Jumlah Tambahan ({editingProduct.type === 'PARFUM' ? 'ml' : 'pcs'})</label>
                  <input 
                    autoFocus type="number" required value={restockAmount}
                    onChange={e => setRestockAmount(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-brand-primary/20 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all text-center text-3xl font-bold text-brand-primary"
                    placeholder="0"
                  />
                </div>

                <button type="submit" className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/25 hover:bg-sky-600 transition-all text-lg active:scale-[0.98]">
                  Konfirmasi Tambah
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsPage;
