import React, { useEffect, useState } from 'react';
import { tableApi } from '../../api/tableApi';
import { type UiTable, mapApiTableToUiTable } from '../../utils/tableMapping';
import TaskbarWaiter from './TaskbarWaiter';
import WaiterTableMap from './WaiterTableMap';

const TableView = () => {
  const [tables, setTables] = useState<UiTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null); // ID of table being updated

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await tableApi.getAll();
        const uiTables = data.map(mapApiTableToUiTable);
        setTables(uiTables);
        setError(null);
      } catch (error) {
        console.error('Error fetching tables:', error);
        setError('Không thể tải danh sách bàn');
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  const handleTableClick = async (table: UiTable) => {
    if (updating) return; // Ngăn chặn nhiều lần cập nhật đồng thời
    if (table.status !== 'Trống') {
      // Nếu bàn không trống, không làm gì cả và không hiển thị lỗi
      return;
    }
    
    try {
      setUpdating(table.id);
      
      // Chỉ cho phép chuyển từ trạng thái Trống sang Đang phục vụ
      const newStatus = 'Đang phục vụ';
      
      await tableApi.updateStatus(table.id, newStatus);
      
      // Cập nhật trạng thái local
      setTables(prevTables => 
        prevTables.map(t => 
          t.id === table.id ? { ...t, status: newStatus } : t
        )
      );
      // Không cần setError(null) vì chúng ta không hiển thị lỗi nữa
      
    } catch (error) {
      console.error('Error updating table status:', error);
      setError('Không thể cập nhật trạng thái bàn');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-xl">Đang tải dữ liệu bàn...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Taskbar trái */}
      <TaskbarWaiter />
      <div className="hidden md:block w-56" />
      
      {/* Nội dung chính */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sơ đồ bàn</h1>
          <p className="text-gray-600">Quản lý trạng thái các bàn trong nhà hàng</p>
        </div>

        {/* Sơ đồ bàn */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <WaiterTableMap tables={tables} onTableClick={handleTableClick} />
        </div>
      </main>
    </div>
  );
};

export default TableView;
