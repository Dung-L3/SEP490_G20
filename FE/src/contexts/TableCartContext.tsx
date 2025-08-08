import React, { createContext, useContext, useState, useEffect } from 'react';
import type { StandardCartItem } from '../types/StandardTypes';

interface TableCartContextType {
  tableCarts: Record<string, StandardCartItem[]>;
  setTable: (table: string) => void;
  currentTable: string;
  addToCart: (item: Omit<StandardCartItem, 'quantity'>) => void;
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

// Dữ liệu mẫu cho đơn bếp demo - FINAL: Tương thích với StandardCartItem
const demoTableCarts: Record<string, StandardCartItem[]> = {
  '1': [
    { 
      id: 1, 
      name: 'Cơm Tấm Sườn Nướng', 
      price: 65000, 
      image: '/placeholder-dish.jpg', 
      quantity: 2,
      status: true,
      notes: '',
      orderStatus: 'pending'
    },
    { 
      id: 2, 
      name: 'Phở Bò', 
      price: 50000, 
      image: '/placeholder-dish.jpg', 
      quantity: 1,
      status: true,
      notes: '',
      orderStatus: 'pending'
    },
  ],
  '2': [
    { 
      id: 3, 
      name: 'Bún Chả Hà Nội', 
      price: 55000, 
      image: '/placeholder-dish.jpg', 
      quantity: 2,
      status: true,
      notes: ''
    },
    { 
      id: 4, 
      name: 'Bánh Cuốn', 
      price: 40000, 
      image: '/placeholder-dish.jpg', 
      quantity: 1,
      status: true,
      notes: ''
    },
  ],
  '3': [
    { 
      id: 5, 
      name: 'Bánh Xèo Miền Tây', 
      price: 45000, 
      image: '/placeholder-dish.jpg', 
      quantity: 3,
      status: true,
      notes: ''
    },
  ],
  '4': [
    { 
      id: 6, 
      name: 'Chả Cá Lã Vọng', 
      price: 120000, 
      image: '/placeholder-dish.jpg', 
      quantity: 1,
      status: true,
      notes: ''
    },
    { 
      id: 7, 
      name: 'Bún Bò Huế', 
      price: 60000, 
      image: '/placeholder-dish.jpg', 
      quantity: 2,
      status: true,
      notes: ''
    },
  ],
  '5': [
    { 
      id: 8, 
      name: 'Lẩu Cá Kèo', 
      price: 180000, 
      image: '/placeholder-dish.jpg', 
      quantity: 1,
      status: true,
      notes: ''
    },
    { 
      id: 9, 
      name: 'Gỏi Cuốn Tôm Thịt', 
      price: 35000, 
      image: '/placeholder-dish.jpg', 
      quantity: 4,
      status: true,
      notes: ''
    },
  ],
  '6': [
    { 
      id: 10, 
      name: 'Bánh Mì Thịt', 
      price: 25000, 
      image: '/placeholder-dish.jpg', 
      quantity: 5,
      status: true,
      notes: ''
    },
    { 
      id: 11, 
      name: 'Bún Riêu', 
      price: 45000, 
      image: '/placeholder-dish.jpg', 
      quantity: 2,
      status: true,
      notes: ''
    },
  ],
};

export const TableCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tableCarts, setTableCarts] = useState<Record<string, StandardCartItem[]>>(() => {
    const savedCarts = localStorage.getItem('tableCarts');
    return savedCarts ? JSON.parse(savedCarts) : demoTableCarts;
  });
  const [currentTable, setCurrentTable] = useState<string>(() => {
    const savedTable = localStorage.getItem('currentTable');
    return savedTable || '1'; // FIX: Default là '1' thay vì 'A1'
  });

  const setTable = (table: string) => setCurrentTable(table);

  const addToCart = (item: Omit<StandardCartItem, 'quantity'>) => {
    setTableCarts(prev => {
      const cart = prev[currentTable] || [];
      const found = cart.find(i => i.name === item.name);
      let newCart: StandardCartItem[];
      if (found) {
        newCart = cart.map(i => i.name === item.name ? 
          { ...i, 
            quantity: i.quantity + 1,
            orderStatus: item.orderStatus || i.orderStatus,
            orderDetailId: item.orderDetailId || i.orderDetailId
          } : i);
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

  // Lưu giỏ hàng vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('tableCarts', JSON.stringify(tableCarts));
  }, [tableCarts]);

  // Lưu bàn hiện tại vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('currentTable', currentTable);
  }, [currentTable]);

  return (
    <TableCartContext.Provider value={{ tableCarts, setTable, currentTable, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </TableCartContext.Provider>
  );
};
