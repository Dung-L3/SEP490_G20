// Type adapters để convert giữa các API types và StandardTypes
import type { StandardCartItem, StandardMenuItem } from '../types/StandardTypes';
import type { MenuItem } from '../api/orderApi';
import type { Dish } from '../api/dishApi';

export const convertMenuItemToStandard = (item: MenuItem): StandardCartItem => ({
  id: item.id,
  name: item.name,
  price: item.price,
  image: item.image || '/placeholder-dish.jpg',
  status: item.status === 'AVAILABLE',
  quantity: item.quantity || 1,
  orderStatus: item.orderStatus,
  orderDetailId: item.orderDetailId,
  notes: '',
  dishId: item.id,
  dishName: item.name
});

export const convertDishToStandard = (dish: Dish): StandardMenuItem => ({
  id: dish.dishId,
  name: dish.dishName,
  price: dish.price,
  image: dish.imageUrl || '/placeholder-dish.jpg',
  status: dish.isActive,
  categoryId: dish.categoryId,
  unit: dish.unit,
  dishId: dish.dishId,
  dishName: dish.dishName
});

export const convertStandardToMenuItem = (item: StandardCartItem): MenuItem => ({
  id: item.id,
  name: item.name,
  price: item.price,
  image: item.image,
  status: item.status ? 'AVAILABLE' : 'UNAVAILABLE',
  quantity: item.quantity,
  orderStatus: item.orderStatus,
  orderDetailId: item.orderDetailId
});