import { useState, useEffect } from 'react';
import TaskbarManager from '../../components/TaskbarManager';
import { 
  getAllPurchaseHistory, 
  getPurchaseHistoryByPhone, 
  getHistoryWithoutPhone,
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
  const [showNoPhoneOnly, setShowNoPhoneOnly] = useState<boolean>(false);
  
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

    // Validate phone number format
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(phoneSearch.trim())) {
      setError('Số điện thoại không hợp lệ');
      setPurchases([]);
      setCustomerStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const formattedPhone = phoneSearch.trim().replace(/^\+84/, '0');
      let historyData, statsData;
      
      try {
        [historyData, statsData] = await Promise.all([
          getPurchaseHistoryByPhone(formattedPhone),
          getCustomerStatistics(formattedPhone)
        ]);
      } catch (apiError) {
        if (apiError instanceof Error) {
          if (apiError.message === 'Customer not found') {
            setError('Không tìm thấy khách hàng với số điện thoại này');
          } else {
            setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau');
          }
        }
        throw apiError;
      }

      if (!historyData || historyData.length === 0) {
        setError('Không tìm thấy lịch sử giao dịch cho số điện thoại này');
        setPurchases([]);
      } else {
        setPurchases(historyData);
      }
      
      setCustomerStats(statsData);
      
    } catch (err) {
      console.error('Error loading customer data:', err);
      setPurchases([]);
      setCustomerStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <TaskbarManager />
      <div style={{ marginLeft: '220px', padding: '24px', width: '100%' }}>
        {loading && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <div className="text-gray-700">Đang tải...</div>
            </div>
          </div>
        )}
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
              <div className="flex items-center gap-4">
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    className={`flex-1 rounded-md shadow-sm ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={phoneSearch}
                    onChange={(e) => {
                      setPhoneSearch(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Nhập số điện thoại..."
                    disabled={showNoPhoneOnly}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="noPhoneCheckbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={showNoPhoneOnly}
                    onChange={async (e) => {
                      setShowNoPhoneOnly(e.target.checked);
                      setPhoneSearch('');
                      if (e.target.checked) {
                        try {
                          setLoading(true);
                          setError(null);
                          const historyData = await getHistoryWithoutPhone();
                          if (historyData.length === 0) {
                            setError('Không có đơn hàng nào không có số điện thoại');
                          }
                          setPurchases(historyData);
                          setCustomerStats(null);
                        } catch (err) {
                          console.error('Error fetching no-phone orders:', err);
                          setError('Không thể tải dữ liệu đơn hàng không có số điện thoại');
                          setPurchases([]);
                          setCustomerStats(null);
                        } finally {
                          setLoading(false);
                        }
                      } else {
                        loadAllPurchases();
                      }
                    }}
                  />
                  <label htmlFor="noPhoneCheckbox" className="text-sm text-gray-600">
                    Chỉ hiện đơn không có SĐT
                  </label>
                </div>
                <button
                  onClick={handlePhoneSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
              </div>
              {error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {error}
                </div>
              )}
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
              {purchases.map((purchase, index) => (
                <tr key={`${purchase.orderId}-${purchase.orderDate}-${index}`}>
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

      </div>
    </div>
  );
};

export default PurchaseHistoryManager;
