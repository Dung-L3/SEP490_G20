import React, { useState } from 'react';
import TaskbarManager from '../../components/TaskbarManager';

// Sample feedback data
const initialFeedback = [
  { id: 1, customer: 'Nguyễn Văn A', date: '2025-07-01', rating: 5, comment: 'Dịch vụ rất tốt, món ăn ngon.' },
  { id: 2, customer: 'Trần Thị B', date: '2025-07-02', rating: 4, comment: 'Không gian đẹp, phục vụ nhanh.' },
  { id: 3, customer: 'Lê Văn C', date: '2025-07-03', rating: 3, comment: 'Món ăn ổn, giá hợp lý.' },
  { id: 4, customer: 'Phạm Thị D', date: '2025-07-04', rating: 5, comment: 'Rất hài lòng, sẽ quay lại.' },
  { id: 5, customer: 'Võ Văn E', date: '2025-07-04', rating: 2, comment: 'Chờ món hơi lâu.' },
];

const ReportManager = () => {
  const [feedback] = useState(initialFeedback);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredFeedback = feedback.filter(f => {
    const matchesSearch = f.customer.toLowerCase().includes(search.toLowerCase()) || f.comment.toLowerCase().includes(search.toLowerCase());
    const matchesDate = selectedDate ? f.date === selectedDate : true;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-64 min-h-screen sticky top-0 z-10">
        <TaskbarManager />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Phản hồi khách hàng</h1>
                <p className="text-sm text-gray-500">Xem và quản lý các phản hồi, đánh giá của khách hàng</p>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  placeholder="Tìm theo tên, nội dung..."
                />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  placeholder="Lọc theo ngày"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách phản hồi</h2>
              <p className="text-sm text-gray-600 mt-1">Tổng hợp các phản hồi, đánh giá của khách hàng trong hệ thống</p>
            </div>
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg font-medium text-gray-900">Không có phản hồi nào</p>
                <p className="text-gray-500">Không tìm thấy phản hồi phù hợp với bộ lọc</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFeedback.map(f => (
                      <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{f.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{f.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                            {f.rating} / 5
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{f.comment}</td>
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
