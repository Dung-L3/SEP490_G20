// src/pages/Chef.tsx
import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, Utensils, AlertCircle } from 'lucide-react';
import type { KitchenOrderItem, OrderStatus } from '../../api/chefApi';
import { fetchPendingOrders, statusList, updateOrderStatus, cancelOrder } from '../../api/chefApi';

interface OrderCardProps {
  orderIdx: number;
  order: KitchenOrderItem;
  currentTime: Date;
}

const Chef = () => {
  const [pendingOrders, setPendingOrders] = useState<KitchenOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

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
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex items-center justify-between">
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
            <div className="text-right">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {currentTime.toLocaleTimeString('vi-VN')}
                </span>
              </div>
              <div className="text-sm text-slate-500">
                {totalOrders} đơn hàng đang chờ
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSection />
        ) : errorMessage ? (
          <ErrorSection message={errorMessage} />
        ) : totalOrders === 0 ? (
          <EmptySection />
        ) : (
          <div className="space-y-8">
            <OrderSection 
              title="Đơn chờ xử lý" 
              orders={pendingOrders.filter(order => {
                const status = order.status.toLowerCase();
                return status === 'pending' || status === 'processing';
              })} 
              currentTime={currentTime} 
            />
            {/* Hiển thị đơn hủy */}
            <OrderSection 
              title="Đơn đã hủy" 
              orders={pendingOrders.filter(order => {
                const status = order.status.toLowerCase();
                if (status !== 'cancelled') return false;
                
                // Kiểm tra thời gian chờ
                const orderTime = new Date(order.orderTime);
                const waitingMinutes = Math.floor((currentTime.getTime() - orderTime.getTime()) / (1000 * 60));
                return waitingMinutes < 30;
              })} 
              currentTime={currentTime} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingSection = () => (
  <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
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

const OrderSection = ({ title, orders, currentTime }: { title: string; orders: KitchenOrderItem[]; currentTime: Date }) => (
  <div className={`${title.includes('hủy') ? 'mt-8 pt-8 border-t-2 border-red-100' : ''}`}>
    <h2 className={`text-xl font-semibold mb-4 ${title.includes('hủy') ? 'text-red-800' : 'text-slate-800'}`}>
      {title} ({orders.length})
    </h2>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order, idx) => (
        <OrderCard 
          key={order.orderDetailId} 
          orderIdx={idx} 
          order={order} 
          currentTime={currentTime} 

        />
      ))}
    </div>
  </div>
);

const OrderCard = ({ orderIdx, order, currentTime }: OrderCardProps) => {
  const [status, setStatus] = useState(order.status.toLowerCase());
  const [updating, setUpdating] = useState(false);

  const currentStatus = statusList.find(s => s.value === status);
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
        // Force refresh the orders list
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

  // Đã bỏ phần ẩn để cho phép hiển thị đơn hủy

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden ${currentStatus?.bgColor}`}>
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
          onChange={e => handleStatusChange(e.target.value)}
        >
          {statusList
            .filter(s => {
              // Chỉ hiện option hủy khi đơn đang pending hoặc processing
              const canCancel = ['pending', 'processing'].includes(status);
              if (status === 'pending') {
                return ['pending', 'processing'].concat(canCancel ? ['cancelled'] : []).includes(s.value);
              }
              if (status === 'processing') {
                return ['processing', 'completed'].concat(canCancel ? ['cancelled'] : []).includes(s.value);
              }
              return false;
            })
            .map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
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
