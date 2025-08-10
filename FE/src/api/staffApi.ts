import type { Staff, StaffRequest } from '../types/Staff';
import axiosClient from './axiosClient';

// No need for /api prefix since axiosClient already has baseURL = '/api'
const API_URL = '/users';
const AUTH_API_URL = '/auth';

interface StaffResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  status: boolean;
  createdAt?: string;
  roleName: string;  // Changed from roles array to single roleName
}

const mapToStaff = (data: StaffResponse): Staff => {
  if (!data) {
    throw new Error('Invalid staff data received from server');
  }
  return {
    id: data.id || 0,
    username: data.username || '',
    fullName: data.fullName || '',
    email: data.email || '',
    phone: data.phone || '',
    status: data.status ?? false,
    roleNames: data.roleName ? [`ROLE_${data.roleName.toUpperCase()}`] : [] // Convert to array and add ROLE_ prefix
  };
};

export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    try {
      console.log('Fetching staff from:', `${API_URL}/getAllStaffs`);
      const response = await axiosClient.get(`${API_URL}/getAllStaffs`);
      console.log('Staff response:', response.data);

      if (!Array.isArray(response.data)) {
        console.error('Expected array of staff but got:', response.data);
        return [];
      }

      return response.data.map((item: StaffResponse) => {
        console.log('Mapping staff item:', item);
        const mapped = mapToStaff(item);
        console.log('Mapped staff:', mapped);
        return mapped;
      });
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw new Error('Không thể tải danh sách nhân viên');
    }
  },

  getById: async (id: number): Promise<Staff> => {
    try {
      const response = await axiosClient.get(`${API_URL}/${id}`);
      return mapToStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw new Error('Không thể tải thông tin nhân viên');
    }
  },

  create: async (request: StaffRequest): Promise<Staff> => {
    try {
      // Convert StaffRequest to RegisterRequest format
      const registerRequest = {
        username: request.username,
        password: request.passwordHash || '123456', // Default password if not provided
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        roleName: request.roleNames?.[0]?.replace('ROLE_', '').toLowerCase() || 'staff' // Remove ROLE_ prefix and convert to lowercase
      };

      const response = await axiosClient.post(`${AUTH_API_URL}/register/employee`, registerRequest);

      // Map response data to Staff object
      return {
        id: response.data.id || 0,
        username: response.data.username,
        fullName: response.data.fullName,
        email: response.data.email,
        phone: response.data.phone,
        status: response.data.status ?? true,
        roleNames: response.data.roles?.map((role: { roleName: string }) => role.roleName) || []
      };
    } catch (error: unknown) {
      console.error('Error creating staff:', error);
      
      // Handle specific backend errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string; trace?: string; message?: string } } };
        
        if (axiosError.response?.data?.error === 'Internal Server Error') {
          const trace = axiosError.response.data.trace;
          if (trace && typeof trace === 'string') {
            if (trace.includes('Số điện thoại đã tồn tại')) {
              throw new Error('Số điện thoại đã tồn tại');
            }
            if (trace.includes('Username đã tồn tại')) {
              throw new Error('Username đã tồn tại');
            }
          }
        }
        
        throw new Error(axiosError.response?.data?.message || 'Không thể tạo nhân viên');
      }
      
      throw new Error('Không thể tạo nhân viên');
    }
  },

  update: async (id: number, request: StaffRequest): Promise<Staff> => {
    try {
      console.log('Updating staff:', id, request);
      
      // Chuẩn bị dữ liệu gửi đi
      const updateRequest = {
        username: request.username,
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        status: request.status,
        roleName: request.roleNames?.[0]?.replace('ROLE_', '') || 'staff' // Remove ROLE_ prefix, leave case as is
      };

      console.log('Update request data:', updateRequest);
      const response = await axiosClient.put(`${API_URL}/${id}`, updateRequest);
      console.log('Update response:', response.data);

      if (!response.data) {
        throw new Error('Không nhận được phản hồi từ server');
      }

      return mapToStaff(response.data);
    } catch (error: unknown) {
      console.error('Error updating staff:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string; trace?: string; message?: string } } };
        
        // Log full error response for debugging
        console.log('Error response:', axiosError.response?.data);
        
        if (axiosError.response?.data?.error === 'Internal Server Error') {
          const trace = axiosError.response.data.trace;
          if (trace && typeof trace === 'string') {
            if (trace.includes('Số điện thoại đã tồn tại')) {
              throw new Error('Số điện thoại đã tồn tại');
            }
            if (trace.includes('Email đã tồn tại')) {
              throw new Error('Email đã tồn tại');
            }
            if (trace.includes('Username đã tồn tại')) {
              throw new Error('Username đã tồn tại');
            }
          }
        }
        
        throw new Error(axiosError.response?.data?.message || 'Không thể cập nhật thông tin nhân viên');
      }
      
      throw new Error('Không thể cập nhật thông tin nhân viên');
    }
  },

  updateStatus: async (id: number, status: boolean): Promise<Staff> => {
    try {
      console.log('Updating staff status:', id, status);
      
      const response = await axiosClient.patch(`${API_URL}/${id}/status`, { status });
      return mapToStaff(response.data);
    } catch (error: unknown) {
      console.error('Error updating staff status:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái nhân viên');
      }
      
      throw new Error('Không thể cập nhật trạng thái nhân viên');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      console.log('Deleting staff with ID:', id);
      await axiosClient.delete(`${API_URL}/${id}`);
    } catch (error: unknown) {
      console.error('Error deleting staff:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string; trace?: string; message?: string } } };
        
        // Check for specific error messages in the trace
        if (axiosError.response?.data?.trace) {
          const trace = axiosError.response.data.trace;
          if (typeof trace === 'string') {
            if (trace.includes('WorkShifts')) {
              throw new Error('Không thể xóa nhân viên vì họ đã có ca làm việc trong hệ thống. Vui lòng xóa ca làm việc trước.');
            }
            if (trace.includes('Orders')) {
              throw new Error('Không thể xóa nhân viên vì họ đã có đơn hàng trong hệ thống.');
            }
            if (trace.includes('REFERENCE constraint')) {
              throw new Error('Không thể xóa nhân viên vì họ đang được liên kết với dữ liệu khác trong hệ thống.');
            }
          }
        }
        
        throw new Error(axiosError.response?.data?.message || 'Không thể xóa nhân viên');
      }
      
      throw new Error('Không thể xóa nhân viên');
    }
  },

  searchByName: async (name: string): Promise<Staff[]> => {
    try {
      const response = await fetch(`${API_URL}/search?name=${encodeURIComponent(name)}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map(mapToStaff);
    } catch (error) {
      console.error('Error searching staff:', error);
      throw new Error('Failed to search staff');
    }
  },

  checkUsernameExists: async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`${AUTH_API_URL}/check-username?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        if (response.status === 404) {
          // Nếu không tìm thấy username, có nghĩa là username chưa tồn tại
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Nếu response ok, nghĩa là username đã tồn tại
      return true;
    } catch (error) {
      console.error('Error checking username:', error);
      throw new Error('Failed to check username');
    }
  }
};
