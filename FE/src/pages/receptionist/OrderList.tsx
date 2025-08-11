/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/OrderManager.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskbarReceptionist from '../../components/TaskbarReceptionist';

interface Order {
  orderId: number;
  orderType: string;
  customerName?: string | null; // <= có thể null
  tableName?: string | null;    // <= có thể null
  subTotal: number;
  discountAmount: number;
  finalTotal: number;
  createdAt: string;
}

interface Promotion {
  promoId: number;
  promoCode: string;
  promoName: string;
  discountPercent: number | null;
  discountAmount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  isActive: boolean;
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // NEW: promo state
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [promosError, setPromosError] = useState<string | null>(null);
  const [selectedPromoCode, setSelectedPromoCode] = useState<string>('');
  // NEW: error state thật (thay cho hàm setError ở cuối file)
  const [error, setError] = useState<string | null>(null);

  const [modalPaymentMethod, setModalPaymentMethod] =
    useState<'cash' | 'card' | 'bankTransfer'>('cash');

  const navigate = useNavigate();

  // Load danh sách đơn chưa thanh toán
  useEffect(() => {
    fetch('/api/receptionist/orders/unpaid', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : Promise.reject('Không tải được danh sách đơn')))
      .then((data: Order[]) => setOrders(data))
      .catch(err => {
        console.error(err);
        setOrders([]);
      });
  }, []);

  const safeLower = (v?: string | null) => (v ?? '').toLowerCase();

  // Filter theo search (Mã đơn, tên KH, tên bàn) — an toàn null
  const filteredOrders = orders.filter(o => {
    const q = (search ?? '').toLowerCase().trim();
    return (
      safeLower(o.customerName).includes(q) ||
      o.orderId.toString().includes(q) ||
      safeLower(o.tableName).includes(q)
    );
  });

  // NEW: mở modal + load promotions hợp lệ
  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setModalPaymentMethod('cash'); // reset mặc định
    setSelectedPromoCode('');      // mặc định không áp mã
    setPromosError(null);
    setError(null);
    setModalOpen(true);

    setPromosLoading(true);
    fetch('/api/promotions/validPromotions', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : Promise.reject('Không tải được danh sách mã khuyến mãi')))
      .then((list: Promotion[]) => {
        setPromotions(list ?? []);
      })
      .catch((err: unknown) => {
        console.error(err);
        setPromotions([]);
        setPromosError(typeof err === 'string' ? err : 'Không tải được danh sách mã');
      })
      .finally(() => setPromosLoading(false));
  };

  // NEW: Tiếp tục = apply mã (nếu chọn) rồi giữ flow cũ (đi tới màn payment)
  const handleProceed = async () => {
    if (!selectedOrder) return;

    if (selectedPromoCode) {
      try {
        const res = await fetch('/api/promotions/applyPromo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderId: selectedOrder.orderId,
            promoCode: selectedPromoCode,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Apply promo thất bại (${res.status})`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg); // chỉ hiển thị lỗi, KHÔNG ném lỗi => không trắng màn
        return;
      }
    }

    setModalOpen(false);
    navigate(`/receptionist/${selectedOrder.orderId}/payment`, {
      state: { paymentMethod: modalPaymentMethod },
    });
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã đơn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bàn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map(order => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(order)}
                  >
                    <td className="px-6 py-4 font-semibold text-blue-700">#{order.orderId}</td>
                    <td className="px-6 py-4">{order.customerName ?? '—'}</td>
                    <td className="px-6 py-4">{order.tableName ?? (order.orderType === 'TAKEAWAY' ? 'Mang về' : '—')}</td>
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

      {/* Payment + Promotion Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              Thanh toán cho đơn #{selectedOrder.orderId}
            </h3>

            {/* show error nếu có */}
            {error && (
              <div className="mb-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Payment method */}
            <label className="block text-sm mb-1">Phương thức thanh toán</label>
            <select
              value={modalPaymentMethod}
              onChange={e =>
                setModalPaymentMethod(e.target.value as 'cash' | 'card' | 'bankTransfer')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bankTransfer">Bank Transfer</option>
            </select>

            {/* Promotion list */}
            <label className="block text-sm mb-1">Mã khuyến mãi (đang hiệu lực)</label>
            <select
              value={selectedPromoCode}
              onChange={e => setSelectedPromoCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
              disabled={promosLoading}
            >
              <option value="">-- Không áp dụng --</option>
              {promotions.map(p => (
                <option key={p.promoId} value={p.promoCode}>
                  {p.promoCode} — {p.promoName} ({p.discountPercent ?? 0}% | {(p.discountAmount ?? 0).toLocaleString()}đ)
                </option>
              ))}
            </select>
            {promosLoading && <div className="text-sm text-gray-500 mb-2">Đang tải danh sách mã…</div>}
            {promosError && <div className="text-sm text-red-600 mb-2">{promosError}</div>}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg">
                Huỷ
              </button>
              <button
                onClick={handleProceed}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={promosLoading}
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
