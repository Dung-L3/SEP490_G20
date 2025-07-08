import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Users, UserCheck, UserX, Eye, EyeOff } from 'lucide-react';
import TaskbarManager from '../../components/TaskbarManager';

// Sample staff data
const initialStaff = [
  { id: 1, name: 'Nguyễn Văn A', role: 'Quản lý', phone: '0901234567', username: 'admin', password: '123456', status: 'Đang làm', avatar: '👨‍💼' },
  { id: 2, name: 'Trần Thị B', role: 'Phục vụ', phone: '0902345678', username: 'buser', password: '123456', status: 'Đang làm', avatar: '👩‍💼' },
  { id: 3, name: 'Lê Văn C', role: 'Bếp', phone: '0903456789', username: 'cook', password: '123456', status: 'Nghỉ việc', avatar: '👨‍🍳' },
  { id: 4, name: 'Phạm Thị D', role: 'Thu ngân', phone: '0904567890', username: 'cashier', password: '123456', status: 'Đang làm', avatar: '👩‍💻' },
  { id: 5, name: 'Võ Văn E', role: 'Phục vụ', phone: '0905678901', username: 'waiter', password: '123456', status: 'Đang làm', avatar: '👨‍🍽️' },
];

const StaffManager = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editStaff, setEditStaff] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [newStaff, setNewStaff] = useState({
    name: '', role: '', phone: '', username: '', password: '', status: 'Đang làm', avatar: '👤'
  });

  // Filter staff based on search and status
  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.phone.includes(searchTerm);
    const matchesStatus = !filterStatus || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Toggle work status
  const handleToggleStatus = (idx) => {
    const staffIndex = staff.findIndex(s => s.id === filteredStaff[idx].id);
    setStaff(staff => staff.map((s, i) =>
      i === staffIndex ? { ...s, status: s.status === 'Đang làm' ? 'Nghỉ việc' : 'Đang làm' } : s
    ));
  };

  // Open edit modal
  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditStaff({ ...filteredStaff[idx] });
  };

  // Handle edit field changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditStaff(prev => ({ ...prev, [name]: value }));
  };

  // Save edit
  const handleEditSave = () => {
    if (editIdx !== null && editStaff) {
      const staffIndex = staff.findIndex(s => s.id === editStaff.id);
      setStaff(staff => staff.map((s, i) => i === staffIndex ? editStaff : s));
    }
    setEditIdx(null);
    setEditStaff(null);
  };

  // Cancel edit
  const handleEditCancel = () => {
    setEditIdx(null);
    setEditStaff(null);
  };

  // Handle add field changes
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({ ...prev, [name]: value }));
  };

  // Save new staff
  const handleAddSave = () => {
    if (!newStaff.name.trim() || !newStaff.role.trim() || !newStaff.phone.trim() || !newStaff.username.trim() || !newStaff.password.trim()) return;
    setStaff(prev => [...prev, { ...newStaff, id: Date.now() }]);
    setAddOpen(false);
    setNewStaff({ name: '', role: '', phone: '', username: '', password: '', status: 'Đang làm', avatar: '👤' });
  };

  // Cancel add
  const handleAddCancel = () => {
    setAddOpen(false);
    setNewStaff({ name: '', role: '', phone: '', username: '', password: '', status: 'Đang làm', avatar: '👤' });
  };

  // Delete staff
  const handleDelete = (idx) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      const staffToDelete = filteredStaff[idx];
      setStaff(staff => staff.filter(s => s.id !== staffToDelete.id));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeStaff = staff.filter(s => s.status === 'Đang làm').length;
  const inactiveStaff = staff.filter(s => s.status === 'Nghỉ việc').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen sticky top-0 z-10">
        <TaskbarManager />
      </div>
      
      <div className="flex-1 min-w-0 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý nhân sự</h1>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <span className="text-gray-600">Đang làm việc: <strong className="text-green-600">{activeStaff}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              <span className="text-gray-600">Nghỉ việc: <strong className="text-red-600">{inactiveStaff}</strong></span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, chức vụ, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Đang làm">Đang làm</option>
            <option value="Nghỉ việc">Nghỉ việc</option>
          </select>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm nhân viên
          </button>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nhân viên</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Chức vụ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Liên hệ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tài khoản</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                          {s.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{s.name}</div>
                          <div className="text-sm text-gray-500">ID: {s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{s.phone}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{s.username}</div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <span>{showPassword[s.id] ? s.password : '••••••'}</span>
                          <button
                            onClick={() => togglePasswordVisibility(s.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {showPassword[s.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(idx)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                          s.status === 'Đang làm'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Nhấn để chuyển trạng thái"
                      >
                        {s.status === 'Đang làm' ? <UserCheck className="w-4 h-4 mr-1" /> : <UserX className="w-4 h-4 mr-1" />}
                        {s.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(idx)}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Không tìm thấy nhân viên nào</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}

        {/* Add Staff Modal */}
        {addOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thêm nhân viên mới</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                    <div className="flex gap-2 flex-wrap">
                      {['👤', '👨‍💼', '👩‍💼', '👨‍🍳', '👩‍🍳', '👨‍🍽️', '👩‍🍽️', '👩‍💻'].map(avatar => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setNewStaff(prev => ({ ...prev, avatar }))}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-colors ${
                            newStaff.avatar === avatar ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                    <input
                      name="name"
                      value={newStaff.name}
                      onChange={handleAddChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                    <input
                      name="role"
                      value={newStaff.role}
                      onChange={handleAddChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Nhập chức vụ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      name="phone"
                      value={newStaff.phone}
                      onChange={handleAddChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tài khoản</label>
                    <input
                      name="username"
                      value={newStaff.username}
                      onChange={handleAddChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Nhập tên tài khoản"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                    <input
                      name="password"
                      type="password"
                      value={newStaff.password}
                      onChange={handleAddChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Nhập mật khẩu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                      name="status"
                      value={newStaff.status}
                      onChange={handleAddChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="Đang làm">Đang làm</option>
                      <option value="Nghỉ việc">Nghỉ việc</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleAddCancel}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleAddSave}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Thêm nhân viên
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Staff Modal */}
        {editIdx !== null && editStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chỉnh sửa thông tin</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                    <div className="flex gap-2 flex-wrap">
                      {['👤', '👨‍💼', '👩‍💼', '👨‍🍳', '👩‍🍳', '👨‍🍽️', '👩‍🍽️', '👩‍💻'].map(avatar => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setEditStaff(prev => ({ ...prev, avatar }))}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-colors ${
                            editStaff.avatar === avatar ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                    <input
                      name="name"
                      value={editStaff.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                    <input
                      name="role"
                      value={editStaff.role}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      name="phone"
                      value={editStaff.phone}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tài khoản</label>
                    <input
                      name="username"
                      value={editStaff.username}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                    <input
                      name="password"
                      type="password"
                      value={editStaff.password}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                      name="status"
                      value={editStaff.status}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="Đang làm">Đang làm</option>
                      <option value="Nghỉ việc">Nghỉ việc</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleEditCancel}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Lưu thay đổi
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

export default StaffManager;