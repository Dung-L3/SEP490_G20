import axiosClient from './axiosClient';

interface LoginResponse {
  withCredentials: true,                
  mess: string;
  role: string;
  token?: string;
  username?: string;
}

export async function loginApi(data: { username: string; password: string }): Promise<LoginResponse> {
  try {
    console.log('Login request data:', data);
    
    // Sử dụng axiosClient thay vì fetch trực tiếp
    const response = await axiosClient.post('/auth/login', data, { withCredentials: true });
    
    console.log('Raw response:', response.data);

    const result = response.data as LoginResponse;

    // Kiểm tra response
    if (!result.mess || !result.role) {
      console.error('Invalid response format:', result);
      throw new Error('Phản hồi không hợp lệ từ server');
    }

    if (result.mess === 'Tài khoản của bạn đã bị vô hiệu hóa') {
      throw new Error('Tài khoản của bạn đã bị vô hiệu hóa');
    }

    if (result.mess !== 'Đăng nhập thành công') {
      throw new Error(result.mess);
    }

    // Tạo token từ username để lưu trữ phiên đăng nhập
    const token = btoa(data.username + ':' + new Date().getTime());

    // Xóa data cũ trước khi lưu mới
    localStorage.clear();
    
    // Lưu thông tin mới
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', data.username);
    localStorage.setItem('userRole', result.role);
    localStorage.setItem('isAuthenticated', 'true');
    
    console.log('Auth data saved:', {
      username: data.username,
      role: result.role,
      isAuthenticated: true,
      message: result.mess
    });

    return {
      ...result,
      token, // Thêm token vào response để các component khác có thể sử dụng
      username: data.username
    };
  } catch (error: any) {
    console.error('Login process error:', error);
    
    // Xử lý lỗi từ response
    if (error.response) {
      const errorMessage = error.response.data?.mess || error.response.data?.message || 'Đăng nhập thất bại';
      throw new Error(errorMessage);
    }
    
    // Nếu là lỗi từ việc kiểm tra response format
    if (error.message) {
      throw error;
    }
    
    // Xử lý lỗi mạng hoặc lỗi khác
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
  }
}
