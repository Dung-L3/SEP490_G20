/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/ReservationManager.tsx
import React, { useEffect, useState, useCallback } from 'react';
import TaskbarReceptionist from '../../components/TaskbarReceptionist';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Cancelled'];

// ---- Types ----
interface Reservation {
  reservationId: number;
  customerName: string;
  phone: string;
  email: string;
  reservationAt: string;
  notes?: string;
  statusId: number;
  statusName: string;
}

interface Area {
  areaId: number;
  areaName: string;
}

interface RestaurantTable {
  tableId: number;
  tableName: string;
}

// ---- API base ----
const RESERVATIONS_API = '/api/v1/reservations';
const TABLES_API = '/api/v1/tables';

const ReservationList: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('Pending');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Area + tables by area
  const [areas, setAreas] = useState<Area[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<number | ''>('');
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | ''>('');

  // NEW: trạng thái khi đang huỷ
  const [cancelling, setCancelling] = useState(false);

  // -------- Fetch reservations theo status --------
  const fetchReservations = useCallback(() => {
    setLoading(true);
    const cacheBuster = Math.random().toString(36).substring(2, 10);
    fetch(`${RESERVATIONS_API}/status/${encodeURIComponent(filterStatus)}?status=${cacheBuster}`, {
      credentials: 'include',
    })
      .then(res => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data: Reservation[]) => setReservations(data))
      .catch(err => {
        console.error('Fetch reservations error:', err);
        setReservations([]);
      })
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  // -------- Helpers --------
  const statusClass = (s: string) =>
    'font-semibold ' +
    (s === 'Pending' ? 'text-red-600' : s === 'Confirmed' ? 'text-green-600' : 'text-gray-500');

  // -------- Open modal: load areas --------
  const openConfirmModal = (r: Reservation) => {
    setSelectedReservation(r);
    setSelectedAreaId('');
    setAvailableTables([]);
    setSelectedTableId('');
    setCancelling(false); // NEW: reset
    setModalOpen(true);

    setAreasLoading(true);
    fetch(`${TABLES_API}/getAllAreas`, { credentials: 'include' })
      .then(res => (res.ok ? res.json() : Promise.reject('Không tải được danh sách khu vực')))
      .then((data: Area[]) => setAreas(data || []))
      .catch(err => {
        console.error(err);
        setAreas([]);
      })
      .finally(() => setAreasLoading(false));
  };

  // -------- Khi chọn Area -> load bàn trống theo area --------
  const loadTablesByArea = (areaId: number | '') => {
    setSelectedAreaId(areaId);
    setAvailableTables([]);
    setSelectedTableId('');
    if (!areaId) return;

    setTablesLoading(true);
    fetch(`${TABLES_API}/getTablesAvailableByArea/${areaId}`, { credentials: 'include' })
      .then(res => (res.ok ? res.json() : Promise.reject('Không tải được bàn trống')))
      .then((tables: RestaurantTable[]) => setAvailableTables(tables || []))
      .catch(err => {
        console.error(err);
        setAvailableTables([]);
      })
      .finally(() => setTablesLoading(false));
  };

  // -------- Xác nhận: PATCH confirm (reservationId + tableId) --------
  const handleConfirm = () => {
    if (!selectedReservation) return;
    if (!selectedTableId) {
      alert('Vui lòng chọn bàn cho khách');
      return;
    }

    fetch(`${RESERVATIONS_API}/${selectedReservation.reservationId}/confirm?tableId=${selectedTableId}`, {
      method: 'PATCH',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(() => {
        setModalOpen(false);
        fetchReservations();
      })
      .catch(err => {
        console.error('Confirm error:', err);
        alert('Xác nhận thất bại, vui lòng thử lại');
      });
  };

  // NEW: Hủy đặt bàn (chỉ khi Pending)
  const handleCancelReservation = () => {
    if (!selectedReservation) return;
    if (selectedReservation.statusName !== 'Pending') {
      // phòng hờ trường hợp UI hiển thị nhưng state đã đổi
      alert('Chỉ có thể hủy khi đơn đang Pending.');
      return;
    }

    setCancelling(true);
    fetch(`${RESERVATIONS_API}/${selectedReservation.reservationId}/status?status=Cancelled`, {
      method: 'PATCH',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(() => {
        setModalOpen(false);
        fetchReservations();
      })
      .catch(err => {
        console.error('Cancel reservation error:', err);
        alert('Hủy đặt bàn thất bại, vui lòng thử lại');
      })
      .finally(() => setCancelling(false));
  };

  const canCancel = selectedReservation?.statusName === 'Pending'; // NEW

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 min-h-screen sticky top-0 z-10">
        <TaskbarReceptionist />
      </div>

      {/* Main */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quản lý đặt bàn</h1>

        {/* Filter */}
        <div className="mb-6">
          <label className="mr-2 font-medium">Lọc theo trạng thái:</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <p>Đang tải...</p>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Không có kết quả cho “{filterStatus}”</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã đặt bàn</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SDT</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày đặt</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ghi chú</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reservations.map((r, xid) => (
                    <tr
                      key={r.reservationId}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openConfirmModal(r)} // mở modal khi bấm vào hàng
                    >
                      <td className="px-6 py-4 font-semibold text-blue-700">{xid + 1}</td>
                      <td className="px-6 py-4">{r.customerName}</td>
                      <td className="px-6 py-4">{r.phone}</td>
                      <td className="px-6 py-4">{r.email}</td>
                      <td className="px-6 py-4">{new Date(r.reservationAt).toLocaleString()}</td>
                      <td className="px-6 py-4">{r.notes || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={statusClass(r.statusName)}>{r.statusName}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: chọn Area -> bàn trống -> xác nhận */}
      {modalOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[480px]">
            <h3 className="text-lg font-semibold mb-4">
              Chọn bàn cho đặt bàn #{selectedReservation.reservationId}
            </h3>

            {/* Area */}
            <label className="block text-sm mb-1">Khu vực</label>
            <select
              value={selectedAreaId}
              onChange={e => loadTablesByArea(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border rounded mb-3"
              disabled={areasLoading}
            >
              <option value="">-- Chọn khu vực --</option>
              {areas.map(a => (
                <option key={a.areaId} value={a.areaId}>{a.areaName}</option>
              ))}
            </select>
            {areasLoading && <div className="text-sm text-gray-500 mb-2">Đang tải khu vực…</div>}

            {/* Tables by area */}
            <label className="block text-sm mb-1">Chọn bàn</label>
            <select
              value={selectedTableId}
              onChange={e => setSelectedTableId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border rounded mb-4"
              disabled={!selectedAreaId || tablesLoading}
            >
              <option value="">-- Chọn bàn --</option>
              {availableTables.map(tb => (
                <option key={tb.tableId} value={tb.tableId}>{tb.tableName}</option>
              ))}
            </select>
            {tablesLoading && <div className="text-sm text-gray-500 mb-2">Đang tải bàn trống…</div>}
            {!tablesLoading && selectedAreaId && availableTables.length === 0 && (
              <div className="text-sm text-gray-500 mb-2">Không có bàn trống trong khu vực này.</div>
            )}

            <div className="mt-2 flex justify-end gap-2">
              {/* Nút đóng modal */}
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">
                Huỷ
              </button>

              {/* NEW: Hủy đặt bàn (chỉ hiện khi Pending) */}
              {canCancel && (
                <button
                    onClick={handleCancelReservation}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    disabled={cancelling}
                >
                  {cancelling ? 'Đang hủy...' : 'Hủy đặt bàn'}
                </button>
              )}

              {/* Xác nhận / đổi bàn */}
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!selectedTableId}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationList;
