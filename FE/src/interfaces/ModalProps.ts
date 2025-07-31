import React from 'react';

interface ModalProps {
  dish: {
    name: string;
    price: string;
    image: string;
    status: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onImageUrl: (url: string) => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
}
