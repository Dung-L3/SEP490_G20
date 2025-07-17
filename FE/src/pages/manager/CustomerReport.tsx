import React, { useState } from 'react';
import { User, Search, Filter } from 'lucide-react';
import TaskbarManager from '../../components/TaskbarManager';

// Sample customer report data
const initialCustomers = [
  { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', totalOrders: 12, totalSpent: 3500000, lastOrder: '2025-07-03' },
  { id: 2, name: 'Trần Thị B', phone: '0912345678', totalOrders: 8, totalSpent: 2100000, lastOrder: '2025-07-02' },
  { id: 3, name: 'Lê Văn C', phone: '0987654321', totalOrders: 15, totalSpent: 4800000, lastOrder: '2025-07-01' },
  { id: 4, name: 'Phạm Thị D', phone: '0934567890', totalOrders: 5, totalSpent: 1200000, lastOrder: '2025-07-04' },
  { id: 5, name: 'Võ Văn E', phone: '0978123456', totalOrders: 10, totalSpent: 3200000, lastOrder: '2025-07-03' },
];

const ReportManager = () => {
  const [customers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-07');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchesMonth = c.lastOrder.startsWith(selectedMonth);
    return search ? matchesSearch : matchesMonth;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Taskbar */}
      <div className="w-64 min-h-screen sticky top-0 z-10">
        <TaskbarManager />
      </div>
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Báo cáo khách hàng</h1>
                  <p className="text-sm text-gray-500">Thống kê, tìm kiếm và phân tích khách hàng thân thiết</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                    placeholder="Tìm theo tên, SĐT..."
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white appearance-none"
                  >
                    <option value="2025-07">Tháng 7, 2025</option>
                    <option value="2025-06">Tháng 6, 2025</option>
                    <option value="2025-05">Tháng 5, 2025</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách khách hàng</h2>
              <p className="text-sm text-gray-600 mt-1">Thống kê các khách hàng theo tháng, tổng chi tiêu, số đơn, lần cuối cùng mua hàng</p>
            </div>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-16">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">Không có dữ liệu khách hàng</p>
                <p className="text-gray-500">Không tìm thấy khách hàng phù hợp với bộ lọc</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khách</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số đơn</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng chi tiêu</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lần cuối mua</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{c.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{c.totalOrders}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">{formatCurrency(c.totalSpent)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{c.lastOrder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManager;
