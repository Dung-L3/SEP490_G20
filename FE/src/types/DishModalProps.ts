import type { ChangeEvent } from 'react';

export interface DishModalProps {
  dish: {
    name: string;
    price: string | number;
    image: string;
    status: string;
  };
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onImageUrl: (value: string) => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
}
