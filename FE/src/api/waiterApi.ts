import type { MenuItem } from '../pages/waiter/Order';

// Mock data cho menu items
const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Phở bò',
    price: 50000,
    description: 'Phở bò truyền thống',
    image: 'pho.jpg'
  },
  {
    id: 2,
    name: 'Cà phê sữa đá',
    price: 25000,
    description: 'Cà phê sữa đá thơm ngon',
    image: 'cafe.jpg'
  },
  {
    id: 3,
    name: 'Chè thái',
    price: 30000,
    description: 'Chè thái mát lạnh',
    image: 'che.jpg'
  }
];

export const waiterApi = {
  // Menu items với mock data
  getAllMenuItems: async (): Promise<MenuItem[]> => {
    // Return mock data thay vì gọi API
    return Promise.resolve(mockMenuItems);
  },

  // Orders - Tạm thời comment out vì chưa có backend
  // createOrder: async (order: {
  //   tableId: number;
  //   items: Array<{
  //     menuItemId: number;
  //     quantity: number;
  //     note?: string;
  //   }>;
  // }): Promise<void> => {
  //   // Implement khi có backend
  //   return Promise.resolve();
  // },

  // getOrdersByTable: async (tableId: number): Promise<Array<{
  //   id: number;
  //   menuItem: MenuItem;
  //   quantity: number;
  //   status: string;
  //   note?: string;
  // }>> => {
  //   // Implement khi có backend
  //   return Promise.resolve([]);
  // },

  // updateOrderStatus: async (orderId: number, status: string): Promise<void> => {
  //   // Implement khi có backend
  //   return Promise.resolve();
  // }
};
