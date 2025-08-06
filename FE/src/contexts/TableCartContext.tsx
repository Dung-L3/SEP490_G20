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

// Dữ liệu mẫu cho đơn bếp demo
const demoTableCarts: Record<string, CartItem[]> = {
  'Bàn 1': [
    { name: 'Cơm Tấm Sườn Nướng', price: 65000, image: '', quantity: 2 },
    { name: 'Phở Bò', price: 50000, image: '', quantity: 1 },
  ],
  'Bàn 2': [
    { name: 'Bún Chả Hà Nội', price: 55000, image: '', quantity: 2 },
    { name: 'Bánh Cuốn', price: 40000, image: '', quantity: 1 },
  ],
  'Bàn 3': [
    { name: 'Bánh Xèo Miền Tây', price: 45000, image: '', quantity: 3 },
  ],
  'Bàn 4': [
    { name: 'Chả Cá Lã Vọng', price: 120000, image: '', quantity: 1 },
    { name: 'Bún Bò Huế', price: 60000, image: '', quantity: 2 },
  ],
  'Bàn 5': [
    { name: 'Lẩu Cá Kèo', price: 180000, image: '', quantity: 1 },
    { name: 'Gỏi Cuốn Tôm Thịt', price: 35000, image: '', quantity: 4 },
  ],
  'Bàn 6': [
    { name: 'Bánh Mì Thịt', price: 25000, image: '', quantity: 5 },
    { name: 'Bún Riêu', price: 45000, image: '', quantity: 2 },
  ],
};

export const TableCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tableCarts, setTableCarts] = useState<Record<string, CartItem[]>>(demoTableCarts);
  const [currentTable, setCurrentTable] = useState<string>('A1');

  const setTable = (table: string) => setCurrentTable(table);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setTableCarts(prev => {
      const cart = prev[currentTable] || [];
      const found = cart.find(i => i.name === item.name);
      let newCart;
      if (found) {
        newCart = cart.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newCart = [...cart, { ...item, quantity: 1 }];
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
