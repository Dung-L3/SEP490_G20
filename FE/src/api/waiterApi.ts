import type { MenuItem } from '../pages/waiter/Order';

const MENU_API_URL = '/api/v1/menu';
const ORDER_API_URL = '/api/v1/orders';

export const waiterApi = {
  // Menu items
  getAllMenuItems: async (): Promise<MenuItem[]> => {
    try {
      const response = await fetch(`${MENU_API_URL}/all`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw new Error('Failed to fetch menu items');
    }
  },

  // Orders
  createOrder: async (order: {
    tableId: number;
    items: Array<{
      menuItemId: number;
      quantity: number;
      note?: string;
    }>;
  }): Promise<void> => {
    try {
      const response = await fetch(`${ORDER_API_URL}/create`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  },

  getOrdersByTable: async (tableId: number): Promise<Array<{
    id: number;
    menuItem: MenuItem;
    quantity: number;
    status: string;
    note?: string;
  }>> => {
    try {
      const response = await fetch(`${ORDER_API_URL}/table/${tableId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<void> => {
    try {
      const response = await fetch(`${ORDER_API_URL}/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }
};
