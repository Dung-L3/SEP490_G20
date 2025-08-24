import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../config/roleConfig';

export const useAuth = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') as Role | null;

  useEffect(() => {
    const checkAuth = () => {
      if (!token || !userRole) {
        // Nếu không có token hoặc role, chuyển về trang login
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
      }
    };

    // Kiểm tra khi component mount
    checkAuth();

    // Thiết lập interval để kiểm tra định kỳ
    const interval = setInterval(checkAuth, 60000); // Kiểm tra mỗi phút

    // Thêm event listener để kiểm tra khi storage thay đổi
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'userRole') {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate, token, userRole]);

  return {
    isAuthenticated: !!token && !!userRole,
    token,
    userRole,
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      navigate('/login');
    }
  };
};
