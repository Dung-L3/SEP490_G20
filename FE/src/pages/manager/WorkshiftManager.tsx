import { useState, useEffect } from 'react';
import { workshiftApi } from '../../api/workshiftApi';
import TaskbarManager from '../../components/TaskbarManager';

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
}

interface Workshift {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  location: string;
  requiredStaff: number;
  assignedEmployees: Employee[];
  department: string;
  repeatPattern?: 'daily' | 'weekly' | 'none';
}

interface FilterOptions {
  department: string;
  employeeName: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
  view: 'day' | 'week' | 'month';
}

interface Statistics {
  totalShifts: number;
  openShifts: number;
  activeEmployees: number;
  onLeaveEmployees: number;
}

const WorkshiftManager = () => {
  const [workshifts, setWorkshifts] = useState<Workshift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterOptions>({
    department: '',
    employeeName: '',
    status: '',
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    view: 'week'
  });
  const [stats, setStats] = useState<Statistics>({
    totalShifts: 0,
    openShifts: 0,
    activeEmployees: 0,
    onLeaveEmployees: 0
  });
  const [newWorkshift, setNewWorkshift] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    status: 'ACTIVE',
    location: '',
    requiredStaff: 1,
    department: '',
    repeatPattern: 'none' as const
  });

  // Fetch workshifts
  useEffect(() => {
    loadWorkshifts();
  }, []);

  const loadWorkshifts = async () => {
    try {
      const data = await workshiftApi.getAll();
      setWorkshifts(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách ca làm việc');
      console.error('Error loading workshifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkshift = async () => {
    try {
      await workshiftApi.create(newWorkshift);
      setIsAddModalOpen(false);
      setNewWorkshift({
        name: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        status: 'ACTIVE',
        location: '',
        requiredStaff: 1,
        department: '',
        repeatPattern: 'none'
      });
      loadWorkshifts();
      
      // Cập nhật thống kê
      const updatedStats = {
        totalShifts: stats.totalShifts + 1,
        openShifts: stats.openShifts + 1,
        activeEmployees: stats.activeEmployees,
        onLeaveEmployees: stats.onLeaveEmployees
      };
      setStats(updatedStats);
    } catch (err) {
      setError('Không thể thêm ca làm việc mới');
      console.error('Error adding workshift:', err);
    }
  };

  const handleDeleteWorkshift = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa ca làm việc này?')) {
      try {
        await workshiftApi.delete(id);
        loadWorkshifts();
      } catch (err) {
        setError('Không thể xóa ca làm việc');
        console.error('Error deleting workshift:', err);
      }
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div style={{ display: 'flex' }}>
      <TaskbarManager />
      <div style={{ marginLeft: '220px', padding: '24px', width: '100%' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Ca làm việc</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Thêm Ca làm việc
            </button>
          </div>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filter.department}
                onChange={(e) => setFilter({...filter, department: e.target.value})}
              >
                <option value="">Tất cả</option>
                <option value="kitchen">Nhà bếp</option>
                <option value="service">Phục vụ</option>
                <option value="reception">Lễ tân</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhân viên</label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filter.employeeName}
                onChange={(e) => setFilter({...filter, employeeName: e.target.value})}
                placeholder="Tìm kiếm nhân viên..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
              >
                <option value="">Tất cả</option>
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
                <option value="open">Ca trống</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xem theo</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filter.view}
                onChange={(e) => setFilter({...filter, view: e.target.value as 'day' | 'week' | 'month'})}
              >
                <option value="day">Ngày</option>
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Tổng số ca</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalShifts}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Ca trống</div>
            <div className="text-2xl font-bold text-blue-600">{stats.openShifts}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Đang làm việc</div>
            <div className="text-2xl font-bold text-green-600">{stats.activeEmployees}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Đang nghỉ</div>
            <div className="text-2xl font-bold text-red-600">{stats.onLeaveEmployees}</div>
          </div>
        </div>
      

      {/* Danh sách ca làm việc */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên ca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giờ làm việc
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phòng ban
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Địa điểm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lặp lại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workshifts.map((shift) => (
              <tr key={shift.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(shift.date).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shift.startTime} - {shift.endTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shift.department === 'kitchen' ? 'Nhà bếp' : 
                   shift.department === 'service' ? 'Phục vụ' : 
                   shift.department === 'reception' ? 'Lễ tân' : shift.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shift.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>{shift.assignedEmployees.length}/{shift.requiredStaff}</span>
                    {shift.assignedEmployees.length < shift.requiredStaff && (
                      <span className="text-yellow-500 text-xs">Thiếu {shift.requiredStaff - shift.assignedEmployees.length}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    shift.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    shift.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {shift.status === 'ACTIVE' ? 'Hoạt động' :
                     shift.status === 'PENDING' ? 'Chờ duyệt' :
                     'Không hoạt động'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shift.repeatPattern === 'daily' ? 'Hàng ngày' :
                   shift.repeatPattern === 'weekly' ? 'Hàng tuần' : 
                   'Không lặp lại'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleDeleteWorkshift(shift.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                  <button
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Sửa
                  </button>
                  <button
                    className="text-green-600 hover:text-green-900"
                  >
                    Phân công
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm ca làm việc */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
            <h3 className="text-lg font-bold mb-4">Thêm Ca làm việc mới</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên ca</label>
                <input
                  type="text"
                  value={newWorkshift.name}
                  onChange={(e) => setNewWorkshift({...newWorkshift, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
                <select
                  value={newWorkshift.department}
                  onChange={(e) => setNewWorkshift({...newWorkshift, department: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="">Chọn phòng ban</option>
                  <option value="kitchen">Nhà bếp</option>
                  <option value="service">Phục vụ</option>
                  <option value="reception">Lễ tân</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày</label>
                <input
                  type="date"
                  value={newWorkshift.date}
                  onChange={(e) => setNewWorkshift({...newWorkshift, date: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lặp lại</label>
                <select
                  value={newWorkshift.repeatPattern}
                  onChange={(e) => setNewWorkshift({...newWorkshift, repeatPattern: e.target.value as 'none' | 'daily' | 'weekly'})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="none">Không lặp lại</option>
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Giờ bắt đầu</label>
                <input
                  type="time"
                  value={newWorkshift.startTime}
                  onChange={(e) => setNewWorkshift({...newWorkshift, startTime: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Giờ kết thúc</label>
                <input
                  type="time"
                  value={newWorkshift.endTime}
                  onChange={(e) => setNewWorkshift({...newWorkshift, endTime: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Địa điểm làm việc</label>
                <input
                  type="text"
                  value={newWorkshift.location}
                  onChange={(e) => setNewWorkshift({...newWorkshift, location: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số nhân viên cần</label>
                <input
                  type="number"
                  min="1"
                  value={newWorkshift.requiredStaff}
                  onChange={(e) => setNewWorkshift({...newWorkshift, requiredStaff: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddWorkshift}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default WorkshiftManager;
