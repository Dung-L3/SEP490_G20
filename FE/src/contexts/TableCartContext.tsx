import React, { createContext, useState } from 'react';
import type { CartItem } from './CartContext';

// Types
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

// Hook for using the cart context
export const useTableCart = () => {
  const context = React.useContext(TableCartContext);
  if (context === undefined) {
    throw new Error('useTableCart must be used within a TableCartProvider');
  }
  return context;
};

export { TableCartContext };
export type { TableCartContextType };

export const TableCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tableCarts, setTableCarts] = useState<Record<string, CartItem[]>>({});
  const [currentTable, setCurrentTable] = useState<string>('');

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
