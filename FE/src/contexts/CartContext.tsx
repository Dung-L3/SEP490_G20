import React, { createContext, useContext, useState } from 'react';
import type { MenuItem } from '../pages/waiter/Order';

// Định nghĩa kiểu dữ liệu cho món ăn hoặc combo trong giỏ hàng
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  orderDetailId?: number;
  orderStatus?: 'pending' | 'cooking' | 'completed';
  isCombo?: boolean;
  comboItems?: Array<{
    dishId: number;
    dishName: string;
    quantity: number;
  }>;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (name: string, quantity: number) => void;
  removeFromCart: (name: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const found = prev.find(i => i.name === item.name);
      if (found) {
        return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (name: string, quantity: number) => {
    setCart(prev => prev.map(i => i.name === name ? { ...i, quantity: Math.max(1, quantity) } : i));
  };

  const removeFromCart = (name: string) => {
    setCart(prev => prev.filter(i => i.name !== name));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
