import { useState, useEffect } from 'react';
import { purchaseHistoryApi } from '../../api/purchaseHistoryApi';
import TaskbarManager from '../../components/TaskbarManager';

interface PurchaseHistory {
  id: number;
  customerId: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  items: PurchaseItem[];
}

interface PurchaseItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  customerName: string;
  minAmount: string;
  maxAmount: string;
  paymentMethod: string;
  status: string;
}

interface Statistics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

const PurchaseHistoryManager = () => {
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseHistory | null>(null);
  const [stats, setStats] = useState<Statistics>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });
  const [filter, setFilter] = useState<FilterOptions>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    customerName: '',
    minAmount: '',
    maxAmount: '',
    paymentMethod: '',
    status: ''
  });

  // Load purchases and statistics
  const loadPurchases = async () => {
    try {
      setLoading(true);
      // Tải dữ liệu đơn hàng với bộ lọc
      const data = await purchaseHistoryApi.search({
        startDate: filter.dateRange.start,
        endDate: filter.dateRange.end,
        customerName: filter.customerName,
        minAmount: filter.minAmount ? parseInt(filter.minAmount) : undefined,
        maxAmount: filter.maxAmount ? parseInt(filter.maxAmount) : undefined,
        paymentMethod: filter.paymentMethod,
        status: filter.status
      });
      setPurchases(data);

      // Tải thống kê
      const statsData = await purchaseHistoryApi.getStatistics();
      setStats(statsData);
      
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu lịch sử mua hàng');
      console.error('Error loading purchase history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts and when filter changes
  useEffect(() => {
    loadPurchases();
  }, [filter]);

  const handleViewDetails = (purchase: PurchaseHistory) => {
    setSelectedPurchase(purchase);
  };

  const handleUpdateStatus = async (purchaseId: number, newStatus: 'completed' | 'pending' | 'cancelled') => {
    try {
      await purchaseHistoryApi.updateStatus(purchaseId, newStatus);
      loadPurchases(); // Tải lại danh sách sau khi cập nhật
      setError(null);
    } catch (err) {
      setError('Không thể cập nhật trạng thái đơn hàng');
      console.error('Error updating purchase status:', err);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div style={{ display: 'flex' }}>
      <TaskbarManager />
      <div style={{ marginLeft: '220px', padding: '24px', width: '100%' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Lịch sử mua hàng</h2>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filter.dateRange.start}
                onChange={(e) => setFilter({
                  ...filter,
                  dateRange: { ...filter.dateRange, start: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filter.dateRange.end}
                onChange={(e) => setFilter({
                  ...filter,
                  dateRange: { ...filter.dateRange, end: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filter.customerName}
                onChange={(e) => setFilter({ ...filter, customerName: e.target.value })}
                placeholder="Tìm theo tên khách hàng..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền từ</label>
              <input
                type="number"
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filter.minAmount}
                onChange={(e) => setFilter({ ...filter, minAmount: e.target.value })}
                placeholder="Số tiền tối thiểu..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền đến</label>
              <input
                type="number"
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filter.maxAmount}
                onChange={(e) => setFilter({ ...filter, maxAmount: e.target.value })}
                placeholder="Số tiền tối đa..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filter.paymentMethod}
                onChange={(e) => setFilter({ ...filter, paymentMethod: e.target.value })}
              >
                <option value="">Tất cả</option>
                <option value="cash">Tiền mặt</option>
                <option value="card">Thẻ</option>
                <option value="banking">Chuyển khoản</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bảng lịch sử mua hàng */}
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
                  Ngày mua
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{purchase.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.customerName}
                    <div className="text-xs text-gray-400">ID: {purchase.customerId}</div>
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
                    }).format(purchase.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.paymentMethod === 'cash' ? 'Tiền mặt' :
                     purchase.paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={purchase.status}
                      onChange={(e) => handleUpdateStatus(purchase.id, e.target.value as 'completed' | 'pending' | 'cancelled')}
                      className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                        purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                        purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="completed">Hoàn thành</option>
                      <option value="pending">Đang xử lý</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(purchase)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal chi tiết đơn hàng */}
        {selectedPurchase && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Chi tiết đơn hàng #{selectedPurchase.id}</h3>
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Khách hàng</p>
                  <p className="font-medium">{selectedPurchase.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày mua</p>
                  <p className="font-medium">
                    {new Date(selectedPurchase.orderDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <table className="min-w-full divide-y divide-gray-200 mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Món</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Số lượng</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Đơn giá</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedPurchase.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm">{item.name}</td>
                      <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-right">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(item.price)}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right">Tổng cộng:</td>
                    <td className="px-4 py-2 text-sm font-medium text-right">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(selectedPurchase.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="text-right">
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistoryManager;
