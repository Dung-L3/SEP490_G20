import { useState, useEffect } from 'react';
import TaskbarManager from '../../components/TaskbarManager';
import { 
  getAllPurchaseHistory, 
  getPurchaseHistoryByPhone, 
  getCustomerStatistics,
  type PurchaseHistoryDto,
  type PurchaseHistoryResponse 
} from '../../api/purchaseHistoryApi';

const PurchaseHistoryManager = () => {
  const [purchases, setPurchases] = useState<PurchaseHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneSearch, setPhoneSearch] = useState<string>('');
  const [customerStats, setCustomerStats] = useState<PurchaseHistoryResponse | null>(null);
  
  // Load all purchase history initially
  const loadAllPurchases = async () => {
    try {
      setLoading(true);
      const data = await getAllPurchaseHistory();
      setPurchases(data);
      setCustomerStats(null); // Reset customer stats when loading all
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu lịch sử giao dịch');
      console.error('Error loading purchase history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllPurchases();
  }, []);

  // Search by phone number
  const handlePhoneSearch = async () => {
    if (!phoneSearch.trim()) {
      loadAllPurchases();
      return;
    }

    try {
      setLoading(true);
      const [historyData, statsData] = await Promise.all([
        getPurchaseHistoryByPhone(phoneSearch),
        getCustomerStatistics(phoneSearch)
      ]);
      setPurchases(historyData);
      setCustomerStats(statsData);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu khách hàng');
      console.error('Error loading customer data:', err);
      setPurchases([]);
      setCustomerStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div style={{ display: 'flex' }}>
      <TaskbarManager />
      <div style={{ marginLeft: '220px', padding: '24px', width: '100%' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Lịch sử giao dịch</h2>
        </div>

        {/* Tìm kiếm theo số điện thoại */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại khách hàng
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-md border-gray-300 shadow-sm"
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                />
                <button
                  onClick={handlePhoneSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>

          {/* Hiển thị thống kê khách hàng nếu có */}
          {customerStats && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Số lần ghé quán</p>
                <p className="text-xl font-semibold">{customerStats.totalVisits}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Tổng chi tiêu</p>
                <p className="text-xl font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(customerStats.totalSpent)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Trung bình/lần</p>
                <p className="text-xl font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(customerStats.averageSpent)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bảng lịch sử giao dịch */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảm giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <tr key={purchase.orderId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{purchase.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.customerName || 'Khách vãng lai'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.orderType === 'DINEIN' ? 'Tại quán' : 'Mang đi'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(purchase.orderDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(purchase.subTotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(purchase.discountAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.isRefunded ? 'Đã hoàn tiền' : 'Thành công'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="text-red-500 mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistoryManager;
