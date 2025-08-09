import React, { useState, useEffect } from 'react';
import type { ComboDTO, ComboItemDTO, CreateComboRequest } from '../api/comboApi';
import type { MenuItem } from '../api/orderApi';
import { comboApi } from '../api/comboApi';

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (combo: CreateComboRequest) => Promise<void>;
  dishes: MenuItem[];
  initialData?: ComboDTO;
}

export const ComboModal: React.FC<ComboModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  dishes,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [selectedItems, setSelectedItems] = useState<ComboItemDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.comboName || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price || 0);
      setSelectedItems(initialData.comboItems || []);
    } else {
      setName('');
      setDescription('');
      setPrice(0);
      setSelectedItems([]);
    }
  }, [initialData]);

  const handleAddItem = (dishId: number) => {
    const dish = dishes.find(d => d.id === dishId);
    if (dish) {
      setSelectedItems(prev => {
        const existing = prev.find(item => item.dishId === dishId);
        if (existing) {
          return prev.map(item =>
            item.dishId === dishId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { 
          dishId, 
          quantity: 1,
          dishName: dish.name,
          dishPrice: dish.price
        }];
      });
    }
  };

  const handleRemoveItem = (dishId: number) => {
    setSelectedItems(prev => prev.filter(item => item.dishId !== dishId));
  };

  const handleQuantityChange = (dishId: number, quantity: number) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.dishId === dishId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên combo không được để trống');
      return;
    }
    if (selectedItems.length === 0) {
      setError('Combo phải có ít nhất một món');
      return;
    }

    try {
      await onSave({
        comboName: name,
        description,
        price,
        comboItems: selectedItems,
      });
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'Có lỗi xảy ra khi lưu combo');
      } else {
        setError('Có lỗi xảy ra khi lưu combo');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
          {initialData ? 'Chỉnh sửa Combo' : 'Tạo Combo Mới'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>
          )}
          
          <div>
            <label className="block mb-1">Tên Combo:</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value.trim())}
              className="w-full p-2 border rounded"
              placeholder="Nhập tên combo..."
              required
            />
          </div>          <div>
            <label className="block mb-1">Mô tả:</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block mb-1">Giá:</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="w-full p-2 border rounded"
              step="1000"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Món ăn trong combo:</label>
            <select
              onChange={e => handleAddItem(Number(e.target.value))}
              className="w-full p-2 border rounded mb-2"
              value=""
            >
              <option value="">Chọn món ăn...</option>
              {dishes.map(dish => (
                <option key={dish.id} value={dish.id}>
                  {dish.name} - {dish.price.toLocaleString()}đ
                </option>
              ))}
            </select>

            <div className="space-y-2">
              {selectedItems.map(item => (
                <div
                  key={item.dishId}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <span>{item.dishName}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e =>
                        handleQuantityChange(item.dishId, Number(e.target.value))
                      }
                      className="w-16 p-1 border rounded"
                      min="1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.dishId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
