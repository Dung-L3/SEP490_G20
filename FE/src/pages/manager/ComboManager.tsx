import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import TaskbarManager from '../../components/TaskbarManager';
import { comboApi, type ComboDTO, type CreateComboRequest, type UpdateComboRequest } from '../../api/comboApi';
import type { MenuItem } from '../../api/orderApi';
import { fetchMenuItems } from '../../api/orderApi';
import { ComboModal } from '../../components/ComboModal';

const ComboManager: React.FC = () => {
  const [combos, setCombos] = useState<ComboDTO[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [combosData, dishesData] = await Promise.all([
        comboApi.getAllCombos(),
        fetchMenuItems()
      ]);
      setCombos(combosData);
      setDishes(dishesData);
      setError(null);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCombo = () => {
    setSelectedCombo(null);
    setIsModalOpen(true);
  };

  const handleEditCombo = (combo: ComboDTO) => {
    setSelectedCombo(combo);
    setIsModalOpen(true);
  };

  const handleDeleteCombo = async (combo: ComboDTO) => {
    if (!combo?.comboId) {
      setError('Không thể xóa combo: Thiếu thông tin');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa combo "${combo.comboName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await comboApi.deleteCombo(combo.comboId, combo.comboName);
      await loadInitialData();
      setError(null);
    } catch (err) {
      console.error('Error deleting combo:', err);
      setError('Không thể xóa combo. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCombo(null);
  };

  const handleModalSave = async (comboData: CreateComboRequest) => {
    setLoading(true);
    try {
      if (selectedCombo) {
        const updateData: UpdateComboRequest = {
          ...comboData,
          status: selectedCombo.status
        };
        await comboApi.updateCombo(selectedCombo.comboId, updateData);
      } else {
        await comboApi.createCombo(comboData);
      }
      await loadInitialData();
      setIsModalOpen(false);
      setSelectedCombo(null);
      setError(null);
    } catch (err) {
      console.error('Error saving combo:', err);
      setError('Không thể lưu combo. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen sticky top-0 z-10">
        <TaskbarManager />
      </div>
      
      <div className="flex-1 min-w-0 p-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Combo</h1>
          <button
            onClick={handleAddCombo}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm combo mới
          </button>
        </div>

        {/* Combo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo) => (
            <div
              key={combo.comboId}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {combo.comboName}
                  </h3>
                  <p className="text-sm text-gray-500">#{combo.comboId}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCombo(combo)}
                    className="p-1 text-orange-600 hover:text-orange-700"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCombo(combo)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Món ăn trong combo:
                </h4>
                <ul className="list-disc list-inside">
                  {(combo.comboItems || []).map((item, index) => (
                    <li key={index} className="text-gray-600 text-sm">
                      {item.dishName} x{item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">Giá:</span>
                <span className="text-green-600 font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(combo.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <ComboModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSave={handleModalSave}
            dishes={dishes}
            initialData={selectedCombo || undefined}
          />
        )}
      </div>
    </div>
  );
};

export default ComboManager;
