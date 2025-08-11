import React, { createContext, useContext, useState } from 'react';
import type { CartItem } from './CartContext';

interface TableCartContextType {
  tableCarts: Record<string, CartItem[]>;
  setTable: (table: string) => void;
  currentTable: string;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (name: string, quantity: number) => void;
  removeFromCart: (name: string) => void;
  clearCart: () => void;
}

const TableCartContext = createContext<TableCartContextType | undefined>(undefined);

export const useTableCart = () => {
  const context = useContext(TableCartContext);
  if (!context) throw new Error('useTableCart must be used within a TableCartProvider');
  return context;
};

export const TableCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tableCarts, setTableCarts] = useState<Record<string, CartItem[]>>({});
  const [currentTable, setCurrentTable] = useState<string>('');

  const setTable = (table: string) => setCurrentTable(table);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setTableCarts(prev => {
      const cart = prev[currentTable] || [];
      // Kiểm tra xem món đã được gửi và đang pending không
      const found = cart.find(i => i.name === item.name && (!i.orderDetailId || i.orderStatus === 'pending'));
      let newCart;
      if (found) {
        newCart = cart.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
      } else if (!item.orderDetailId || item.orderStatus === 'pending') {
        // Chỉ thêm món mới nếu chưa gửi hoặc đang pending
        newCart = [...cart, { ...item, quantity: 1 }];
      } else {
        return prev; // Không thêm món đã gửi và không phải pending
      }
      return { ...prev, [currentTable]: newCart };
    });
  };

  const updateQuantity = (name: string, quantity: number) => {
    setTableCarts(prev => {
      const cart = prev[currentTable] || [];
      return { ...prev, [currentTable]: cart.map(i => i.name === name ? { ...i, quantity: Math.max(1, quantity) } : i) };
    });
  };

  const removeFromCart = (name: string) => {
    setTableCarts(prev => {
      const cart = prev[currentTable] || [];
      return { ...prev, [currentTable]: cart.filter(i => i.name !== name) };
    });
  };

  const clearCart = () => {
    setTableCarts(prev => ({ ...prev, [currentTable]: [] }));
  };

  return (
    <TableCartContext.Provider value={{ tableCarts, setTable, currentTable, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </TableCartContext.Provider>
  );
};
