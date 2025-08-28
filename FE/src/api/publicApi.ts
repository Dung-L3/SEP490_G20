import type { Table } from '../types/Table';
import type { Dish } from './dishApi';
import type { Category } from './categoryApi';
import type { ComboDTO } from './comboApi';
import { BACKEND_URL } from '../config/networkConfig';

const PUBLIC_API = `${BACKEND_URL}/api/public`;

export const publicApi = {
  // Tables
  getAllTables: async (): Promise<Table[]> => {
    const response = await fetch(`${PUBLIC_API}/tables`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error('Failed to fetch tables');
    }
    return await response.json();
  },
  
  getTableById: async (id: number): Promise<Table> => {
    const response = await fetch(`${PUBLIC_API}/tables/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch table');
    }
    return await response.json();
  },

  getTablesByStatus: async (status: string): Promise<Table[]> => {
    const response = await fetch(`${PUBLIC_API}/tables/status/${status}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tables by status');
    }
    return await response.json();
  },

  getTablesByArea: async (areaId: number): Promise<Table[]> => {
    const response = await fetch(`${PUBLIC_API}/tables/area/${areaId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tables by area');
    }
    return await response.json();
  },

  // Menu
  getDishes: async (): Promise<Dish[]> => {
    const response = await fetch(`${PUBLIC_API}/dishes`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error('Failed to fetch dishes');
    }
    return await response.json();
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${PUBLIC_API}/categories`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  },

  getCombos: async (): Promise<ComboDTO[]> => {
    const response = await fetch(`${PUBLIC_API}/combos`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error('Failed to fetch combos');
    }
    return await response.json();
  },

  // Orders
  createOrder: async (orderData: {
    tableId: number;
    items: Array<{
      dishId: number | null;
      comboId: number | null;
      quantity: number;
      notes?: string;
      unitPrice: number;
      isCombo: boolean;
    }>;
  }) => {
    try {
      // Log request data
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      
      // Make API call
      const response = await fetch(`${PUBLIC_API}/orders/dine-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData),
      });

      // Get response text
      const responseText = await response.text();
      
      // Log raw response
      console.log('Raw response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });

      // Handle non-200 responses
      if (!response.ok) {
        console.error('Error creating order:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        
        // Try to parse error message if it's JSON
        try {
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.message || `Failed to create order: ${errorJson.error}`);
        } catch (e) {
          throw new Error(`Failed to create order: ${responseText}`);
        }
      }

      // Parse successful response
      try {
        const result = JSON.parse(responseText);
        console.log('Order created successfully:', result);
        return result;
      } catch (e) {
        console.error('Error parsing success response:', e);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  }
};
