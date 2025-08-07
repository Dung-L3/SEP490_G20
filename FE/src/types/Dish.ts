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

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
}