export interface Dish {
  dishId: number;
  dishName: string;
  price: number;
  unit: string;
  imageUrl?: string;
  categoryId: number;
  isActive: boolean;
}

const BASE_URL = '/api';

export const dishApi = {
  getByStatus: async (isActive: boolean): Promise<Dish[]> => {
    try {
      const response = await fetch(`${BASE_URL}/dishes?isActive=${isActive}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch dishes, using fallback');
        return dishApi.getFallbackDishes();
      }

      const data = await response.json();
      return Array.isArray(data) ? data : dishApi.getFallbackDishes();
    } catch (error) {
      console.error('Error fetching dishes:', error);
      return dishApi.getFallbackDishes();
    }
  },

  getFallbackDishes: (): Dish[] => {
    return [
      {
        dishId: 1,
        dishName: 'Phở Bò',
        price: 45000,
        unit: 'Tô',
        imageUrl: '/images/pho-bo.jpg',
        categoryId: 1,
        isActive: true
      },
      {
        dishId: 2,
        dishName: 'Bún Chả',
        price: 40000,
        unit: 'Phần',
        imageUrl: '/images/bun-cha.jpg',
        categoryId: 1,
        isActive: true
      },
      {
        dishId: 3,
        dishName: 'Cơm Tấm',
        price: 35000,
        unit: 'Phần',
        imageUrl: '/images/com-tam.jpg',
        categoryId: 2,
        isActive: true
      },
      {
        dishId: 4,
        dishName: 'Trà Đá',
        price: 5000,
        unit: 'Ly',
        categoryId: 3,
        isActive: true
      }
    ];
  }
};
