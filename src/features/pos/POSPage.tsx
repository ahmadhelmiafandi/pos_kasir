import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ShoppingCart, X, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useCart } from './hooks/useCart';
import { productService } from '../../services/productService';
import { Product } from '../../types/index';
import { calculateChange, validatePayment } from './utils';
import { transactionService } from '../../services/transactionService';

// Separate CartContent component to avoid focus loss on re-render
const CartContent = ({ 
  cart, 
  total, 
  removeFromCart, 
  cashInput, 
  setCashInput, 
  handlePayment, 
  isProcessing, 
  showMobileCart, 
  setShowMobileCart 
}: any) => {
  const changeDisplay = useMemo(() => {
    const cash = parseInt(cashInput || '0');
    return Math.abs(cash - total);
  }, [cashInput, total]);

  const isShortage = useMemo(() => {
    return parseInt(cashInput || '0') < total;
  }, [cashInput, total]);

  return (
    <div className="flex flex-col h-full bg-white lg:rounded-3xl lg:border lg:border-slate-100 lg:shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showMobileCart && (
            <button onClick={() => setShowMobileCart(false)} className="lg:hidden p-2 -ml-2 text-slate-400">
              <ArrowLeft size={20} />
            </button>
          )}
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-display">
            <ShoppingCart size={22} className="text-brand-primary" />
            Order List
          </h3>
        </div>
        <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">{cart.length} ITEMS</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4 opacity-50">
            <ShoppingCart size={64} strokeWidth={1} />
            <p className="font-bold">Belum ada item</p>
          </div>
        ) : (
          cart.map((item: any, idx: number) => (
            <div key={`${item.id}-${idx}`} className="flex justify-between items-start group">
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">{item.name}</h4>
                <p className="text-xs text-slate-400 font-medium">
                  {item.type === 'PARFUM' ? `${item.ml} ml` : `${item.quantity} pcs`} × Rp {item.price.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-slate-700">Rp {item.subtotal.toLocaleString()}</span>
                <button onClick={() => removeFromCart(idx)} className="text-brand-danger lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
        <div className="flex justify-between items-center text-slate-500 font-medium">
          <span>Subtotal</span>
          <span>Rp {total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-slate-800 font-display">TOTAL</span>
          <span className="text-2xl font-bold text-brand-primary font-display tracking-tight">Rp {total.toLocaleString()}</span>
        </div>

        <div className="space-y-4 mt-4 pt-4 border-t border-slate-200">
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[10000, 20000, 50000, 100000].map(amount => (
                <button 
                  key={amount}
                  onClick={() => setCashInput((prev: string) => (parseInt(prev || '0') + amount).toString())}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-brand-primary hover:text-brand-primary whitespace-nowrap transition-all"
                >
                  +{amount.toLocaleString()}
                </button>
              ))}
              <button 
                onClick={() => setCashInput(total.toString())}
                className="px-3 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-xs font-bold text-brand-primary whitespace-nowrap"
              >
                Uang Pas
              </button>
           </div>

           <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
              <input 
                type="number" 
                placeholder="Tunai..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 transition-all outline-hidden font-bold text-slate-700 text-lg"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
              />
           </div>

           <div className="flex justify-between items-center px-2">
              <span className="text-sm font-semibold text-slate-400">
                {isShortage ? 'Kurang:' : 'Kembalian:'}
              </span>
              <span className={`font-bold ${isShortage ? 'text-brand-danger' : 'text-brand-success'}`}>
                Rp {changeDisplay.toLocaleString()}
              </span>
           </div>
        </div>

        <button 
          disabled={cart.length === 0 || isProcessing}
          onClick={handlePayment}
          className="w-full py-5 bg-brand-success text-white font-bold rounded-2xl shadow-xl shadow-brand-success/25 hover:bg-emerald-600 disabled:opacity-50 disabled:grayscale transition-all text-xl mt-4 active:scale-95"
        >
          {isProcessing ? 'MEMPROSES...' : 'BAYAR SEKARANG'}
        </button>
      </div>
    </div>
  );
};

const POSPage = () => {
  const { cart, addToCart, removeFromCart, clearCart, total } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mlInput, setMlInput] = useState('');
  const [qtyInput, setQtyInput] = useState('1');
  const [cashInput, setCashInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAll();
        setProducts(data);
      } catch (error) {
        toast.error('Gagal mengambil data produk');
      }
    };
    fetchProducts();
    if (window.innerWidth > 1024) {
      searchRef.current?.focus();
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const handleProductSelect = (product: Product) => {
    if (product.type === 'NON-PARFUM') {
      addToCart(product, 1);
    } else {
      setSelectedProduct(product);
      setMlInput('');
    }
  };

  const handleAddToCartModal = () => {
    if (!selectedProduct) return;
    
    const amount = selectedProduct.type === 'PARFUM' ? parseFloat(mlInput) : parseInt(qtyInput);
    addToCart(selectedProduct, amount);
    
    setSelectedProduct(null);
    setSearchTerm('');
    if (window.innerWidth > 1024) {
      searchRef.current?.focus();
    }
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }

    const cash = parseInt(cashInput);
    if (!cashInput || !validatePayment(cash, total)) {
      toast.error('Uang tunai tidak mencukupi');
      return;
    }

    setIsProcessing(true);
    try {
      await transactionService.saveTransaction({
        total,
        cash,
        change: cash - total,
        items: cart,
      });
      
      toast.success('Transaksi Berhasil!');
      clearCart();
      setCashInput('');
      setShowMobileCart(false);
      
      const updatedProducts = await productService.getAll();
      setProducts(updatedProducts);
      
      if (window.innerWidth > 1024) {
        searchRef.current?.focus();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Gagal memproses transaksi');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 lg:gap-8 lg:h-[calc(100vh-100px)]">
      {/* Product Area */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input 
            ref={searchRef}
            placeholder="Cari produk..." 
            className="w-full pl-16 pr-6 py-5 lg:py-6 bg-white border-2 border-transparent focus:border-brand-primary outline-hidden rounded-3xl text-lg lg:text-xl font-medium shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredProducts.length > 0) {
                handleProductSelect(filteredProducts[0]);
              }
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 pb-24 lg:pb-8">
            {filteredProducts.map(p => (
              <motion.button
                layout
                key={p.id}
                onClick={() => handleProductSelect(p)}
                className="bg-white p-4 lg:p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-primary/20 transition-all text-left flex flex-col group active:scale-95"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-primary font-bold text-lg lg:text-xl italic mb-3 lg:mb-4 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  {p.name.charAt(0)}
                </div>
                <h4 className="font-bold text-slate-800 text-sm lg:text-base line-clamp-2 mb-1">{p.name}</h4>
                <div className="flex justify-between items-center mb-2 lg:mb-3">
                  <p className="text-slate-400 text-[10px] lg:text-xs font-semibold uppercase tracking-wider">{p.category}</p>
                  <span className={`text-[10px] font-bold ${p.stock <= 10 ? 'text-brand-danger' : 'text-slate-400'}`}>
                    Stok: {p.stock}
                  </span>
                </div>
                <p className="mt-auto font-display font-bold text-brand-primary text-base lg:text-lg">
                  Rp {p.price.toLocaleString()}
                  <span className="text-[10px] lg:text-xs text-slate-400 font-sans ml-1">{p.type === 'PARFUM' ? '/ml' : '/pcs'}</span>
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Cart */}
      <div className="hidden lg:flex lg:col-span-4 h-full overflow-hidden">
        <CartContent 
          cart={cart}
          total={total}
          removeFromCart={removeFromCart}
          cashInput={cashInput}
          setCashInput={setCashInput}
          handlePayment={handlePayment}
          isProcessing={isProcessing}
        />
      </div>

      {/* Mobile Cart Floating Button */}
      {cart.length > 0 && !showMobileCart && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed bottom-6 left-6 right-6 z-30"
        >
          <button 
            onClick={() => setShowMobileCart(true)}
            className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-2xl flex items-center justify-between px-6 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} />
              <span>{cart.length} Item</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display">Rp {total.toLocaleString()}</span>
              <ChevronRight size={20} />
            </div>
          </button>
        </motion.div>
      )}

      {/* Mobile Cart Fullscreen */}
      <AnimatePresence>
        {showMobileCart && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 bg-white z-[60]"
          >
            <CartContent 
              cart={cart}
              total={total}
              removeFromCart={removeFromCart}
              cashInput={cashInput}
              setCashInput={setCashInput}
              handlePayment={handlePayment}
              isProcessing={isProcessing}
              showMobileCart={showMobileCart}
              setShowMobileCart={setShowMobileCart}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Product Details */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 lg:p-8"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-brand-primary/10 text-brand-primary rounded-3xl flex items-center justify-center text-2xl lg:text-3xl font-bold mb-4 italic">
                  {selectedProduct.name.charAt(0)}
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-slate-800 font-display">{selectedProduct.name}</h3>
                <p className="text-slate-400 uppercase text-[10px] lg:text-xs font-bold tracking-widest mt-1">{selectedProduct.category}</p>
                <div className="bg-slate-50 px-4 py-2 rounded-full mt-4 flex items-center gap-2">
                  <span className="text-slate-500 font-medium text-xs lg:text-sm">Harga:</span>
                  <span className="text-brand-primary font-bold text-sm lg:text-base">Rp {selectedProduct.price.toLocaleString()}{selectedProduct.type === 'PARFUM' ? '/ml' : '/pcs'}</span>
                </div>
              </div>

              <div className="mt-6 lg:mt-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    {selectedProduct.type === 'PARFUM' ? 'Jumlah (ml)' : 'Kuantitas'}
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
                  {selectedProduct.type === 'PARFUM' && mlInput && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                      <p className="text-slate-400 text-[10px] lg:text-sm">Total Harga Item:</p>
                      <p className="text-xl lg:text-2xl font-bold text-slate-800">Rp {(parseFloat(mlInput) * selectedProduct.price).toLocaleString()}</p>
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={handleAddToCartModal}
                  className="w-full py-4 lg:py-5 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/25 hover:bg-sky-600 transition-all text-lg lg:text-xl"
                >
                  Tambah
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
