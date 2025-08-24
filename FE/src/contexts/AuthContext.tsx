import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  currentUser: string | null;
  userRole: string | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: string | null) => void;
  login: (user: string, role: string) => void;
  logout: () => void;
  checkAccess: (requiredRole: string, path: string) => boolean;
}

// Khởi tạo với giá trị từ localStorage nếu có
const getInitialAuthState = () => ({
  currentUser: localStorage.getItem('currentUser'),
  userRole: localStorage.getItem('userRole'),
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true'
});

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Khởi tạo state với giá trị từ localStorage
  const initialState = getInitialAuthState();
  const [currentUser, setCurrentUser] = useState<string | null>(initialState.currentUser);
  const [userRole, setUserRole] = useState<string | null>(initialState.userRole);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialState.isAuthenticated);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('currentUser');
        const role = localStorage.getItem('userRole');
        const isAuth = localStorage.getItem('isAuthenticated');

        console.log('Auth status check:', { token, user, role, isAuth });

        // Nếu đang ở trang login
        if (window.location.pathname === '/login') {
          // Nếu đã đăng nhập, chuyển đến trang phù hợp
          if (token && user && role && isAuth === 'true') {
            console.log('User already logged in, redirecting...');
            setCurrentUser(user);
            setUserRole(role);
            setIsAuthenticated(true);

            const normalizedRole = role.toUpperCase();
            switch(normalizedRole) {
              case 'ROLE_MANAGER':
              case 'MANAGER':
                window.location.href = '/manager';
                break;
              case 'ROLE_CHEF':
              case 'CHEF':
                window.location.href = '/chef';
                break;
              case 'ROLE_WAITER':
              case 'WAITER':
                window.location.href = '/waiter/tables';
                break;
              case 'ROLE_RECEPTIONIST':
              case 'RECEPTIONIST':
                window.location.href = '/receptionist';
                break;
              default:
                console.log('Invalid role:', normalizedRole);
            }
          }
        } 
        // Nếu không ở trang login
        else {
          // Kiểm tra xem có đủ thông tin xác thực không
          if (token && user && role && isAuth === 'true') {
            console.log('Session valid, updating state');
            setCurrentUser(user);
            setUserRole(role);
            setIsAuthenticated(true);
          } else {
            console.log('Invalid session, redirecting to login');
            // Xóa toàn bộ thông tin xác thực
            const keysToRemove = ['currentUser', 'userRole', 'token', 'userId', 'role', 'user', 'auth', 'isAuthenticated'];
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            setCurrentUser(null);
            setUserRole(null);
            setIsAuthenticated(false);
            
            window.location.href = '/login';
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (user: string, role: string) => {
    console.log('Login called with:', { user, role });
    
    // Lưu thông tin vào localStorage
    try {
      localStorage.setItem('currentUser', user);
      localStorage.setItem('userRole', role);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Cập nhật state
      setCurrentUser(user);
      setUserRole(role);
      setIsAuthenticated(true);
      
      // Verify data was saved
      const savedData = {
        currentUser: localStorage.getItem('currentUser'),
        userRole: localStorage.getItem('userRole'),
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        token: localStorage.getItem('token')
      };
      
      console.log('Authentication data verification:', savedData);
      
      if (!savedData.currentUser || !savedData.userRole || !savedData.token) {
        throw new Error('Failed to save authentication data');
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    // Chỉ logout nếu đã đăng nhập trước đó
    if (isAuthenticated || currentUser || userRole) {
      // Xóa tất cả thông tin người dùng khỏi localStorage
      const keysToRemove = [
        'currentUser',
        'userRole',
        'token',
        'userId',
        'role',
        'user',
        'auth'
      ];
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      setCurrentUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      
      // Chỉ chuyển hướng nếu không đang ở trang login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  };

  const checkAccess = (requiredRole: string, path: string): boolean => {
    // Manager có thể truy cập tất cả các trang
    if (userRole === 'Manager') {
      return true;
    }

    // Kiểm tra role cụ thể với path
    if (userRole !== requiredRole) {
      return false;
    }

    // Kiểm tra path có phù hợp với role không
    const rolePathMap: { [key: string]: string[] } = {
      'Chef': ['/chef'],
      'Waiter': ['/waiter/orders', '/waiter/tables', '/waiter/order'],
      'Receptionist': ['/receptionist', '/receptionist/orders', '/receptionist/payment']
    };

    const allowedPaths = rolePathMap[requiredRole] || [];
    return allowedPaths.some(allowedPath => path.startsWith(allowedPath));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        userRole, 
        isAuthenticated,
        setCurrentUser, 
        login,
        logout,
        checkAccess 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
