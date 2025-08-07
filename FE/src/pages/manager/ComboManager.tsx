import React, { useState, useEffect } from 'react';
import { comboApi, type ComboDTO, type CreateComboRequest } from '../../api/comboApi';
import type { MenuItem } from '../../api/orderApi';
import { ComboModal } from '../../components/ComboModal';
import { fetchMenuItems } from '../../api/orderApi';
import TaskbarManager from '../../components/TaskbarManager';

const ComboManager: React.FC = () => {
  const [combos, setCombos] = useState<ComboDTO[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCombos = async () => {
    try {
      const data = await comboApi.getAllCombos();
      setCombos(data);
    } catch {
      setError('Không thể tải danh sách combo');
    }
  };

  const loadDishes = async () => {
    try {
      const data = await fetchMenuItems();
      setDishes(data);
    } catch {
      setError('Không thể tải danh sách món ăn');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadCombos(), loadDishes()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadCombos();
      return;
    }
    try {
      const results = await comboApi.searchCombosByName(searchTerm);
      setCombos(results);
    } catch {
      setError('Lỗi tìm kiếm combo');
    }
  };

  const handleCreateCombo = async (comboData: CreateComboRequest) => {
    try {
      await comboApi.createCombo(comboData);
      await loadCombos();
      setIsModalOpen(false);
    } catch {
      setError('Lỗi khi tạo combo');
    }
  };

  const handleDeleteCombo = async (combo: ComboDTO) => {
    if (!combo?.id) {
      console.error('Missing combo ID:', combo);
      setError('Không thể xóa combo: Thiếu thông tin');
      return;
    }
    console.log('Attempting to delete combo:', combo);
    
    if (!window.confirm(`Bạn có chắc muốn xóa combo "${combo.comboName}"?`)) return;
    
    try {
      console.log('Starting delete operation for combo ID:', combo.id, 'name:', combo.comboName);
      await comboApi.deleteCombo(combo.id, combo.comboName);
      console.log('Delete operation completed successfully');
      await loadCombos();
      setError(null); // Clear any existing errors after successful deletion
    } catch (error) {
      console.error('Delete operation failed:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi xóa combo');
    }
  };

  if (loading) return (
    <div className="flex h-screen">
      <TaskbarManager />
      <div className="flex-1 ml-[220px] p-4">
        <div>Đang tải...</div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      <TaskbarManager />
      <div className="flex-1 ml-[220px] p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý Combo</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tạo Combo Mới
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm combo..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Tìm kiếm
          </button>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo, index) => (
            <div
              key={`combo-${combo.id || index}`}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-2">{combo.comboName}</h3>
              <p className="text-gray-600 mb-2">{combo.description}</p>
              <p className="font-bold mb-2">
                Giá: {combo.price.toLocaleString()}đ
              </p>
              <div className="mb-4">
                <h4 className="font-semibold mb-1">Món ăn trong combo:</h4>
                <ul className="list-disc list-inside">
                  {combo.comboItems?.map((item, itemIndex) => (
                    <li key={`${combo.id}-item-${item.dishId || itemIndex}`}>
                      {item.dishName} x{item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteCombo(combo)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <ComboModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateCombo}
          dishes={dishes}
        />
      </div>
    </div>
  );
};

export default ComboManager;
