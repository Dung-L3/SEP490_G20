/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/OrderManager.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskbarReceptionist from '../../components/TaskbarReceptionist';

interface Order {
  orderId: number;
  orderType: string;
  customerName?: string | null; 
  tableName?: string | null;    
  subTotal: number;
  discountAmount: number;
  finalTotal: number;
  createdAt: string;
  phone?: string | null;        
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

  // Promotions
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [promosError, setPromosError] = useState<string | null>(null);
  const [selectedPromoCode, setSelectedPromoCode] = useState<string>('');

  // Error hiển thị trong modal (server-side/general)
  const [error, setError] = useState<string | null>(null);

  // THÊM: state số điện thoại nhập trong modal
  const [phone, setPhone] = useState<string>('');

  const [modalPaymentMethod, setModalPaymentMethod] =
    useState<'cash' | 'card' | 'bankTransfer'>('cash');

  const navigate = useNavigate();

  // NEW: regex & helpers cho phone
  const PHONE_RE = /^0\d{9}$/; // 10 số, bắt đầu bằng 0
  const sanitizePhone = (v: string) => v.replace(/\D/g, '').slice(0, 10); // chỉ số, tối đa 10
  const phoneValid = phone === '' || PHONE_RE.test(phone); // cho phép trống; nếu có thì phải hợp lệ
  const phoneInvalidMsg =
    phone && !phoneValid ? 'Số điện thoại không hợp lệ. Yêu cầu 10 số và bắt đầu bằng 0.' : '';

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

  // Mở modal + load promotions hợp lệ
  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setModalPaymentMethod('cash'); 
    setSelectedPromoCode('');      
    setPromosError(null);
    setError(null);
    setPhone(order.phone ? sanitizePhone(order.phone) : '');   // NEW: sanitize khi mở
    setModalOpen(true);

    setPromosLoading(true);
    fetch('/api/promotions/validPromotions', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : Promise.reject('Không tải được danh sách mã khuyến mãi')))
      .then((list: Promotion[]) => setPromotions(list ?? []))
      .catch((err: unknown) => {
        console.error(err);
        setPromotions([]);
        setPromosError(typeof err === 'string' ? err : 'Không tải được danh sách mã');
      })
      .finally(() => setPromosLoading(false));
  };

  // Tiếp tục = PATCH phone (nếu có thay đổi) → apply promo (nếu chọn) → điều hướng payment
  const handleProceed = async () => {
    if (!selectedOrder) return;
    setError(null);

    // NEW: kiểm tra hợp lệ lần cuối trước khi gọi API
    if (!phoneValid) {
      setError('Số điện thoại không hợp lệ. Yêu cầu 10 số và bắt đầu bằng 0.');
      return;
    }

    const trimmedPhone = sanitizePhone(phone.trim()); // NEW: sanitize cấp cuối
    const prevPhone = sanitizePhone((selectedOrder.phone ?? '').trim());

    // 1) Cập nhật phone nếu có nhập và khác trước đó
    if (trimmedPhone && trimmedPhone !== prevPhone) {
      try {
        const res = await fetch(`/api/receptionist/orders/${selectedOrder.orderId}/phone`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone: trimmedPhone }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Cập nhật số điện thoại thất bại (${res.status})`);
        }
        // cập nhật local state
        setSelectedOrder({ ...selectedOrder, phone: trimmedPhone });
        setOrders(prev =>
          prev.map(o => (o.orderId === selectedOrder.orderId ? { ...o, phone: trimmedPhone } : o))
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        return; // dừng flow nếu patch fail
      }
    }

    // 2) Áp mã nếu có
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
        setError(msg);
        return;
      }
    }

    // 3) Điều hướng sang màn thanh toán
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
                    <td className="px-6 py-4">
                      {order.tableName ?? (order.orderType === 'TAKEAWAY' ? 'Mang về' : '—')}
                    </td>
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

            {/* Error (server/general) */}
            {error && (
              <div className="mb-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Số điện thoại khách */}
            <label className="block text-sm mb-1">Số điện thoại (khách)</label>
            <input
              // NEW: giới hạn và lọc input chỉ còn số, tối đa 10
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(sanitizePhone(e.target.value))}
              onBlur={() => setPhone(prev => sanitizePhone(prev.trim()))}
              placeholder="VD: 0372698544"
              className={`w-full px-3 py-2 border rounded-lg mb-1 ${phone && !phoneValid ? 'border-red-500' : 'border-gray-300'}`}
            />
            {/* NEW: hiển thị lỗi ngay dưới input */}
            {phoneInvalidMsg && (
              <div className="text-xs text-red-600 mb-3">{phoneInvalidMsg}</div>
            )}

            {/* Phương thức thanh toán */}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                // NEW: disable khi phone không hợp lệ hoặc đang loading promos
                disabled={!phoneValid || promosLoading}
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
