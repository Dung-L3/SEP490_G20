export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
}

const API_URL = '/api/v1/categories';

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await fetch(`${API_URL}/getAll`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Category> => {
    try {
      const response = await fetch(`${API_URL}/getById/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  }
};