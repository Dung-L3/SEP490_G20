export interface Dish {
  dishId: number;
  dishName: string;
  categoryId: number;
  price: number;
  status: boolean;
  unit: string;
  imageUrl: string;
  createdAt: string;
}

const API_URL = '/api/dishes';

const handleResponse = async (response: Response) => {
  const text = await response.text();
  
  try {
    // Try to parse as JSON first
    const data = JSON.parse(text);
    
    // If response was not OK, throw error with any error message from server
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // If parsing failed or response was not OK, throw error with raw response
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, details: ${text}`);
    }
    throw new Error(`Invalid JSON response: ${text} (${error}`);
  }
};

export type DishApi = {
  getAll: () => Promise<Dish[]>;
  getById: (id: number) => Promise<Dish>;
  create: (dish: Omit<Dish, 'dishId' | 'createdAt'>) => Promise<Dish>;
  update: (id: number, dish: Dish) => Promise<Dish>;
  delete: (id: number) => Promise<void>;
  getByCategory: (categoryId: number) => Promise<Dish[]>;
  getByStatus: (status: boolean) => Promise<Dish[]>;
  searchByName: (name: string) => Promise<Dish[]>;
  updateStatus: (id: number, status: boolean) => Promise<Dish>;
  activate: (id: number) => Promise<Dish>;
  deactivate: (id: number) => Promise<Dish>;
};

export const dishApi: DishApi = {
  getAll: async () => {
    try {
      const response = await fetch(API_URL);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching dish ${id}:`, error);
      throw error;
    }
  },

  create: async (dish) => {
    try {
      // Chỉ cho phép thêm ảnh bằng URL, không xử lý base64 hay upload file
      if (!dish.imageUrl || !/^https?:\/\//.test(dish.imageUrl)) {
        throw new Error('Vui lòng nhập đúng đường dẫn URL cho ảnh món ăn!');
      }

      const formattedDish = {
        ...dish,
        dishName: dish.dishName.trim(),
        price: Number(dish.price),
        status: Boolean(dish.status),
        categoryId: Number(dish.categoryId) || 1,
        unit: dish.unit?.trim() || 'Phần',
        imageUrl: dish.imageUrl.trim()
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formattedDish),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error creating dish:', error);
      throw error;
    }
  },

  update: async (id: number, dish: Dish) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(dish),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating dish ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      await handleResponse(response);
    } catch (error) {
      console.error(`Error deleting dish ${id}:`, error);
      throw error;
    }
  },

  getByCategory: async (categoryId: number) => {
    try {
      const response = await fetch(`${API_URL}/category/${categoryId}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching dishes by category ${categoryId}:`, error);
      throw error;
    }
  },

  getByStatus: async (status: boolean) => {
    try {
      const response = await fetch(`${API_URL}/status/${status}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching dishes by status ${status}:`, error);
      throw error;
    }
  },

  searchByName: async (name: string) => {
    try {
      const response = await fetch(`${API_URL}/search?name=${encodeURIComponent(name)}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error searching dishes by name ${name}:`, error);
      throw error;
    }
  },

  updateStatus: async (id: number, status: boolean) => {
    try {
      const response = await fetch(`${API_URL}/${id}/status?status=${status}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating dish status ${id}:`, error);
      throw error;
    }
  },

  activate: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}/activate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error activating dish ${id}:`, error);
      throw error;
    }
  },

  deactivate: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deactivating dish ${id}:`, error);
      throw error;
    }
  },
};
