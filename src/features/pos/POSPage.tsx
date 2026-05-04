import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, CheckCircle, X, ChevronRight, Calculator, User, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePOSStore } from './store';
import { productService } from '../../services/productService';
import { transactionService } from '../../services/transactionService';
import { memberService } from '../../services/memberService';
import { toast } from 'sonner';
import { Product, CartItem } from '../../types/index';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Sub-component for Cart Content to prevent re-renders on every input
const CartContent = ({ 
  cart, 
  onRemove, 
  onUpdateQty, 
  total, 
  cashInput, 
  setCashInput, 
  onCheckout,
  selectedMember,
  onClearMember
}: any) => {
  const cash = parseFloat(cashInput || '0');
  const change = cash - total;
  const isShort = cash < total;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingCart size={24} className="text-brand-primary" />
          Keranjang Belanja
        </h3>
        <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
          {cart.length} Item
        </span>
      </div>

      {/* Member Info in Cart */}
      {selectedMember && (
        <div className="mb-4 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{selectedMember.name}</p>
              <p className="text-[10px] text-brand-primary font-bold">
                Transaksi Ke-{selectedMember.total_transactions + 1}
                {(selectedMember.total_transactions + 1) % 10 === 0 && " (GRATIS ISI ULANG!)"}
              </p>
            </div>
          </div>
          <button onClick={onClearMember} className="text-slate-400 hover:text-brand-danger">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
            <ShoppingCart size={64} strokeWidth={1.5} />
            <p className="mt-4 font-medium">Keranjang masih kosong</p>
          </div>
        ) : (
          cart.map((item: CartItem) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={item.id} 
              className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-700 truncate">{item.name}</p>
                <p className="text-xs text-slate-400 font-medium">Rp {item.price.toLocaleString()} / {item.type === 'PARFUM' ? 'ml' : 'pcs'}</p>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onUpdateQty(item.id, parseFloat(e.target.value))}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-700 outline-hidden focus:border-brand-primary transition-colors"
                />
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-slate-400 hover:text-brand-danger hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-100">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-medium">Subtotal</span>
            <span className="font-bold">Rp {total.toLocaleString()}</span>
          </div>
          {(selectedMember?.total_transactions + 1) % 10 === 0 && (
            <div className="flex justify-between items-center text-brand-success font-bold">
              <span>Promo Member (Free 1 Refill)</span>
              <span>Terdeteksi!</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-slate-800">Total Akhir</span>
            <span className="text-3xl font-black text-brand-primary font-display">Rp {total.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4 mt-4 pt-4 border-t border-slate-200">
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setCashInput(total.toString())}
                className="w-full py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
              >
                Uang Pas (Rp {total.toLocaleString()})
              </button>
           </div>

           <div className="relative">
              <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="number" 
                placeholder="Tunai..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 transition-all outline-hidden font-bold text-slate-700 text-lg"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
              />
           </div>

           {cash > 0 && (
             <div className={`p-4 rounded-2xl flex justify-between items-center ${isShort ? 'bg-red-50 text-brand-danger border border-red-100' : 'bg-emerald-50 text-brand-success border border-emerald-100'}`}>
                <span className="font-bold text-sm">{isShort ? 'Kurang Bayar' : 'Kembalian'}</span>
                <span className="text-xl font-black">Rp {Math.abs(change).toLocaleString()}</span>
             </div>
           )}

           <button 
            disabled={cart.length === 0 || isShort}
            onClick={onCheckout}
            className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${cart.length === 0 || isShort ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-brand-primary text-white shadow-brand-primary/30 hover:bg-sky-600'}`}
           >
            <CheckCircle size={24} />
            SELESAIKAN TRANSAKSI
           </button>
        </div>
      </div>
    </div>
  );
};

const POSPage = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, total } = usePOSStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isLoading, setIsLoading] = useState(true);
  const [cashInput, setCashInput] = useState('');
  
  // Member States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qtyInput, setQtyInput] = useState('1');
  const [mlInput, setMlInput] = useState('');

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

  // Handle QR Scanner
  useEffect(() => {
    let scanner: any = null;
    if (isScannerOpen) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render(async (decodedText: string) => {
        try {
          const member = await memberService.getById(decodedText);
          if (member) {
            setSelectedMember(member);
            toast.success(`Member: ${member.name} terdeteksi!`);
            setIsScannerOpen(false);
            scanner.clear();
          } else {
            toast.error("QR Code tidak valid");
          }
        } catch (e) {
          toast.error("Gagal membaca member");
        }
      }, (err: any) => {});
    }
    return () => { if (scanner) scanner.clear(); };
  }, [isScannerOpen]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQtyInput('1');
    setMlInput('');
  };

  const handleAddToCartModal = () => {
    if (!selectedProduct) return;
    
    const qty = selectedProduct.type === 'PARFUM' ? parseFloat(mlInput) : parseInt(qtyInput);
    if (!qty || qty <= 0) {
      toast.error('Jumlah tidak valid');
      return;
    }

    addToCart(selectedProduct, qty);
    setSelectedProduct(null);
    toast.success(`${selectedProduct.name} ditambahkan`);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const transactionData = {
        total_amount: total,
        payment_method: 'CASH',
        cash_amount: parseFloat(cashInput),
        change_amount: parseFloat(cashInput) - total,
        items: cart,
        member_id: selectedMember?.id || null
      };

      await transactionService.create(transactionData);
      
      // Update member transaction count if applicable
      if (selectedMember) {
        // Find total ml purchased in this cart
        const totalMl = cart.reduce((acc, item) => item.type === 'PARFUM' ? acc + item.quantity : acc, 0);
        await memberService.incrementTransaction(selectedMember.id, totalMl);
      }

      toast.success('Transaksi Berhasil!');
      clearCart();
      setCashInput('');
      setSelectedMember(null);
      fetchProducts(); // Refresh stocks
    } catch (err) {
      toast.error('Gagal memproses transaksi');
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6 overflow-hidden">
      {/* Left: Product List */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 font-display">Kasir Pintar</h2>
            <p className="text-slate-400 text-sm">Pilih produk untuk mulai transaksi</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="px-5 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 font-bold text-slate-600 hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm"
            >
              <QrCode size={20} />
              Scan Member
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              placeholder="Cari produk..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 transition-all outline-hidden font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-wrap">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap shadow-sm border ${selectedCategory === cat ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-500 border-slate-100 hover:border-brand-primary/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[3/4] bg-slate-100 rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 pb-6">
              {filtered.map(p => (
                <motion.button
                  layout
                  key={p.id}
                  onClick={() => handleProductSelect(p)}
                  className="bg-white p-4 lg:p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-primary/20 transition-all text-left flex flex-col group active:scale-95 relative overflow-hidden"
                >
                  {/* Stock Badge */}
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-2xl font-bold text-[10px] uppercase ${p.stock <= 10 ? 'bg-brand-danger text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {p.stock}
                  </div>

                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-primary font-bold text-lg lg:text-xl italic mb-3 lg:mb-4 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    {p.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm lg:text-base line-clamp-2 mb-1 pr-6">{p.name}</h4>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 lg:mb-3">{p.category}</p>
                  <p className="mt-auto font-display font-bold text-brand-primary text-base lg:text-lg">
                    Rp {p.price.toLocaleString()}
                    <span className="text-[10px] lg:text-xs text-slate-400 font-sans ml-1">{p.type === 'PARFUM' ? '/ml' : '/pcs'}</span>
                  </p>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Checkout Sidebar */}
      <div className="w-full lg:w-[400px] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <CartContent 
          cart={cart}
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          total={total}
          cashInput={cashInput}
          setCashInput={setCashInput}
          onCheckout={handleCheckout}
          selectedMember={selectedMember}
          onClearMember={() => setSelectedMember(null)}
        />
      </div>

      {/* Modal QR Scanner */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setIsScannerOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Scan QR Member</h3>
                <button onClick={() => setIsScannerOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              <div id="reader" className="w-full rounded-2xl overflow-hidden border border-slate-100" />
              <p className="mt-4 text-center text-sm text-slate-400 font-medium">Arahkan kamera ke QR Member pelanggan</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Add to Cart (Qty/Ml Selection) */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-primary font-bold text-2xl italic mx-auto mb-4">
                  {selectedProduct.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 font-display">{selectedProduct.name}</h3>
                <p className="text-slate-400 font-medium">Tentukan jumlah pembelian</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3 text-center">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Jumlah ({selectedProduct.type === 'PARFUM' ? 'ml' : 'pcs'})
                  </label>
                  <input 
                    autoFocus
                    type="number"
                    value={selectedProduct.type === 'PARFUM' ? mlInput : qtyInput}
                    onChange={(e) => selectedProduct.type === 'PARFUM' ? setMlInput(e.target.value) : setQtyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddToCartModal()}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="w-full px-6 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 transition-all outline-hidden text-center text-xl lg:text-2xl font-bold text-slate-800"
                    placeholder="0"
                  />
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedProduct.type === 'PARFUM' ? (
                      ['15', '30', '50'].map(v => (
                        <button key={v} onClick={() => setMlInput(v)} className="py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-brand-primary/10 hover:text-brand-primary transition-all border border-slate-100">
                          {v} ml
                        </button>
                      ))
                    ) : (
                      ['1', '2', '5'].map(v => (
                        <button key={v} onClick={() => setQtyInput(v)} className="py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-brand-primary/10 hover:text-brand-primary transition-all border border-slate-100">
                          {v} pcs
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleAddToCartModal}
                  className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/25 hover:bg-sky-600 transition-all text-lg active:scale-[0.98]"
                >
                  Masukkan Keranjang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POSPage;
