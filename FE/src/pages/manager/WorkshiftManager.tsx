import React, { useState, useEffect, type FC } from 'react';
import TaskbarManager from '../../components/TaskbarManager';

// API workshift record
interface WorkshiftRecord {
  id: number;             // shiftId
  userId: number;
  username: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  clockIn: string | null;
  clockOut: string | null;
  isOverNight: boolean | null;
}

// Staff for create/update
interface Staff {
  id: number;
  username: string;
  fullName: string;
}

// Payload for create/update
interface ShiftPayload {
  userId: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  isOverNight: boolean;
}

const WorkshiftManager: FC = () => {
  const [workshifts, setWorkshifts] = useState<WorkshiftRecord[]>([]);
  const [filtered, setFiltered] = useState<WorkshiftRecord[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchUsername, setSearchUsername] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [createShift, setCreateShift] = useState<ShiftPayload>({ userId: 0, shiftDate: '', startTime: '', endTime: '', isOverNight: false });
  const [editShift, setEditShift] = useState<ShiftPayload & { id: number }>({ id: 0, userId: 0, shiftDate: '', startTime: '', endTime: '', isOverNight: false });

  // Load both workshifts and staffs
  const loadAll = async () => {
    setLoading(true);
    try {
      const [wsRes, staffRes] = await Promise.all([
        fetch('/api/reports/shift/attendance/staff', { credentials: 'include' }),
        fetch('/api/users/getAllStaffs', { credentials: 'include' })
      ]);
      if (!wsRes.ok) throw new Error('Không tải được ca làm việc');
      if (!staffRes.ok) throw new Error('Không tải được nhân viên');
      const wsData: WorkshiftRecord[] = await wsRes.json();
      const staffData: Staff[] = await staffRes.json();
      setWorkshifts(wsData);
      setFiltered(wsData);
      setStaffs(staffData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Apply filters
  useEffect(() => {
    let tmp = [...workshifts];
    if (searchUsername.trim()) {
      tmp = tmp.filter(w => w.username.toLowerCase() === searchUsername.trim().toLowerCase());
    }
    if (dateFilter.from) tmp = tmp.filter(w => w.shiftDate >= dateFilter.from);
    if (dateFilter.to) tmp = tmp.filter(w => w.shiftDate <= dateFilter.to);
    setFiltered(tmp);
  }, [searchUsername, dateFilter, workshifts]);

  // Handlers for modals
  const openCreate = () => {
    setCreateShift({ userId: 0, shiftDate: '', startTime: '', endTime: '', isOverNight: false });
    setIsCreateModalOpen(true);
  };
  const openEdit = (ws: WorkshiftRecord) => {
    setEditShift({ id: ws.id, userId: ws.userId, shiftDate: ws.shiftDate, startTime: ws.startTime, endTime: ws.endTime, isOverNight: !!ws.isOverNight });
    setIsEditModalOpen(true);
  };

  // Create API
  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/create/shift', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(createShift)
      });
      if (!res.ok) throw new Error('Tạo ca thất bại');
      setIsCreateModalOpen(false);
      await loadAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  // Update API
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { id, ...payload } = editShift;
      const res = await fetch(`/api/reports/update/shift/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Cập nhật ca thất bại');
      setIsEditModalOpen(false);
      await loadAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 sticky top-0"><TaskbarManager/></div>
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Quản lý Ca làm việc</h1>
        {/* Filters + Add */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
          <input type="text" placeholder="Tìm theo username..." value={searchUsername}
            onChange={e=>setSearchUsername(e.target.value)} className="px-3 py-2 border rounded w-64"/>
          <div><label className="block text-sm mb-1">Từ ngày</label><input type="date" value={dateFilter.from}
            onChange={e=>setDateFilter(d=>({...d,from:e.target.value}))} className="px-2 py-1 border rounded"/></div>
          <div><label className="block text-sm mb-1">Đến ngày</label><input type="date" value={dateFilter.to}
            onChange={e=>setDateFilter(d=>({...d,to:e.target.value}))} className="px-2 py-1 border rounded"/></div>
          <button onClick={openCreate} className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Thêm Ca</button>
        </div>
        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100"><tr>
              <th className="px-4 py-2 text-left text-sm">Username</th>
              <th className="px-4 py-2 text-left text-sm">Ngày</th>
              <th className="px-4 py-2 text-left text-sm">Bắt đầu</th>
              <th className="px-4 py-2 text-left text-sm">Kết thúc</th>
              <th className="px-4 py-2 text-left text-sm">Giờ vào</th>
              <th className="px-4 py-2 text-left text-sm">Giờ ra</th>
              <th className="px-4 py-2 text-left text-sm">Overnight</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(ws=>(
                <tr key={ws.id} onClick={()=>openEdit(ws)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-2 text-sm">{ws.username}</td>
                  <td className="px-4 py-2 text-sm">{ws.shiftDate}</td>
                  <td className="px-4 py-2 text-sm">{ws.startTime}</td>
                  <td className="px-4 py-2 text-sm">{ws.endTime}</td>
                  <td className="px-4 py-2 text-sm">{ws.clockIn??'-'}</td>
                  <td className="px-4 py-2 text-sm">{ws.clockOut??'-'}</td>
                  <td className="px-4 py-2 text-sm">{ws.isOverNight?'Yes':'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Create Modal */}
        {isCreateModalOpen&&(
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-lg font-semibold mb-4">Tạo Ca làm việc</h2>
              <div className="space-y-3">
                <label className="block text-sm">Nhân viên</label>
                <select value={createShift.userId} onChange={e=>setCreateShift(s=>({...s,userId:+e.target.value}))} className="w-full border px-2 py-1 rounded">
                  <option value={0}>Chọn nhân viên...</option>
                  {staffs.map(st=><option key={st.id} value={st.id}>{st.fullName} ({st.username})</option>)}
                </select>
                <label className="block text-sm">Ngày ca</label>
                <input type="date" value={createShift.shiftDate} onChange={e=>setCreateShift(s=>({...s,shiftDate:e.target.value}))} className="w-full border px-2 py-1 rounded"/>
                <div className="flex gap-2">
                  <div className="flex-1"><label className="block text-sm">Bắt đầu</label><input type="time" value={createShift.startTime} onChange={e=>setCreateShift(s=>({...s,startTime:e.target.value}))} className="w-full border px-2 py-1 rounded"/></div>
                  <div className="flex-1"><label className="block text-sm">Kết thúc</label><input type="time" value={createShift.endTime} onChange={e=>setCreateShift(s=>({...s,endTime:e.target.value}))} className="w-full border px-2 py-1 rounded"/></div>
                </div>
                <div className="flex items-center"><input type="checkbox" checked={createShift.isOverNight} onChange={e=>setCreateShift(s=>({...s,isOverNight:e.target.checked}))} className="mr-2"/><label className="text-sm">Overnight</label></div>
              </div>
              <div className="mt-4 flex justify-end gap-2"><button onClick={()=>setIsCreateModalOpen(false)} className="px-4 py-2 border rounded">Huỷ</button><button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded">Tạo</button></div>
            </div>
          </div>
        )}
        {/* Edit Modal */}
        {isEditModalOpen&&(
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-lg font-semibold mb-4">Cập nhật Ca làm việc</h2>
              <div className="space-y-3">
                <label className="block text-sm">Nhân viên</label>
                <select value={editShift.userId} onChange={e=>setEditShift(s=>({...s,userId:+e.target.value}))} className="w-full border px-2 py-1 rounded">
                  {staffs.map(st=><option key={st.id} value={st.id}>{st.fullName} ({st.username})</option>)}
                </select>
                <label className="block text-sm">Ngày ca</label>
                <input type="date" value={editShift.shiftDate} onChange={e=>setEditShift(s=>({...s,shiftDate:e.target.value}))} className="w-full border px-2 py-1 rounded"/>
                <div className="flex gap-2">
                  <div className="flex-1"><label className="block text-sm">Bắt đầu</label><input type="time" value={editShift.startTime} onChange={e=>setEditShift(s=>({...s,startTime:e.target.value}))} className="w-full border px-2 py-1 rounded"/></div>
                  <div className="flex-1"><label className="block text-sm">Kết thúc</label><input type="time" value={editShift.endTime} onChange={e=>setEditShift(s=>({...s,endTime:e.target.value}))} className="w-full border px-2 py-1 rounded"/></div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2"><button onClick={()=>setIsEditModalOpen(false)} className="px-4 py-2 border rounded">Huỷ</button><button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshiftManager;
