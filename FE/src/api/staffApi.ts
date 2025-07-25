import axios, { type AxiosError } from "axios";
import type { Staff, StaffRequest } from '../types/Staff';

interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  status: boolean;
  roles: {
    roleName: string;
  }[];
}

const BASE_URL = 'http://localhost:8080/api/users';

// axios instance with common config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Handle axios error responses
interface SpringBootErrorResponse {
  message?: string;
  error?: string;
  trace?: string;
}

const handleError = (error: Error | AxiosError) => {
  if (axios.isAxiosError(error)) {
    // Get detailed error message from Spring Boot error response
    const springBootError = error.response?.data as SpringBootErrorResponse;
    const message = springBootError?.message || 
      springBootError?.error ||
      (springBootError?.trace?.includes('DataIntegrityViolationException') ? 
        'Lỗi dữ liệu: Thông tin không hợp lệ hoặc bị trùng lặp' : 
        'Lỗi từ máy chủ');
    throw new Error(message);
  }
  throw error;
};export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    try {
      console.log('Calling staff API...');
      const response = await fetch(BASE_URL, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Raw response:', text);

      let users: UserResponse[];
      try {
        users = JSON.parse(text);
        if (!Array.isArray(users)) {
          console.error('Expected array but got:', typeof users);
          return [];
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return [];
      }

      console.log('Got users:', users.length);
      
      // Log roles for debugging
      users.forEach(user => {
        console.log(`User ${user.username} roles:`, user.roles);
      });
      
      const result = users.map(user => {
        try {
          // Basic validation
          if (!user || typeof user !== 'object') {
            console.error('Invalid user data:', user);
            return null;
          }

          console.log('Processing user:', user);

          // Extract basic user data with type checking and use UserResponse type
          const processedUser = {
            id: user.id || 0,
            username: user.username || '',
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            status: user.status ?? false,
            roleNames: user.roles?.map(role => role.roleName) || []
          };

          console.log('Successfully processed user:', processedUser);
          return processedUser;
        } catch (error) {
          console.error('Error processing user:', user, error);
          return null;
        }
      }).filter((user): user is Staff => user !== null);

      console.log('Final result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw handleError(error as Error | AxiosError);
    }
  },

  getById: async (id: number): Promise<Staff> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Raw response for getById:', text);

      let user: UserResponse;
      try {
        user = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse user data');
      }

      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roleNames: user.roles.map(role => role.roleName)
      };
    } catch (error) {
      console.error('Error fetching staff by id:', error);
      throw handleError(error as Error | AxiosError);
    }
  },

  create: async (staff: StaffRequest): Promise<Staff> => {
    try {
      const staffWithPassword = {
        ...staff,
        password: '123456' // Default password for new staff
      };

      const response = await api.post<UserResponse>('', staffWithPassword);
      const user = response.data;
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roleNames: user.roles.map(role => role.roleName)
      };
    } catch (error) {
      console.error('Error creating staff:', error);
      throw handleError(error as Error | AxiosError);
    }
  },

  update: async (id: number, staff: StaffRequest): Promise<Staff> => {
    try {
      const response = await api.put<UserResponse>(`/${id}`, staff);
      const user = response.data;
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roleNames: user.roles.map(role => role.roleName)
      };
    } catch (error) {
      console.error('Error updating staff:', error);
      throw handleError(error as Error | AxiosError);
    }
  },

  updateStatus: async (id: number, status: boolean): Promise<Staff> => {
    try {
      const response = await api.patch<UserResponse>(`/${id}/status?status=${status}`);
      const user = response.data;
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roleNames: user.roles.map(role => role.roleName)
      };
    } catch (error) {
      console.error('Error updating status:', error);
      throw handleError(error as Error | AxiosError);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/${id}`);
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw handleError(error as Error | AxiosError);
    }
  },

  searchByName: async (name: string): Promise<Staff[]> => {
    try {
      const response = await api.get<UserResponse[]>(`/search?name=${encodeURIComponent(name)}`);
      return response.data.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roleNames: user.roles.map(role => role.roleName)
      }));
    } catch (error) {
      console.error('Error searching staff:', error);
      throw handleError(error as Error | AxiosError);
    }
  },

  checkUsernameExists: async (username: string): Promise<boolean> => {
    try {
      const response = await api.get<boolean>(`/exists?username=${encodeURIComponent(username)}`);
      return response.data;
    } catch (error) {
      console.error('Error checking username:', error);
      throw handleError(error as Error | AxiosError);
    }
  }
};
