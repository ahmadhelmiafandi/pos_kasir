import { usePOSStore } from '../store';
import { Product } from '../../../types/index';
import { toast } from 'sonner';

export const useCart = () => {
  const { cart, addItem, removeItem, updateItem, clearCart, calculateTotal } = usePOSStore();

  const handleAddToCart = (product: Product, amount: number) => {
    // Edge case validation
    if (amount <= 0) {
      toast.error('Jumlah harus lebih dari 0');
      return;
    }

    if (product.stock < amount && product.type === 'NON-PARFUM') {
      toast.error('Stok tidak mencukupi');
      return;
    }

    addItem(product, amount);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  return {
    cart,
    addToCart: handleAddToCart,
    removeFromCart: removeItem,
    updateCartItem: updateItem,
    clearCart,
    total: calculateTotal(),
  };
};
