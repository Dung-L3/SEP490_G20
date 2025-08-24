import type { Staff, StaffRequest } from '../types/Staff';
import axiosClient from './axiosClient';

const API_URL = '/users';
const AUTH_API_URL = '/auth';

interface Role {
  roleName: string;
}

interface StaffResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  status: boolean;
  createdAt?: string;
  roleName?: string;
  roles?: Role[];
}

const mapToStaff = (data: StaffResponse): Staff => {
  console.log('=== Bắt đầu chuyển đổi dữ liệu nhân viên ===');
  console.log('Dữ liệu thô từ server:', data);
  
  if (!data) {
    throw new Error('Dữ liệu nhân viên không hợp lệ từ server');
  }

  let roleNames: string[] = [];
  
  // Xử lý các định dạng role khác nhau từ API
  if (data.roleName) {
    // Trường hợp một role dạng chuỗi
    console.log('Đang xử lý role đơn:', data.roleName);
    const roleName = data.roleName.toUpperCase();
    const formattedRole = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`;
    roleNames = [formattedRole];
    console.log('Role đã định dạng:', formattedRole);
  } else if (data.roles && Array.isArray(data.roles)) {
    // Trường hợp mảng roles
    console.log('Đang xử lý mảng roles:', data.roles);
    roleNames = data.roles.map(role => {
      const roleName = role.roleName.toUpperCase();
      const formattedRole = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`;
      console.log('Role từ mảng đã định dạng:', formattedRole);
      return formattedRole;
    });
  }
  
  console.log('Mảng roles cuối cùng:', roleNames);
  console.log('=== Kết thúc chuyển đổi dữ liệu nhân viên ===');

  return {
    id: data.id || 0,
    username: data.username || '',
    fullName: data.fullName || '',
    email: data.email || '',
    phone: data.phone || '',
    status: data.status ?? true,
    roleNames: roleNames
  };
};

export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    try {
      const endpoint = `${API_URL}/getAllStaffs`;
      console.log('Đang lấy danh sách nhân viên từ:', endpoint);
      console.log('URL đầy đủ:', axiosClient.getUri({ url: endpoint }));
      
      const response = await axiosClient.get(endpoint);
      console.log('Phản hồi từ server:', response.data);

      if (!Array.isArray(response.data)) {
        console.error('Dữ liệu không đúng định dạng mảng:', typeof response.data, response.data);
        return [];
      }

      return response.data.map((item: StaffResponse) => {
        console.log('Đang xử lý thông tin nhân viên:', item);
        const mapped = mapToStaff(item);
        console.log('Thông tin nhân viên sau khi xử lý:', mapped);
        return mapped;
      });
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách nhân viên:', {
        error,
        status: error?.response?.status,
        data: error?.response?.data,
        url: error?.config?.url
      });

      if (error?.response?.status === 404) {
        throw new Error('API endpoint không tồn tại. Vui lòng kiểm tra cấu hình API.');
      }

      throw new Error(error?.response?.data?.message || 'Không thể tải danh sách nhân viên');
    }
  },

  getById: async (id: number): Promise<Staff> => {
    try {
      const response = await axiosClient.get(`${API_URL}/${id}`);
      return mapToStaff(response.data);
    } catch (error) {
      console.error('Lỗi khi tải thông tin nhân viên:', error);
      throw new Error('Không thể tải thông tin nhân viên');
    }
  },

  create: async (request: StaffRequest): Promise<Staff> => {
    try {
      const roleName = request.roleNames[0]?.replace('ROLE_', '') || 'STAFF';
      
      const registerRequest = {
        username: request.username,
        password: request.passwordHash || '123456', // Mật khẩu mặc định
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        roleName: roleName // Gửi không có tiền tố ROLE_
      };

      const response = await axiosClient.post(`${AUTH_API_URL}/register/employee`, registerRequest);
      console.log('Phản hồi tạo nhân viên:', response.data);

      return mapToStaff({
        ...response.data,
        roleName: roleName
      });
    } catch (error: unknown) {
      console.error('Lỗi khi tạo nhân viên:', error);
      
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
      console.log('=== Bắt đầu cập nhật nhân viên ===');
      console.log('ID nhân viên cập nhật:', id);
      console.log('Yêu cầu cập nhật:', request);
      console.log('Roles hiện tại:', request.roleNames);
      
      // Kiểm tra role
      const roleName = request.roleNames[0];
      if (!roleName) {
        throw new Error('Role là bắt buộc');
      }
      console.log('Role sẽ cập nhật thành:', roleName);

      // Chuẩn bị dữ liệu với role đã được xử lý
      const strippedRole = roleName.replace('ROLE_', '').toUpperCase();
      console.log('Đang xử lý role cho cập nhật:', { 
        roleGốc: roleName, 
        roleSauXửLý: strippedRole 
      });
      
      const updateRequest = {
        username: request.username,
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        status: request.status,
        roleNames: [strippedRole]  // BE expects an array of roles without prefix and uppercase
      };

      console.log('Dữ liệu cập nhật sẽ gửi đến BE:', updateRequest);
      console.log('Endpoint cập nhật:', `${API_URL}/${id}`);
      
      // Kiểm tra role hiện tại
      const currentStaff = await axiosClient.get(`${API_URL}/${id}`);
      console.log('Thông tin nhân viên trước khi cập nhật:', currentStaff.data);
      
      // Gửi yêu cầu cập nhật
      const response = await axiosClient.put(`${API_URL}/${id}`, updateRequest);
      console.log('Phản hồi từ BE:', response.data);
      console.log('Trạng thái phản hồi:', response.status);

      if (!response.data) {
        throw new Error('Không nhận được phản hồi từ server');
      }

      // Kiểm tra lại sau khi cập nhật
      const verifyResponse = await axiosClient.get(`${API_URL}/${id}`);
      console.log('Kết quả kiểm tra sau cập nhật:', verifyResponse.data);

      // Trích xuất và chuẩn hóa role từ phản hồi
      let updatedRole = verifyResponse.data?.roleName || 
                       verifyResponse.data?.roles?.[0]?.roleName;
                       
      console.log('Kiểm tra role:', {
        roleNhậnĐược: updatedRole,
        roleMongĐợi: strippedRole
      });
      
      // Chuẩn hóa role để so sánh
      const normalizedUpdatedRole = (updatedRole || '').replace('ROLE_', '').toUpperCase();
      const normalizedExpectedRole = strippedRole.toUpperCase();
      
      if (!updatedRole || normalizedUpdatedRole !== normalizedExpectedRole) {
        console.error('Role không khớp sau khi cập nhật:', {
          roleMongĐợi: normalizedExpectedRole,
          roleNhậnĐược: normalizedUpdatedRole,
          roleGốcNhậnĐược: updatedRole
        });
        throw new Error('Cập nhật role không thành công, vui lòng thử lại');
      }

      console.log('=== Kết thúc cập nhật nhân viên - Thành công ===');

      // Chuyển đổi phản hồi và đảm bảo định dạng role đúng
      return mapToStaff({
        ...response.data,
        roleName: roleName // Thêm lại tiền tố ROLE_ trong phản hồi
      });
    } catch (error: unknown) {
      console.error('Lỗi khi cập nhật nhân viên:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number, data?: { error?: string; trace?: string; message?: string } } };
        
        console.log('Phản hồi lỗi:', axiosError.response?.data);
        
        if (axiosError.response?.status === 405) {
          throw new Error('Phương thức HTTP không được phép. Vui lòng kiểm tra cấu hình API.');
        }
        
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
      console.log('=== Bắt đầu cập nhật trạng thái tài khoản ===');
      console.log('ID nhân viên:', id);
      console.log('Trạng thái mới:', status);
      
      // Gửi PATCH request với status là query parameter
      const response = await axiosClient.patch(
        `${API_URL}/${id}/status?status=${status}`, 
        null // không cần body vì status đã ở trong query parameter
      );

      console.log('Phản hồi từ server:', response.data);
      
      // Kiểm tra kết quả
      const updatedStaff = mapToStaff(response.data);
      if (updatedStaff.status !== status) {
        console.error('Trạng thái không khớp sau khi cập nhật:', {
          yêuCầu: status,
          nhậnĐược: updatedStaff.status
        });
        throw new Error('Không thể cập nhật trạng thái tài khoản, vui lòng thử lại');
      }

      console.log('=== Kết thúc cập nhật trạng thái tài khoản - Thành công ===');
      
      return updatedStaff;
    } catch (error: unknown) {
      console.error('Lỗi khi cập nhật trạng thái tài khoản:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number, data?: { message?: string } } };
        
        if (axiosError.response?.status === 405) {
          throw new Error('Phương thức HTTP không được phép. Vui lòng kiểm tra cấu hình API.');
        }
        
        if (axiosError.response?.status === 401) {
          throw new Error('Bạn không có quyền thực hiện thao tác này.');
        }
        
        if (axiosError.response?.status === 404) {
          throw new Error('Không tìm thấy tài khoản nhân viên.');
        }

        throw new Error(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản');
      }
      
      throw new Error('Không thể cập nhật trạng thái tài khoản');
    }
  },

  toggleStatus: async (id: number): Promise<Staff> => {
    try {
      console.log('Đang thay đổi trạng thái tài khoản nhân viên có ID:', id);
      
      // Lấy thông tin nhân viên hiện tại để biết trạng thái hiện tại
      const currentStaff = await staffApi.getById(id);
      const newStatus = !currentStaff.status;
      
      const response = await axiosClient.patch(`${API_URL}/${id}/status`, {
        status: newStatus
      });
      
      console.log('Kết quả thay đổi trạng thái:', response.data);
      
      // Chuyển đổi và trả về thông tin nhân viên đã cập nhật
      return mapToStaff(response.data);
    } catch (error: unknown) {
      console.error('Lỗi khi thay đổi trạng thái tài khoản:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
        
        if (axiosError.response?.data?.error === 'ACCOUNT_IN_USE') {
          throw new Error('Không thể vô hiệu hóa tài khoản này vì đang được sử dụng trong hệ thống.');
        }
        
        throw new Error(axiosError.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản');
      }
      
      throw new Error('Không thể thay đổi trạng thái tài khoản');
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
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }
      const data = await response.json();
      return data.map(mapToStaff);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm nhân viên:', error);
      throw new Error('Không thể tìm kiếm nhân viên');
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
          // Username chưa tồn tại
          return false;
        }
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }
      // Username đã tồn tại
      return true;
    } catch (error) {
      console.error('Lỗi khi kiểm tra username:', error);
      throw new Error('Không thể kiểm tra username');
    }
  }
};
