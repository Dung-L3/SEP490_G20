// src/pages/Chef.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, ChefHat, Utensils, AlertCircle } from 'lucide-react';
import type { KitchenOrderItem } from '../../api/chefApi';
import { fetchPendingOrders, statusList, updateOrderStatus, cancelOrder } from '../../api/chefApi';
import { useLocation } from 'react-router-dom';

interface OrderCardProps {
  orderIdx: number;
  order: KitchenOrderItem;
  currentTime: Date;
  highlight?: boolean;
}

const Chef = () => {
  const [pendingOrders, setPendingOrders] = useState<KitchenOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const location = useLocation();
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'dine_in' | 'takeaway'>('all');

  // Ưu tiên orderType từ BE; fallback "Mang đi" trong tableNumber
  const isTakeaway = (o: KitchenOrderItem) => {
    const t = (o as any).orderType ? String((o as any).orderType).toUpperCase() : '';
    if (t) return t === 'TAKEAWAY';
    const s = (o.tableNumber || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return s.includes('mang di');
  };

  // Lọc theo dropdown
  const filteredByType = useMemo(() => {
    if (typeFilter === 'all') return pendingOrders;
    return pendingOrders.filter(o => (typeFilter === 'takeaway' ? isTakeaway(o) : !isTakeaway(o)));
  }, [pendingOrders, typeFilter]);

  // Chia nhóm cho 2 section
  const pendingList = useMemo(
    () => filteredByType.filter(o => o.status?.toLowerCase() === 'pending'),
    [filteredByType]
  );

  const cancelledRecent = useMemo(() => {
    return filteredByType.filter(o => {
      if (o.status?.toLowerCase() !== 'cancelled') return false;
      const orderTime = new Date(o.orderTime);
      const waitingMinutes = Math.floor((currentTime.getTime() - orderTime.getTime()) / (1000 * 60));
      return waitingMinutes < 30;
    });
  }, [filteredByType, currentTime]);

  const totalShownPending = pendingList.length;

  // Tách loadOrders để gọi lại nhiều nơi
  const loadOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const pending = await fetchPendingOrders();
      setPendingOrders(pending);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setErrorMessage(message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lần đầu + poll 30s
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const pending = await fetchPendingOrders();
        setPendingOrders(pending);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch orders';
        setErrorMessage(message);
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalOrders = pendingOrders.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Bếp Trưởng
                </h1>
                <p className="text-slate-600 text-sm">Quản lý đơn hàng và chế biến món ăn</p>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              {/* Clock + số đơn chờ (đã lọc) */}
              <div className="text-right">
                <div className="flex items-center gap-2 text-slate-600 mb-1 justify-end">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{currentTime.toLocaleTimeString('vi-VN')}</span>
                </div>
                <div className="text-sm text-slate-500">{totalShownPending} đơn hàng đang chờ</div>
              </div>

              {/* DROPDOWN FILTER — đúng vị trí góc phải */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Lọc theo:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="
                    h-10 px-3 rounded-lg border border-slate-300 bg-white
                    text-sm text-slate-700 shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                    transition
                  "
                >
                  <option value="all">Tất cả</option>
                  <option value="dine_in">Ăn tại chỗ</option>
                  <option value="takeaway">Mang đi</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        {loading ? (
          <LoadingSection />
        ) : errorMessage ? (
          <ErrorSection message={errorMessage} />
        ) : pendingList.length === 0 && cancelledRecent.length === 0 ? (
          <EmptySection />
        ) : (
          <div className="space-y-8">
            {/* Đơn chờ xử lý */}
            <OrderSection
              title="Đơn chờ xử lý"
              orders={pendingList}
              currentTime={currentTime}
              highlightId={highlightId}
            />

            {/* Đơn đã hủy (<30 phút) */}
            <OrderSection
              title="Đơn đã hủy"
              orders={cancelledRecent}
              currentTime={currentTime}
              highlightId={highlightId}
              cancelled
            />
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingSection = () => (
  <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
    <p className="mt-4 text-slate-600">Đang tải dữ liệu...</p>
  </div>
);

const ErrorSection = ({ message }: { message: string }) => (
  <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-red-200">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-xl font-semibold text-red-600 mb-2">Có lỗi xảy ra</h3>
    <p className="text-slate-500">{message}</p>
  </div>
);

const EmptySection = () => (
  <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Utensils className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-xl font-semibold text-slate-600 mb-2">Chưa có đơn hàng nào</h3>
    <p className="text-slate-500">Các đơn hàng mới sẽ xuất hiện ở đây</p>
  </div>
);

const OrderSection = ({
  title,
  orders,
  currentTime,
  highlightId,
  cancelled = false,
}: {
  title: string;
  orders: KitchenOrderItem[];
  currentTime: Date;
  highlightId?: number | null;
  cancelled?: boolean;
}) => (
  <div className={cancelled ? 'mt-8 pt-8 border-t-2 border-red-100' : ''}>
    <h2 className={`text-xl font-semibold mb-4 ${cancelled ? 'text-red-800' : 'text-slate-800'}`}>
      {title} ({orders.length})
    </h2>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order, idx) => (
        <OrderCard
          key={order.orderDetailId}
          orderIdx={idx}
          order={order}
          currentTime={currentTime}
          highlight={highlightId != null && order.orderId === highlightId}
        />
      ))}
    </div>
  </div>
);

const OrderCard: React.FC<OrderCardProps> = ({ orderIdx, order, currentTime, highlight = false }) => {
  const [status, setStatus] = useState(order.status.toLowerCase());
  const [updating, setUpdating] = useState(false);

  const currentStatus = statusList.find((s) => s.value === status);
  const StatusIcon = currentStatus?.icon;

  const orderTime = new Date(order.orderTime);
  const elapsedTime = Math.floor((currentTime.getTime() - orderTime.getTime()) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm('Bạn có chắc chắn muốn thay đổi trạng thái?')) return;

    try {
      setUpdating(true);

      if (newStatus === 'cancelled') {
        await cancelOrder(order.orderDetailId);
        // Force reload để cập nhật cả hai section
        window.location.reload();
      } else {
        await updateOrderStatus(order.orderDetailId, newStatus.toUpperCase());
      }

      setStatus(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setUpdating(false);
    }
  };

  const cardHighlight = highlight ? 'ring-4 ring-emerald-400 animate-pulse' : '';

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden ${currentStatus?.bgColor} ${cardHighlight}`}
    >
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">#{orderIdx + 1}</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{order.tableNumber}</h3>
              <p className="text-slate-300 text-xs">Mã đơn: #{order.orderId}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-sm font-medium">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-slate-300 text-xs">Thời gian chờ</div>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${currentStatus?.color}`}>
            {StatusIcon && <StatusIcon className="w-4 h-4" />}
            <span className="text-sm font-semibold">{currentStatus?.label}</span>
          </div>
        </div>
        <select
          disabled={updating}
          className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          {statusList
            .filter((s) => {
              const canCancel = ['pending', 'processing'].includes(status);
              if (status === 'pending') {
                return ['pending', 'processing', ...(canCancel ? ['cancelled'] : [])].includes(s.value);
              }
              if (status === 'processing') {
                return ['processing', ...(canCancel ? ['cancelled'] : [])].includes(s.value);
              }
              return false;
            })
            .map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
        </select>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">{order.quantity}</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{order.dishName}</h4>
                {order.notes && <p className="text-slate-500 text-xs">Ghi chú: {order.notes}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chef;
