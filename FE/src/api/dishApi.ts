export interface Dish {
  dishId: number;
  dishName: string;
  categoryId: number;
  price: number;
  status: boolean;
  unit: string;
  imageUrl?: string;
  createdAt: string;
}

const API_URL = '/api/dishes';

export const dishApi = {
  getAll: async (): Promise<Dish[]> => {
    try {
      const response = await fetch(`${API_URL}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dishes:', error);
      throw error;
    }
  },

  getByStatus: async (status: boolean): Promise<Dish[]> => {
    try {
      const endpoint = status ? `${API_URL}/active` : `${API_URL}/inactive`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dishes by status:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Dish> => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching dish ${id}:`, error);
      throw error;
    }
  },

  getByCategory: async (categoryId: number): Promise<Dish[]> => {
    try {
      const response = await fetch(`${API_URL}/category/${categoryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching dishes for category ${categoryId}:`, error);
      throw error;
    }
  }
};
