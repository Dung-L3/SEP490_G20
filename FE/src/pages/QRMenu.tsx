import  { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { tableApi } from '../api/tableApi';
import { type UiTable, mapApiTableToUiTable } from '../utils/tableMapping';

const QRMenu: FC = () => {
  const { tableId } = useParams(); // Lấy tableId từ URL
  const [table, setTable] = useState<UiTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTableInfo = async () => {
      if (!tableId) {
        setError('Không tìm thấy thông tin bàn');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await tableApi.getById(parseInt(tableId));
        const uiTable = mapApiTableToUiTable(response);
        setTable(uiTable);
      } catch (err) {
        console.error('Lỗi khi tải thông tin bàn:', err);
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin bàn');
      } finally {
        setLoading(false);
      }
    };

    fetchTableInfo();
  }, [tableId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Lỗi</p>
          <p>{error || 'Không tìm thấy thông tin bàn'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thực đơn</h1>
              <p className="text-gray-600">Bàn {table.name} - Khu vực {table.areaId}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              table.status === 'Trống' 
                ? 'bg-green-100 text-green-800' 
                : table.status === 'Đang phục vụ'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {table.status}
            </div>
          </div>
        </div>

        {/* Menu Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Menu items will be added here */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Món chính</h2>
            {/* Menu items */}
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Đồ uống</h2>
            {/* Beverage items */}
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Món tráng miệng</h2>
            {/* Dessert items */}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-600">Tổng cộng:</span>
                <span className="text-xl font-bold text-gray-900 ml-2">0đ</span>
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                Đặt món
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRMenu;
