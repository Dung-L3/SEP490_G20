import React, { useState } from 'react';
import TableMap from '../../components/TableMap';
import TaskbarManager from '../../components/TaskbarManager';




// Danh sách bàn mẫu cho TableView
const sampleTables = [
  // Floor 1 - Tables 1-20
  { id: 1, name: 'Bàn 1', x: 0, y: 0, status: 'Trống', capacity: 4 },
  { id: 2, name: 'Bàn 2', x: 1, y: 0, status: 'Đã đặt', capacity: 2, estimatedTime: '19:30' },
  { id: 3, name: 'Bàn 3', x: 2, y: 0, status: 'Trống', capacity: 6 },
  { id: 4, name: 'Bàn 4', x: 3, y: 0, status: 'Đang phục vụ', capacity: 4, estimatedTime: '45 phút' },
  { id: 5, name: 'Bàn 5', x: 4, y: 0, status: 'Trống', capacity: 2 },
  { id: 6, name: 'Bàn 6', x: 0, y: 1, status: 'Đã đặt', capacity: 8, estimatedTime: '20:00' },
  { id: 7, name: 'Bàn 7', x: 1, y: 1, status: 'Trống', capacity: 4 },
  { id: 8, name: 'Bàn 8', x: 2, y: 1, status: 'Trống', capacity: 2 },
  { id: 9, name: 'Bàn 9', x: 3, y: 1, status: 'Trống', capacity: 6 },
  { id: 10, name: 'Bàn 10', x: 4, y: 1, status: 'Bảo trì', capacity: 4 },
  { id: 11, name: 'Bàn 11', x: 0, y: 2, status: 'Trống', capacity: 2 },
  { id: 12, name: 'Bàn 12', x: 1, y: 2, status: 'Đã đặt', capacity: 4, estimatedTime: '19:45' },
  { id: 13, name: 'Bàn 13', x: 2, y: 2, status: 'Trống', capacity: 6 },
  { id: 14, name: 'Bàn 14', x: 3, y: 2, status: 'Đang phục vụ', capacity: 2, estimatedTime: '30 phút' },
  { id: 15, name: 'Bàn 15', x: 4, y: 2, status: 'Trống', capacity: 4 },
  { id: 16, name: 'Bàn 16', x: 0, y: 3, status: 'Trống', capacity: 8 },
  { id: 17, name: 'Bàn 17', x: 1, y: 3, status: 'Đã đặt', capacity: 2, estimatedTime: '20:15' },
  { id: 18, name: 'Bàn 18', x: 2, y: 3, status: 'Trống', capacity: 4 },
  { id: 19, name: 'Bàn 19', x: 3, y: 3, status: 'Trống', capacity: 6 },
  { id: 20, name: 'Bàn 20', x: 4, y: 3, status: 'Bảo trì', capacity: 4 },
  
  // Floor 2 - Tables 21-40
  { id: 21, name: 'Bàn 21', x: 0, y: 0, status: 'Trống', capacity: 4 },
  { id: 22, name: 'Bàn 22', x: 1, y: 0, status: 'Đang phục vụ', capacity: 6, estimatedTime: '20 phút' },
  { id: 23, name: 'Bàn 23', x: 2, y: 0, status: 'Trống', capacity: 2 },
  { id: 24, name: 'Bàn 24', x: 3, y: 0, status: 'Đã đặt', capacity: 4, estimatedTime: '21:00' },
  { id: 25, name: 'Bàn 25', x: 4, y: 0, status: 'Trống', capacity: 8 },
  { id: 26, name: 'Bàn 26', x: 0, y: 1, status: 'Trống', capacity: 2 },
  { id: 27, name: 'Bàn 27', x: 1, y: 1, status: 'Đã đặt', capacity: 4, estimatedTime: '19:30' },
  { id: 28, name: 'Bàn 28', x: 2, y: 1, status: 'Đang phục vụ', capacity: 6, estimatedTime: '35 phút' },
  { id: 29, name: 'Bàn 29', x: 3, y: 1, status: 'Trống', capacity: 2 },
  { id: 30, name: 'Bàn 30', x: 4, y: 1, status: 'Trống', capacity: 4 },
  { id: 31, name: 'Bàn 31', x: 0, y: 2, status: 'Bảo trì', capacity: 8 },
  { id: 32, name: 'Bàn 32', x: 1, y: 2, status: 'Trống', capacity: 4 },
  { id: 33, name: 'Bàn 33', x: 2, y: 2, status: 'Đã đặt', capacity: 2, estimatedTime: '20:30' },
  { id: 34, name: 'Bàn 34', x: 3, y: 2, status: 'Trống', capacity: 6 },
  { id: 35, name: 'Bàn 35', x: 4, y: 2, status: 'Đang phục vụ', capacity: 4, estimatedTime: '15 phút' },
  { id: 36, name: 'Bàn 36', x: 0, y: 3, status: 'Trống', capacity: 2 },
  { id: 37, name: 'Bàn 37', x: 1, y: 3, status: 'Trống', capacity: 4 },
  { id: 38, name: 'Bàn 38', x: 2, y: 3, status: 'Đã đặt', capacity: 8, estimatedTime: '21:15' },
  { id: 39, name: 'Bàn 39', x: 3, y: 3, status: 'Trống', capacity: 6 },
  { id: 40, name: 'Bàn 40', x: 4, y: 3, status: 'Bảo trì', capacity: 4 },

  // Floor 3 - Tables 41-60
  { id: 41, name: 'Bàn 41', x: 0, y: 0, status: 'Trống', capacity: 4 },
  { id: 42, name: 'Bàn 42', x: 1, y: 0, status: 'Trống', capacity: 2 },
  { id: 43, name: 'Bàn 43', x: 2, y: 0, status: 'Đã đặt', capacity: 6, estimatedTime: '19:45' },
  { id: 44, name: 'Bàn 44', x: 3, y: 0, status: 'Trống', capacity: 4 },
  { id: 45, name: 'Bàn 45', x: 4, y: 0, status: 'Đang phục vụ', capacity: 8, estimatedTime: '25 phút' },
  { id: 46, name: 'Bàn 46', x: 0, y: 1, status: 'Trống', capacity: 2 },
  { id: 47, name: 'Bàn 47', x: 1, y: 1, status: 'Bảo trì', capacity: 4 },
  { id: 48, name: 'Bàn 48', x: 2, y: 1, status: 'Trống', capacity: 6 },
  { id: 49, name: 'Bàn 49', x: 3, y: 1, status: 'Đã đặt', capacity: 2, estimatedTime: '20:45' },
  { id: 50, name: 'Bàn 50', x: 4, y: 1, status: 'Trống', capacity: 4 },
  { id: 51, name: 'Bàn 51', x: 0, y: 2, status: 'Đang phục vụ', capacity: 8, estimatedTime: '40 phút' },
  { id: 52, name: 'Bàn 52', x: 1, y: 2, status: 'Trống', capacity: 4 },
  { id: 53, name: 'Bàn 53', x: 2, y: 2, status: 'Trống', capacity: 2 },
  { id: 54, name: 'Bàn 54', x: 3, y: 2, status: 'Đã đặt', capacity: 6, estimatedTime: '21:30' },
  { id: 55, name: 'Bàn 55', x: 4, y: 2, status: 'Trống', capacity: 4 },
  { id: 56, name: 'Bàn 56', x: 0, y: 3, status: 'Trống', capacity: 2 },
  { id: 57, name: 'Bàn 57', x: 1, y: 3, status: 'Đang phục vụ', capacity: 4, estimatedTime: '55 phút' },
  { id: 58, name: 'Bàn 58', x: 2, y: 3, status: 'Trống', capacity: 8 },
  { id: 59, name: 'Bàn 59', x: 3, y: 3, status: 'Bảo trì', capacity: 6 },
  { id: 60, name: 'Bàn 60', x: 4, y: 3, status: 'Trống', capacity: 4 },
];

const TableManager = () => {
  const [tables] = useState(sampleTables);

  const handleTableClick = (table) => {
    alert(`Bàn: ${table.name}\nTrạng thái: ${table.status}`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Taskbar cố định trái */}
      <div style={{ width: 220, minHeight: '100vh', position: 'sticky', top: 0, zIndex: 10 }}>
        <TaskbarManager />
      </div>
      {/* TableMap chiếm phần còn lại */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <TableMap tables={tables} onTableClick={handleTableClick} />
      </div>
    </div>
  );
};

export default TableManager;
