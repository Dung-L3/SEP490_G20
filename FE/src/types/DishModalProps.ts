import type { ChangeEvent } from 'react';

export interface DishModalProps {
  dish: {
    dishId?: number;
    dishName: string;
    categoryId: number;
    price: number;
    status: boolean;
    unit: string;
    imageUrl?: string;
    createdAt?: string;
  };
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onImageUrl: (value: string) => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
}
