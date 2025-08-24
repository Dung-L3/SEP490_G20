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
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editStaff, setEditStaff] = useState<StaffDisplay | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');
  const [editModalError, setEditModalError] = useState<string>('');
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
      setModalError('');

      // Đảm bảo roleName đúng định dạng
      let role = staffData.roleName;
      if (!role.startsWith('ROLE_')) {
        role = `ROLE_${role}`;
      }
      
      const staffRequest: StaffRequest = {
        username: staffData.username,
        passwordHash: staffData.password,
        fullName: staffData.fullName,
        email: staffData.email,
        phone: staffData.phone,
        roleNames: [role],
        status: true
      };
      
      const newStaff = await staffApi.create(staffRequest);
      // Thêm nhân viên mới vào danh sách với chức năng đã được ánh xạ đúng
      setStaff(prev => [...prev, mapStaffToDisplay(newStaff)]);
      setAddOpen(false);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error registering employee:', error);
      if (error instanceof Error) {
        setModalError(error.message);
      } else {
        setModalError('Không thể thêm nhân viên mới');
      }
    } finally {
      setLoading(false);
    }
  };

    const ROLE_OPTIONS = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'ROLE_MANAGER', label: 'Quản lý' },
    { value: 'ROLE_WAITER', label: 'Phục vụ' },
    { value: 'ROLE_CHEF', label: 'Đầu bếp' },
    { value: 'ROLE_RECEPTIONIST', label: 'Thu ngân' },
    { value: 'ROLE_CUSTOMER', label: 'Khách hàng' }
  ];

  const formatRole = (role: string): string => {
    console.log('Formatting role:', role);
    if (!role) return '';
    // Remove 'ROLE_' prefix if exists
    const baseRole = role.replace('ROLE_', '');
    
    switch (baseRole.toUpperCase()) {
      case 'MANAGER': return 'Quản lý';
      case 'WAITER': return 'Phục vụ';
      case 'CHEF': return 'Đầu bếp';
      case 'RECEPTIONIST': return 'Thu ngân';
      case 'CUSTOMER': return 'Khách hàng';
      default: return baseRole;
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
    const baseRole = role.replace('ROLE_', '').toUpperCase();
    switch (baseRole) {
      case 'MANAGER': return '👨‍💼';
      case 'WAITER': return '👨‍🍽️';
      case 'CHEF': return '👨‍🍳';
      case 'RECEPTIONIST': return '👩‍💻';
      case 'STAFF': return '👤';
      default: return '👤';
    }
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await staffApi.getAll();
        console.log('Staff data from API:', response);
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

  // Filter staff based on search term and selected role
  const filteredStaff = staff.filter(s => {
    // Convert search term to lowercase for case-insensitive comparison
    const searchLower = searchTerm.toLowerCase();
    
    // Check if staff matches search term
    const matchesSearch = !searchTerm || (
      s.fullName.toLowerCase().includes(searchLower) ||
      s.phone.toLowerCase().includes(searchLower) ||
      s.email.toLowerCase().includes(searchLower)
    );
    
    // Check if staff matches selected role
    const matchesRole = !selectedRole || s.roleNames.includes(selectedRole);
    
    // Return true only if both conditions are met
    return matchesSearch && matchesRole;
  });



  const handleEdit = (idx: number) => {
    const staffToEdit = filteredStaff[idx];
    setEditStaff(staffToEdit);
  };



  const handleEditSave = async () => {
    setEditModalError('');

    if (!editStaff || editStaff.id === 0) {
      setEditModalError('Không tìm thấy thông tin nhân viên');
      return;
    }

    // Validate each field
    if (!editStaff.fullName.trim()) {
      setEditModalError('Vui lòng nhập họ tên');
      return;
    }
    if (!editStaff.email.trim()) {
      setEditModalError('Vui lòng nhập email');
      return;
    }
    if (!editStaff.phone.trim()) {
      setEditModalError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!editStaff.username.trim()) {
      setEditModalError('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!editStaff.roleNames || editStaff.roleNames.length === 0) {
      setEditModalError('Vui lòng chọn chức vụ');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editStaff.email.trim())) {
      setEditModalError('Email không hợp lệ');
      return;
    }

    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(editStaff.phone.trim())) {
      setEditModalError('Số điện thoại phải có 10 chữ số');
      return;
    }

    try {
      setLoading(true);

      console.log('Current staff data:', editStaff);
      
      // Đảm bảo role name có định dạng đúng
      let role = editStaff.roleNames[0];
      if (!role.startsWith('ROLE_')) {
        role = `ROLE_${role}`;
      }

      const staffRequest: StaffRequest = {
        username: editStaff.username.trim(),
        fullName: editStaff.fullName.trim(),
        email: editStaff.email.trim(),
        phone: editStaff.phone.trim(),
        status: editStaff.status,
        roleNames: [role],  // Gửi role đã được format
        passwordHash: '' // Empty password means no change
      };
      console.log('Sending update request:', staffRequest);

      const updated = await staffApi.update(editStaff.id, staffRequest);
      console.log('Update response:', updated);

      setStaff(staff => staff.map(s => 
        s.id === editStaff.id ? mapStaffToDisplay(updated) : s
      ));
      setEditStaff(null);
      // Show success message
      alert('Cập nhật thông tin nhân viên thành công');
    } catch (err) {
      console.error('Error updating staff:', err);
      if (err instanceof Error) {
        setEditModalError(err.message);
      } else {
        setEditModalError('Không thể cập nhật thông tin nhân viên');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddSave = async () => {
    setModalError('');

    // Validate all fields
    if (!newStaff.fullName.trim()) {
      setModalError('Vui lòng nhập họ tên');
      return;
    }
    if (!newStaff.email.trim()) {
      setModalError('Vui lòng nhập email');
      return;
    }
    if (!newStaff.phone.trim()) {
      setModalError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!newStaff.username.trim()) {
      setModalError('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!newStaff.passwordHash.trim()) {
      setModalError('Vui lòng nhập mật khẩu');
      return;
    }
    if (newStaff.roleNames.length === 0) {
      setModalError('Vui lòng chọn chức vụ');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStaff.email.trim())) {
      setModalError('Email không hợp lệ');
      return;
    }

    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newStaff.phone.trim())) {
      setModalError('Số điện thoại phải có 10 chữ số');
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
      console.error('Error creating staff:', err);
      if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError('Không thể thêm nhân viên mới');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!id) {
      setError('ID nhân viên không hợp lệ');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;

    try {
      setLoading(true);
      setError('');
      console.log('Deleting staff with ID:', id);
      await staffApi.delete(id);
      setStaff(staff => staff.filter(s => s.id !== id));
      // Show success message
      alert('Xóa nhân viên thành công');
    } catch (err) {
      console.error('Error deleting staff:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể xóa nhân viên');
      }
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
                placeholder="Tìm kiếm theo tên, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
                      {s.roleNames && s.roleNames.length > 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {s.roleNames.map(role => {
                            console.log('Role before formatting:', role);
                            return formatRole(role);
                          }).join(', ')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          Chưa có chức vụ
                        </span>
                      )}
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
                {modalError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {modalError}
                  </div>
                )}
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
                      <option value="">Chọn vai trò</option>
                      <option value="ROLE_MANAGER">Quản lý</option>
                      <option value="ROLE_WAITER">Phục vụ</option>
                      <option value="ROLE_CHEF">Đầu bếp</option>
                      <option value="ROLE_RECEPTIONIST">Thu ngân</option>
                      <option value="ROLE_CUSTOMER">Khách hàng</option>
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
                {editModalError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {editModalError}
                  </div>
                )}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                    <select
                      name="roleName"
                      value={editStaff.roleNames[0] || ''}
                      onChange={(e) => setEditStaff(prev => ({ ...prev!, roleNames: [e.target.value] }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Chọn vai trò</option>
                      {ROLE_OPTIONS.filter(role => role.value !== '').map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
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
