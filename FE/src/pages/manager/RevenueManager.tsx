import React, { useState } from 'react';
import { TrendingUp, Calendar, ShoppingCart, DollarSign, Search, Filter } from 'lucide-react';
import TaskbarManager from '../../components/TaskbarManager';

// Sample revenue data
const initialRevenue = [
  { date: '2025-07-01', orders: 32, total: 5200000 },
  { date: '2025-07-02', orders: 28, total: 4800000 },
  { date: '2025-07-03', orders: 35, total: 6100000 },
  { date: '2025-07-04', orders: 30, total: 5400000 },
  { date: '2025-07-05', orders: 42, total: 7200000 },
  { date: '2025-07-06', orders: 38, total: 6800000 },
  { date: '2025-07-07', orders: 45, total: 8100000 },
  { date: '2025-07-08', orders: 29, total: 4700000 },
  { date: '2025-07-09', orders: 36, total: 6300000 },
  { date: '2025-07-10', orders: 40, total: 7500000 },
];

const RevenueManager = () => {
  const [revenue, setRevenue] = useState(initialRevenue);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-07');

  const filteredRevenue = revenue.filter(r => {
    const matchesSearch = r.date.includes(search);
    const matchesMonth = r.date.startsWith(selectedMonth);
    return search ? matchesSearch : matchesMonth;
  });

  const totalOrders = filteredRevenue.reduce((sum, r) => sum + r.orders, 0);
  const totalRevenue = filteredRevenue.reduce((sum, r) => sum + r.total, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quản lý doanh thu</h1>
                  <p className="text-sm text-gray-500">Theo dõi và phân tích doanh thu hàng ngày</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                    placeholder="Tìm kiếm theo ngày..."
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng số đơn hàng</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalOrders.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">
                    <span className="inline-flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% so với tháng trước
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-green-600 mt-1">
                    <span className="inline-flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8% so với tháng trước
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Giá trị đơn hàng TB</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(avgOrderValue)}</p>
                  <p className="text-sm text-red-600 mt-1">
                    <span className="inline-flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                      -3% so với tháng trước
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Chi tiết doanh thu theo ngày</h2>
              <p className="text-sm text-gray-600 mt-1">Danh sách các giao dịch trong khoảng thời gian được chọn</p>
            </div>
            
            {filteredRevenue.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">Không có dữ liệu</p>
                <p className="text-gray-500">Không tìm thấy dữ liệu doanh thu cho khoảng thời gian này</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số đơn hàng
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doanh thu
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá trị TB/đơn
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRevenue.map((r, index) => (
                      <tr key={r.date} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {new Date(r.date).getDate()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(r.date)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {r.date}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ShoppingCart className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {r.orders} đơn
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600">
                            {formatCurrency(r.total)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(r.total / r.orders)}
                          </div>
                        </td>
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

export default RevenueManager;