// src/pages/ReservationManager.tsx
import React, { useEffect, useState, useCallback } from 'react';
import TaskbarReceptionist from '../../components/TaskbarReceptionist';

// Các trạng thái giống hệt bên backend
const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Cancelled'];

interface Reservation {
  reservationId: number;
  customerName: string;
  phone: string;
  email: string;
  reservationAt: string;
  notes?: string;
  statusId: number;
  statusName: string;
  // ... các field khác như table, createdAt nếu cần
}

const ReservationList: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('Pending');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReservations = useCallback(() => {
    setLoading(true);
    const cacheBuster = Math.random().toString(36).substring(2, 10);
    fetch(
      `/api/v1/reservations/status/${encodeURIComponent(
        filterStatus
      )}?status=${cacheBuster}`,
      { credentials: 'include' }
    )
      .then(res =>
        res.ok ? res.json() : Promise.reject(res.statusText)
      )
      .then((data: Reservation[]) => {
        setReservations(data);
      })
      .catch(err => {
        console.error('Fetch reservations error:', err);
        setReservations([]);
      })
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusChange = (
    reservationId: number,
    newStatus: string
  ) => {
    if (newStatus === 'Confirmed') {
      fetch(
        `/api/v1/reservations/${reservationId}/confirm`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      )
        .then(res => {
          if (!res.ok) throw new Error(`Status ${res.status}`);
          return res.json();
        })
        .then(() => {
          // After confirming, reload the list with current filter
          fetchReservations();
        })
        .catch(err => console.error('Confirm error:', err));
    } else {
      // TODO: implement other transitions if backend hỗ trợ
      console.warn('Chưa hỗ trợ chuyển sang:', newStatus);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 min-h-screen sticky top-0 z-10">
        <TaskbarReceptionist />
      </div>

      {/* Main */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Quản lý đặt bàn
        </h1>

        {/* Filter */}
        <div className="mb-6">
          <label className="mr-2 font-medium">
            Lọc theo trạng thái:
          </label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <p>Đang tải...</p>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">
              Không có kết quả cho “{filterStatus}”
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Mã đặt bàn
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Khách hàng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      SDT
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Ghi chú
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reservations.map(r => (
                    <tr
                      key={r.reservationId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-semibold text-blue-700">
                        #{r.reservationId}
                      </td>
                      <td className="px-6 py-4">
                        {r.customerName}
                      </td>
                      <td className="px-6 py-4">{r.phone}</td>
                      <td className="px-6 py-4">{r.email}</td>
                      <td className="px-6 py-4">
                        {new Date(
                          r.reservationAt
                        ).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {r.notes || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={r.statusName}
                          onChange={e =>
                            handleStatusChange(
                              r.reservationId,
                              e.target.value
                            )
                          }
                          disabled={loading}
                          className="px-2 py-1 border rounded"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationList;
