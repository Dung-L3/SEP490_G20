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
  },

  updateStatus: async (dishId: number, status: boolean): Promise<void> => {
    try {
      const formData = new URLSearchParams();
      formData.append('status', status.toString());

      const response = await fetch(`/api/v1/dishes/${dishId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error updating dish status:`, error);
      throw error;
    }
  },

  deleteDish: async (dishId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/dishes/${dishId}?name=${Math.random().toString(36).substring(2, 10)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Cố gắng đọc thông báo lỗi từ response
        const errorData = await response.json().catch(() => ({}));
        // Nếu lỗi liên quan đến khóa ngoại ComboItems
        if (errorData.message?.includes('FK__ComboItem__DishI__656C112C')) {
          throw new Error('Không thể xóa món ăn này vì nó đang được sử dụng trong combo. Vui lòng xóa món khỏi combo trước.');
        }
        throw new Error(errorData.message || 'Lỗi khi xóa món ăn');
      }
    } catch (error) {
      console.error(`Error deleting dish:`, error);
      throw error;
    }
  }
};
