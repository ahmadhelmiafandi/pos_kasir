import { create } from 'zustand';
import { CartItem, Product } from '../../types/index';

interface POSState {
  cart: CartItem[];
  addItem: (product: Product, amount: number) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  calculateTotal: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  
  addItem: (product, amount) => {
    set((state) => {
      // Check if item already exists in cart (same ID and same type logic)
      // For parfum, we might want to merge if it's the same product, or keep separate.
      // Usually in POS, if you add the same parfum twice with different ml, they might be separate or merged.
      // Let's implement merge logic as requested: "merge item jika sama"
      
      const existingItemIndex = state.cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1 && product.type === 'NON-PARFUM') {
        const newCart = [...state.cart];
        const existingItem = newCart[existingItemIndex];
        const newQty = existingItem.quantity + amount;
        
        newCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQty,
          subtotal: newQty * existingItem.price
        };
        return { cart: newCart };
      }

      // If it's parfum or doesn't exist, add as new (or merge parfum ml?)
      // User requested "merge item jika sama". For parfum, merging ml makes sense.
      if (existingItemIndex > -1 && product.type === 'PARFUM') {
        const newCart = [...state.cart];
        const existingItem = newCart[existingItemIndex];
        const newMl = (existingItem.ml || 0) + amount;
        
        newCart[existingItemIndex] = {
          ...existingItem,
          ml: newMl,
          subtotal: newMl * existingItem.price
        };
        return { cart: newCart };
      }
      
      const newItem: CartItem = {
        ...product,
        ml: product.type === 'PARFUM' ? amount : undefined,
        quantity: product.type === 'NON-PARFUM' ? amount : 1,
        subtotal: product.type === 'PARFUM' ? amount * product.price : amount * product.price
      };
      
      return { cart: [...state.cart, newItem] };
    });
  },

  removeItem: (index) => set((state) => ({
    cart: state.cart.filter((_, i) => i !== index)
  })),

  updateItem: (index, updates) => set((state) => {
    const newCart = [...state.cart];
    const item = { ...newCart[index], ...updates };
    
    // Recalculate subtotal
    if (item.type === 'PARFUM') {
      item.subtotal = (item.ml || 0) * item.price;
    } else {
      item.subtotal = item.quantity * item.price;
    }
    
    newCart[index] = item;
    return { cart: newCart };
  }),

  clearCart: () => set({ cart: [] }),

  calculateTotal: () => {
    return get().cart.reduce((total, item) => total + item.subtotal, 0);
  }
}));
