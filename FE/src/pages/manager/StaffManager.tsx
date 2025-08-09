import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import TaskbarManager from '../../components/TaskbarManager';
import { staffApi } from '../../api/staffApi';
import { registerEmployeeApi } from '../../api/registerApi';
import { StaffAddModal } from '../../components/StaffAddModal';
import type { Staff } from '../../types/Staff';

interface StaffDisplay extends Staff {
  avatar: string;
}

interface StaffRequest {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  passwordHash: string;
  roleNames: string[];
  status: boolean;
}

const StaffManager = () => {
  const [staff, setStaff] = useState<StaffDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editStaff, setEditStaff] = useState<StaffDisplay | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [newStaff, setNewStaff] = useState<StaffRequest>({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    passwordHash: '',
    roleNames: [],
    status: true
  });

  const handleAddStaff = async (staffData: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone: string;
    roleName: string;
  }) => {
    try {
      setLoading(true);
      // Đảm bảo roleName không null và chuyển đổi sang định dạng phù hợp
      const processedStaffData = {
        ...staffData,
        roleName: staffData.roleName || 'staff' // Giá trị mặc định nếu roleName là null
      };
      
      await registerEmployeeApi(processedStaffData);
      // Reload staff list
      const response = await staffApi.getAll();
      setStaff(response.map(mapStaffToDisplay));
      setAddOpen(false);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error registering employee:', error);
      setError('Lỗi khi thêm nhân viên: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Convert API Staff to display format
  const mapStaffToDisplay = useCallback((apiStaff: Staff): StaffDisplay => {
    return {
      ...apiStaff,
      avatar: getAvatarForRole(apiStaff.roleNames[0] || ''), // Use first role or empty string
    };
  }, []);

  const getAvatarForRole = (role: string): string => {
    if (!role) return '👤'; // Default avatar if no role
    switch (role.toLowerCase()) {
      case 'manager': return '👨‍💼';
      case 'waiter': return '👨‍🍽️';
      case 'chef': return '👨‍🍳';
      case 'thu ngân': return '👩‍💻';
      default: return '👤';
    }
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await staffApi.getAll();
        setStaff(response.map(mapStaffToDisplay));
        setError('');
      } catch (err) {
        setError('Không thể tải danh sách nhân viên');
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStaff();
  }, [mapStaffToDisplay]);

  const filteredStaff = staff.filter(s => {
    if (!searchTerm) return true;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(searchTermLower) ||
      s.roleNames.some(role => role.toLowerCase().includes(searchTermLower)) ||
      s.phone.includes(searchTerm) ||
      s.email.toLowerCase().includes(searchTermLower)
    );
  });



  const handleEdit = (idx: number) => {
    const staffToEdit = filteredStaff[idx];
    setEditStaff(staffToEdit);
  };



  const handleEditSave = async () => {
    if (!editStaff) return;

    try {
      setLoading(true);
      const staffRequest: StaffRequest = {
        username: editStaff.username,
        fullName: editStaff.fullName,
        email: editStaff.email,
        phone: editStaff.phone,
        status: editStaff.status,
        roleNames: editStaff.roleNames,
        passwordHash: '' // Empty password means no change
      };

      const updated = await staffApi.update(editStaff.id, staffRequest);
      setStaff(staff => staff.map(s => 
        s.id === editStaff.id ? mapStaffToDisplay(updated) : s
      ));
      setEditStaff(null);
      setError('');
    } catch (err) {
      setError('Không thể cập nhật thông tin nhân viên');
      console.error('Error updating staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSave = async () => {
    if (!newStaff.fullName.trim() || newStaff.roleNames.length === 0 || !newStaff.phone.trim() || 
        !newStaff.username.trim() || !newStaff.email.trim()) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const created = await staffApi.create(newStaff);
      setStaff(prev => [...prev, mapStaffToDisplay(created)]);
      setAddOpen(false);
      setNewStaff({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        passwordHash: '',
        roleNames: [],
        status: true
      });
      setError('');
    } catch (err) {
      setError('Không thể thêm nhân viên mới');
      console.error('Error creating staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;

    try {
      setLoading(true);
      await staffApi.delete(id);
      setStaff(staff => staff.filter(s => s.id !== id));
      setError('');
    } catch (err) {
      setError('Không thể xóa nhân viên');
      console.error('Error deleting staff:', err);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 min-h-screen sticky top-0 z-10">
        <TaskbarManager />
      </div>
      
      <div className="flex-1 min-w-0 p-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý nhân sự</h1>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm nhân viên
          </button>
        </div>

        {/* Controls */}
        <StaffAddModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onSave={handleAddStaff}
        />

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 flex items-center gap-4">
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
            <button
              onClick={() => {
                // Thực hiện tìm kiếm trực tiếp trên state staff gốc
                // Không cần setStaff vì đã dùng filteredStaff cho render
                setSearchTerm(searchTerm);
              }}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Search className="w-5 h-5" />
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nhân viên</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Chức vụ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Số điện thoại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tài khoản</th>
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
                          <div className="font-semibold text-gray-900">{s.fullName}</div>
                          <div className="text-sm text-gray-500">ID: {s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {s.roleNames.join(', ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{s.email}</td>
                    <td className="px-6 py-4 text-gray-900">{s.phone}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{s.username}</div>
                      </div>
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
                          onClick={() => handleDelete(s.id)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                    <input
                      name="fullName"
                      value={newStaff.fullName}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Nhập email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                    <input
                      name="password"
                      type="password"
                      value={newStaff.passwordHash || ''}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, passwordHash: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Nhập mật khẩu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                    <select
                      name="role"
                      value={newStaff.roleNames[0] || ''}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, roleNames: [e.target.value] }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Chọn chức vụ</option>
                      <option value="manager">Quản lý</option>
                      <option value="waiter">Phục vụ</option>
                      <option value="chef">Bếp</option>
                      <option value="cashier">Thu ngân</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      name="phone"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                    <input
                      name="username"
                      value={newStaff.username}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Nhập tên đăng nhập"
                    />
                  </div>

                </div>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      setAddOpen(false);
                      setNewStaff({
                        username: '',
                        fullName: '',
                        email: '',
                        phone: '',
                        passwordHash: '',
                        status: true,
                        roleNames: []
                      });
                    }}
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
        {editStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chỉnh sửa thông tin</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                    <input
                      name="fullName"
                      value={editStaff.fullName}
                      onChange={(e) => setEditStaff(prev => ({ ...prev!, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={editStaff.email}
                      onChange={(e) => setEditStaff(prev => ({ ...prev!, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                    <select
                      name="role"
                      value={editStaff.roleNames[0] || ''}
                      onChange={(e) => setEditStaff(prev => ({ ...prev!, roleNames: [e.target.value] }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Chọn chức vụ</option>
                      <option value="MANAGER">Quản lý</option>
                      <option value="CUSTOMER">Khách hàng</option>
                      <option value="WAITER">Phục vụ</option>
                      <option value="CHEF">Đầu bếp</option>
                      <option value="RECEPTIONIST">Thu ngân</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      name="phone"
                      value={editStaff.phone}
                      onChange={(e) => setEditStaff(prev => ({ ...prev!, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                    <input
                      name="username"
                      value={editStaff.username}
                      onChange={(e) => setEditStaff(prev => ({ ...prev!, username: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      setEditStaff(null);
                    }}
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
