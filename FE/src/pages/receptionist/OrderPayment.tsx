// src/pages/OrderPayment.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

interface OrderDetailDTO {
  orderDetailId: number;
  dishName: string;
  quantity: number;
}

interface OrderSummary {
  discountAmount: number;
  finalTotal: number;
}

interface LocationState {
  paymentMethod?: 'cash' | 'card' | 'bankTransfer';
}

export default function OrderPayment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const [details, setDetails] = useState<OrderDetailDTO[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phương thức thanh toán cố định, lấy từ bước trước
  const paymentMethod: 'cash' | 'card' | 'bankTransfer' = state.paymentMethod ?? 'cash';

  useEffect(() => {
    setLoading(true);
    const detailsFetch = fetch(
      `/api/orders/${orderId}/details`,
      { credentials: 'include' }
    ).then(res => res.ok ? res.json() : Promise.reject('Không lấy được chi tiết đơn'));

    const summaryFetch = fetch(
      `/api/receptionist/orders/${orderId}`,
      { credentials: 'include' }
    ).then(res => res.ok ? res.json() : Promise.reject('Không lấy được thông tin đơn'));

    Promise.all([detailsFetch, summaryFetch])
      .then(([dt, sm]: [OrderDetailDTO[], OrderSummary]) => {
        setDetails(dt);
        setSummary(sm);
      })
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  }, [orderId]);

const handleConfirm = () => {
  if (confirming) return;
  setConfirming(true);

  fetch(
    `/api/waiter/orders/${orderId}/payment`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod })
    }
  )
    .then(res => {
      if (!res.ok) throw new Error('Xác nhận thất bại');
      // 1. Mở tab mới tải/in PDF
      const pdfUrl = `/api/receptionist/${orderId}/invoice.pdf`;
      window.open(pdfUrl, '_blank');
      return res.json();
    })
    .then(() => {
      setConfirming(false);
      navigate('/receptionist/reservations');
    })
    .catch(err => {
      setError(String(err));
      setConfirming(false);
    });
};


  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      {/* Bên trái: Chi tiết món */}
      <div className="md:w-1/2 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Thanh toán đơn #{orderId}</h2>
        <table className="min-w-full bg-white border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Tên món</th>
              <th className="px-4 py-2 text-left">Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {details.map(d => (
              <tr key={d.orderDetailId} className="border-t">
                <td className="px-4 py-2">{d.dishName}</td>
                <td className="px-4 py-2">{d.quantity}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t">
              <td className="px-4 py-2 font-medium">Chiết khấu</td>
              <td className="px-4 py-2 text-red-600">
                -{summary?.discountAmount.toLocaleString()}₫
              </td>
            </tr>
            <tr className="border-t font-bold">
              <td className="px-4 py-2">Tổng cộng</td>
              <td className="px-4 py-2 text-green-700">
                {summary?.finalTotal.toLocaleString()}₫
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bên phải: QR + thông tin phương thức + nút xác nhận */}
      <div className="md:w-1/2 bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4">Thông tin thanh toán</h2>
        <p className="mb-4">
          <span className="font-medium">Phương thức:</span> {paymentMethod}
        </p>
        <img
          src={`https://img.vietqr.io/image/MB-0372698544-compact2.png?amount=${summary?.finalTotal}&addInfo=Order${orderId}&accountName=TRAN%20NAM%20THANH`}
          alt="QR Thanh toán"
          className="w-48 h-48 object-contain mb-6"
        />
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className={`w-full px-4 py-2 text-white rounded ${
            confirming
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {confirming ? 'Đang xác nhận...' : 'Xác nhận đã thanh toán'}
        </button>
      </div>
    </div>
  );
}
