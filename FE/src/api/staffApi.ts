import { Staff, StaffRequest } from '../types/Staff';

const BASE_URL = 'http://localhost:8080/api/users';

// Common options for fetch requests
const headers = {
  'Content-Type': 'application/json'
};

// Handle API responses
const handleResponse = async (response: Response) => {
  try {
    const text = await response.text();
    console.log('Raw response:', text); // Log raw response for debugging
    
    if (!text) {
      console.error('Empty response from server');
      throw new Error('Phản hồi trống từ máy chủ');
    }

    try {
      const data = JSON.parse(text);
      
      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          data: data,
          url: response.url,
          statusText: response.statusText
        });

        // Extract detailed error message from Spring Boot error response
        const message = data?.message || data?.error || (
          data?.trace?.includes('DataIntegrityViolationException') ? 
          'Lỗi dữ liệu: Thông tin không hợp lệ hoặc bị trùng lặp' : 
          'Lỗi từ máy chủ'
        );
        throw new Error(message);
      }
      
      return data;
    } catch (parseError) {
      console.error('JSON Parse Error:', {
        error: parseError,
        rawResponse: text,
        responseStatus: response.status,
        url: response.url
      });
      throw new Error('Lỗi định dạng dữ liệu từ máy chủ');
    }
  } catch (error) {
    console.error('Response handling error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Lỗi không xác định khi xử lý phản hồi');
  }
};

export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    try {
      const response = await fetch(BASE_URL);
      const text = await response.text();

      // Try to parse the JSON manually to handle circular references
      try {
        const regex = /"id":\d+,"username":"[^"]+","passwordHash":"[^"]+","fullName":"[^"]+","email":"[^"]+","phone":"[^"]+","status":(true|false),"createdAt":"[^"]+","roles":\[/g;
        const matches = text.match(regex);
        
        if (!matches) {
          console.error('No valid user data found in response');
          return [];
        }

        // Extract user objects
        const users = matches.map(match => {
          const userJson = '{' + match.replace(/"roles":\[.*$/, '"roles":[]}');
          try {
            const user = JSON.parse(userJson);
            return {
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              email: user.email,
              phone: user.phone,
              status: user.status,
              roleNames: [] // We'll extract roles separately to avoid circular references
            };
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            return null;
          }
        }).filter(user => user !== null);

        // Extract role names for each user
        const roleRegex = /"roleName":"([^"]+)"/g;
        const roleMatches = [...text.matchAll(roleRegex)];
        const roleNames = [...new Set(roleMatches.map(match => match[1]))];

        // Add roles to users
        return users.map(user => ({
          ...user,
          roleNames: roleNames
        }));
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error instanceof Error ? error : new Error('Không thể kết nối đến máy chủ');
    }
  },

  getById: async (id: number): Promise<Staff> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching staff by id:', error);
      throw new Error('Không thể tải thông tin nhân viên');
    }
  },

  create: async (staff: StaffRequest): Promise<Staff> => {
    try {
      // Add a default password when creating a new staff member
      const staffWithPassword = {
        ...staff,
        password: '123456' // Default password for new staff
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(staffWithPassword)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating staff:', error);
      throw new Error('Không thể tạo nhân viên mới');
    }
  },

  update: async (id: number, staff: StaffRequest): Promise<Staff> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(staff)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating staff:', error);
      throw new Error('Không thể cập nhật thông tin nhân viên');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Không thể xóa nhân viên');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw new Error('Không thể xóa nhân viên');
    }
  },

  searchByName: async (name: string): Promise<Staff[]> => {
    try {
      const response = await fetch(`${BASE_URL}/search?name=${encodeURIComponent(name)}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error searching staff:', error);
      throw new Error('Không thể tìm kiếm nhân viên');
    }
  },

  checkUsernameExists: async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/exists?username=${encodeURIComponent(username)}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error checking username:', error);
      throw new Error('Không thể kiểm tra tên đăng nhập');
    }
  },

  updateStatus: async (id: number, status: boolean): Promise<Staff> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/status?status=${status}`, {
        method: 'PATCH'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating status:', error);
      throw new Error('Không thể cập nhật trạng thái');
    }
  }
};
