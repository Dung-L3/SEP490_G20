import type { Staff, StaffRequest } from '../types/Staff';

const API_URL = '/api/users';
const AUTH_API_URL = '/api/auth';

interface StaffResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  status: boolean;
  roles: Array<{roleName: string}>;
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
    roleNames: data.roles?.map(role => role.roleName) || []
  };
};

export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    try {
      const response = await fetch(`${API_URL}/getAllStaffs`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('Expected array of staff but got:', data);
        return [];
      }
      return data.map(item => mapToStaff(item));
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw new Error('Failed to fetch staff list');
    }
  },

  getById: async (id: number): Promise<Staff> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return mapToStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw new Error('Failed to fetch staff details');
    }
  },

  create: async (request: StaffRequest): Promise<Staff> => {
    try {
      // Check if username exists first
      const usernameExists = await staffApi.checkUsernameExists(request.username);
      if (usernameExists) {
        throw new Error('Username đã tồn tại');
      }

      // Convert StaffRequest to RegisterRequest format
      const registerRequest = {
        username: request.username,
        password: request.passwordHash || '123456', // Default password if not provided
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        status: request.status,
        roleNames: request.roleNames
      };

      const response = await fetch(`${AUTH_API_URL}/register/employee`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerRequest)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error === 'Internal Server Error' && errorJson.trace.includes('Username đã tồn tại')) {
            throw new Error('Username đã tồn tại');
          }
        } catch {
          // If can't parse JSON, just use the original error
        }
        throw new Error(`Lỗi tạo nhân viên: ${response.status}`);
      }

      const data = await response.json();
      // Since the API returns RegisterRequest, we need to construct Staff object
      return {
        id: data.id || 0,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        status: data.status ?? false,
        roleNames: data.roleNames || []
      };
    } catch (error) {
      console.error('Error creating staff:', error);
      // Pass through the specific error message if it exists
      throw new Error(error instanceof Error ? error.message : 'Failed to create staff');
    }
  },

  update: async (id: number, request: StaffRequest): Promise<Staff> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return mapToStaff(data);
    } catch (error) {
      console.error('Error updating staff:', error);
      throw new Error('Failed to update staff');
    }
  },

  updateStatus: async (id: number, status: boolean): Promise<Staff> => {
    try {
      const response = await fetch(`${API_URL}/${id}/status?status=${status}`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return mapToStaff(data);
    } catch (error) {
      console.error('Error updating staff status:', error);
      throw new Error('Failed to update staff status');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw new Error('Failed to delete staff');
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
