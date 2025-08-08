// Standard types để tránh conflicts - FINAL VERSION
export interface StandardMenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  status?: boolean;
  categoryId?: number;
  unit?: string;
  dishId?: number; // For API compatibility
  dishName?: string; // For API compatibility
}

export interface StandardCartItem extends StandardMenuItem {
  quantity: number;
  notes?: string;
  orderStatus?: 'pending' | 'cooking' | 'completed';
  orderDetailId?: number;
}

// Utility functions để convert giữa các types
export const convertDishToStandardMenuItem = (dish: any): StandardMenuItem => ({
  id: dish.dishId || dish.id,
  name: dish.dishName || dish.name,
  price: dish.price,
  image: dish.imageUrl || dish.image || '/placeholder-dish.jpg',
  status: dish.isActive ?? true,
  categoryId: dish.categoryId,
  unit: dish.unit,
  dishId: dish.dishId,
  dishName: dish.dishName
});

export const convertOrderApiMenuItemToStandard = (item: any): StandardMenuItem => ({
  id: item.id,
  name: item.name,
  price: item.price,
  image: item.image,
  status: item.status === 'AVAILABLE'
});