import React, { useState } from 'react';
import TaskbarManager from '../../components/TaskbarManager';

// Sample order data
const initialOrders = [
  {
    id: 1001,
    table: 1,
    customer: 'Nguyễn Văn A',
    items: [
      { name: 'Cơm Tấm Sườn Nướng', quantity: 2, price: 65000 },
      { name: 'Bánh Xèo Miền Tây', quantity: 1, price: 45000 },
    ],
    total: 175000,
    status: 'Đang phục vụ',
    createdAt: '2025-07-04 10:15',
  },
  {
    id: 1002,
    table: 3,
    customer: 'Trần Thị B',
    items: [
      { name: 'Phở Bò', quantity: 3, price: 50000 },
    ],
    total: 150000,
    status: 'Đã thanh toán',
    createdAt: '2025-07-04 09:50',
  },
  {
    id: 1003,
    table: 5,
    customer: 'Lê Văn C',
    items: [
      { name: 'Lẩu Cá Kèo', quantity: 1, price: 180000 },
      { name: 'Gỏi Cuốn Tôm Thịt', quantity: 2, price: 35000 },
    ],
    total: 250000,
    status: 'Đang phục vụ',
    createdAt: '2025-07-04 10:30',
  },
  {
    id: 1004,
    table: 2,
    customer: 'Phạm Thị D',
    items: [
      { name: 'Bún Chả Hà Nội', quantity: 2, price: 60000 },
      { name: 'Gỏi Cuốn Tôm Thịt', quantity: 1, price: 35000 },
    ],
    total: 155000,
    status: 'Đã thanh toán',
    createdAt: '2025-07-04 10:40',
  },
  {
    id: 1005,
    table: 7,
    customer: 'Võ Văn E',
    items: [
      { name: 'Mì Quảng', quantity: 1, price: 55000 },
      { name: 'Bánh Cuốn Hà Nội', quantity: 2, price: 45000 },
    ],
    total: 145000,
    status: 'Đang phục vụ',
    createdAt: '2025-07-04 11:00',
  },
  {
    id: 1006,
    table: 4,
    customer: 'Ngô Thị F',
    items: [
      { name: 'Cơm Gà Hội An', quantity: 2, price: 70000 },
    ],
    total: 140000,
    status: 'Đã hủy',
    createdAt: '2025-07-04 09:30',
  },
  {
    id: 1007,
    table: 8,
    customer: 'Lý Minh G',
    items: [
      { name: 'Lẩu Cá Kèo', quantity: 1, price: 180000 },
      { name: 'Phở Bò', quantity: 1, price: 50000 },
    ],
    total: 230000,
    status: 'Đang phục vụ',
    createdAt: '2025-07-04 11:10',
  },
];

const statusColors: Record<'Đang phục vụ' | 'Đã thanh toán' | 'Đã hủy', string> = {
  'Đang phục vụ': 'bg-yellow-100 text-yellow-800',
  'Đã thanh toán': 'bg-green-100 text-green-800',
  'Đã hủy': 'bg-red-100 text-red-800',
};

const OrderManager = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesSearch =
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toString().includes(search) ||
      order.table.toString().includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen sticky top-0 z-10">
        <TaskbarManager />
      </div>
      <div className="flex-1 min-w-0 p-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
            <p className="text-gray-600">Theo dõi, tìm kiếm và quản lý các đơn hàng của nhà hàng</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Tìm theo tên khách, số bàn, mã đơn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đang phục vụ">Đang phục vụ</option>
              <option value="Đã thanh toán">Đã thanh toán</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã đơn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bàn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Món đã gọi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thời gian</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-blue-700">#{order.id}</td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4">Bàn {order.table}</td>
                    <td className="px-6 py-4">
                      <ul className="list-disc pl-4">
                        {order.items.map((item, idx) => (
                          <li key={idx}>{item.name} <span className="text-gray-500">x{item.quantity}</span></li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-700">{order.total.toLocaleString()}đ</td>
                    <td className="px-6 py-4 text-gray-700">{order.createdAt}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={e => {
                          const newStatus = e.target.value;
                          setOrders(prev => prev.map(o =>
                            o.id === order.id ? { ...o, status: newStatus } : o
                          ));
                        }}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-none focus:ring-2 focus:ring-blue-500 ${statusColors[order.status as keyof typeof statusColors] || ''}`}
                        style={{ minWidth: 120 }}
                      >
                        <option value="Đang phục vụ">Đang phục vụ</option>
                        <option value="Đã thanh toán">Đã thanh toán</option>
                        <option value="Đã hủy">Đã hủy</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Không tìm thấy đơn hàng nào</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManager;
