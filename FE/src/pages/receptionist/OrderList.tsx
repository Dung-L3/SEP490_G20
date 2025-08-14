// src/pages/OrderManager.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TaskbarReceptionist from '../../components/TaskbarReceptionist';

interface Order {
  orderId: number;
  orderType: string;
  customerName: string;
  tableName: string;
  subTotal: number;
  discountAmount: number;
  finalTotal: number;
  createdAt: string;
}

interface TakeawayOrderResponse {
  orderId: number;
  customerName: string;
  phone: string;
  notes?: string;
  subTotal: number;
  finalTotal: number;
}
type NavState = { newOrder?: TakeawayOrderResponse };

const formatVnd = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

const dedupeById = (arr: Order[]) => {
  const seen = new Set<number>();
  const out: Order[] = [];
  for (const o of arr) {
    if (!seen.has(o.orderId)) {
      seen.add(o.orderId);
      out.push(o);
    }
  }
  return out;
};

const mapTakeawayToOrder = (t: TakeawayOrderResponse) => ({
  orderId: t.orderId,
  orderType: 'TAKEAWAY',
  customerName: t.customerName,
  tableName: 'Mang đi',
  subTotal: t.subTotal,
  discountAmount: 0,
  finalTotal: t.finalTotal,
  createdAt: new Date().toISOString(),
});

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalPaymentMethod, setModalPaymentMethod] = useState<'cash' | 'card' | 'bankTransfer'>('cash');
  const navigate = useNavigate();
  const location = useLocation();


  // Load dữ liệu từ API
  useEffect(() => {
    fetch('/api/receptionist/orders/unpaid', {
      credentials: 'include',
    })
      .then(res =>
        res.ok
          ? res.json()
          : Promise.reject('Không tải được danh sách đơn')
      )
      .then((data: Order[]) => setOrders(data))
      .catch(err => {
        console.error(err);
        setOrders([]);
      });
  }, []);

  useEffect(() => {
  let cancelled = false;

  const navState = (location.state || {}) as NavState;
  const newMapped = navState.newOrder ? mapTakeawayToOrder(navState.newOrder) : undefined;

  const run = async () => {
    try {
      const res = await fetch('/api/receptionist/orders/unpaid', { credentials: 'include' });
      if (!res.ok) throw new Error('no unpaid api');
      const data: Order[] = await res.json();
      if (cancelled) return;
      setOrders(prev => {
        const merged = [...(newMapped ? [newMapped] : []), ...data];
        const seen = new Set<number>();
        return merged.filter(o => (seen.has(o.orderId) ? false : (seen.add(o.orderId), true)));
      });
    } catch {
      if (cancelled) return;
      if (newMapped) {
        setOrders(prev => {
          const seen = new Set<number>();
          return [newMapped, ...prev].filter(o => (seen.has(o.orderId) ? false : (seen.add(o.orderId), true)));
        });
      }
    } finally {
      if (navState.newOrder) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  };

  run();
  return () => { cancelled = true; };
}, [location.state, navigate, location.pathname]);


  // Filter theo search (Mã đơn, tên KH, tên bàn)
  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.orderId.toString().includes(q) ||
      o.tableName.toLowerCase().includes(q)
    );
  });

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setModalPaymentMethod('cash'); // reset mặc định
    setModalOpen(true);
  };

  const handleProceed = () => {
    if (!selectedOrder) return;
    setModalOpen(false);
    navigate(
      `/receptionist/${selectedOrder.orderId}/payment`,
      { state: { paymentMethod: modalPaymentMethod } }
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 min-h-screen sticky top-0 z-10">
        <TaskbarReceptionist />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 p-8">
        {/* Header + Search */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý đơn hàng
            </h1>
            <p className="text-gray-600">
              Theo dõi, tìm kiếm và quản lý các đơn hàng chưa thanh toán
            </p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Tìm theo tên khách, số bàn, mã đơn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Mã đơn
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Bàn
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map(order => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(order)}
                  >
                    <td className="px-6 py-4 font-semibold text-blue-700">
                      #{order.orderId}
                    </td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4">{order.tableName}</td>
                    <td className="px-6 py-4 font-semibold text-green-700">
                      {order.finalTotal.toLocaleString()}₫
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Không tìm thấy đơn hàng nào</p>
            <p className="text-sm">Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Payment Method Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-4">
              Chọn phương thức thanh toán
            </h3>
            <select
              value={modalPaymentMethod}
              onChange={e =>
                setModalPaymentMethod(e.target.value as 'cash' | 'card' | 'bankTransfer')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6"
            >
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
              <option value="bankTransfer">Chuyển khoản ngân hàng</option>
            </select>
            <div className="flex justify-end gap-2">
              <button                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Huỷ
              </button>
              <button
                onClick={handleProceed}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
