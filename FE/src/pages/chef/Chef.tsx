import React, { useState } from 'react';
import { Clock, ChefHat, CheckCircle, AlertCircle, Utensils } from 'lucide-react';

// Mock data for demonstration
const mockTableCarts = {
  "Bàn 1": [
    { name: "Phở bò", quantity: 2, price: 75000 },
    { name: "Bún bò Huế", quantity: 1, price: 65000 },
    { name: "Trà đá", quantity: 2, price: 10000 }
  ],
  "Bàn 3": [
    { name: "Cơm tấm", quantity: 1, price: 45000 },
    { name: "Bánh mì", quantity: 2, price: 25000 }
  ],
  "Bàn 5": [
    { name: "Bún riêu", quantity: 1, price: 55000 },
    { name: "Chả cá", quantity: 1, price: 85000 },
    { name: "Nem nướng", quantity: 3, price: 35000 }
  ]
};

const statusList = [
  { 
    value: 'pending', 
    label: 'Chờ chế biến', 
    color: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-amber-200',
    icon: AlertCircle,
    bgColor: 'bg-amber-50'
  },
  { 
    value: 'cooking', 
    label: 'Đang chế biến', 
    color: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-200',
    icon: ChefHat,
    bgColor: 'bg-blue-50'
  },
  { 
    value: 'done', 
    label: 'Hoàn thành', 
    color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200',
    icon: CheckCircle,
    bgColor: 'bg-green-50'
  },
];

const Chef = () => {
  const tableCarts = mockTableCarts; // Replace with actual useTableCart hook

  const totalOrders = Object.entries(tableCarts).filter(([, items]) => items.length > 0).length;
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      {/* Header */}
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

        {/* Orders Grid */}
        {totalOrders === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-slate-500">Các đơn hàng mới sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(tableCarts)
              .filter(([, items]) => items.length > 0)
              .map(([tableName, items], orderIdx) => (
                <OrderCard key={tableName} orderIdx={orderIdx} tableName={tableName} items={items} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

function OrderCard({ orderIdx, tableName, items }) {
  const [status, setStatus] = useState('pending');
  const [startTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStatus = statusList.find(s => s.value === status);
  const StatusIcon = currentStatus?.icon;
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const elapsedTime = Math.floor((currentTime - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden ${currentStatus?.bgColor}`}>
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">#{orderIdx + 1}</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{tableName}</h3>
              <p className="text-slate-300 text-xs">{items.length} món</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-sm font-medium">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-slate-300 text-xs">Thời gian</div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${currentStatus?.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{currentStatus?.label}</span>
          </div>
        </div>
        <select
          className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {statusList.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Items List */}
      <div className="p-4">
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{item.quantity}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{item.name}</h4>
                  <p className="text-slate-500 text-xs">{item.price.toLocaleString()}đ x {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">
                  {(item.price * item.quantity).toLocaleString()}đ
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Tổng cộng:</span>
            <span className="font-bold text-xl text-slate-800">{totalAmount.toLocaleString()}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chef;