import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Role } from '../config/roleConfig';
import { canAccessPath } from '../config/roleConfig';

interface AuthContextType {
  currentUser: string | null;
  userRole: Role | null;
  isAuthenticated: boolean;
  login: (user: string, role: string) => void;
  logout: () => void;
  checkAccess: (requiredRole: Role, path: string) => boolean;
}

// Define valid roles
const VALID_ROLES = ['MANAGER', 'CHEF', 'WAITER', 'RECEPTIONIST', 'CUSTOMER'] as const;
type ValidRole = typeof VALID_ROLES[number];

// Chuẩn hóa role từ localStorage
const normalizeRole = (role: string | null): Role | null => {
  if (!role) return null;
  const normalized = role.toUpperCase().replace('ROLE_', '');
  if (!VALID_ROLES.includes(normalized as ValidRole)) {
    return null;
  }
  return normalized as Role;
};

// Khởi tạo với giá trị từ localStorage nếu có
const getInitialAuthState = () => ({
  currentUser: localStorage.getItem('currentUser'),
  userRole: normalizeRole(localStorage.getItem('userRole')),
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true'
});

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialState = getInitialAuthState();
  const [currentUser, setCurrentUser] = useState<string | null>(initialState.currentUser);
  const [userRole, setUserRole] = useState<Role | null>(initialState.userRole);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialState.isAuthenticated);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('currentUser');
      const role = localStorage.getItem('userRole');
      const isAuth = localStorage.getItem('isAuthenticated');
      const currentPath = window.location.pathname;

      console.log('Auth status check:', { token, user, role, isAuth, path: currentPath });

      // Kiểm tra các đường dẫn đặc biệt không yêu cầu auth
      if (/^\/menu\/\d+$/.test(currentPath)) {
        // QR Menu không yêu cầu xác thực
        return;
      }
      
      // Nếu đang ở trang login
      if (currentPath === '/login') {
        if (token && user && role && isAuth === 'true') {
          console.log('User already logged in, redirecting...');
          const normalizedRole = normalizeRole(role);
          
          if (!normalizedRole) {
            throw new Error('Invalid role: ' + role);
          }

          const defaultPaths: Record<Role, string> = {
            MANAGER: '/manager',
            CHEF: '/chef',
            WAITER: '/waiter/tables',
            RECEPTIONIST: '/receptionist/reservations',
            CUSTOMER: '/menu'
          };

          const defaultPath = defaultPaths[normalizedRole];
          if (!defaultPath) {
            throw new Error('Invalid role path for: ' + normalizedRole);
          }

          setCurrentUser(user);
          setUserRole(normalizedRole);
          setIsAuthenticated(true);
          window.location.href = defaultPath;
        }
        return;
      }

      // Danh sách các đường dẫn công khai
      const publicPaths = [
        '/login', 
        '/register', 
        '/forgot-password',
        '/',
        '/home',
        '/menu',
        '/booking'
      ];

      // Nếu đang ở trang công khai
      if (publicPaths.includes(currentPath)) {
        if (token && user && role && isAuth === 'true') {
          const normalizedRole = normalizeRole(role);
          if (normalizedRole) {
            setCurrentUser(user);
            setUserRole(normalizedRole);
            setIsAuthenticated(true);
          }
        }
        return;
      }

      // Kiểm tra xác thực cho các trang yêu cầu đăng nhập
      if (token && user && role && isAuth === 'true') {
        console.log('Session valid, checking role access');
        const normalizedRole = normalizeRole(role);
        if (!normalizedRole) {
          throw new Error('Invalid role in session: ' + role);
        }

        if (normalizedRole !== 'MANAGER' && normalizedRole !== 'CUSTOMER') {
          const currentRolePath = `/${normalizedRole.toLowerCase()}`;
          if (!currentPath.toLowerCase().startsWith(currentRolePath)) {
            console.warn('User attempting to access unauthorized area');
            const defaultPaths: Record<Role, string> = {
              MANAGER: '/manager',
              CHEF: '/chef',
              WAITER: '/waiter/tables',
              RECEPTIONIST: '/receptionist/reservations',
              CUSTOMER: '/menu'
            };

            const correctPath = defaultPaths[normalizedRole];
            alert(`Bạn không có quyền truy cập vào trang này. Đang chuyển hướng về trang ${normalizedRole.toLowerCase()}`);
            window.location.href = correctPath;
            return;
          }
        }

        setCurrentUser(user);
        setUserRole(normalizedRole);
        setIsAuthenticated(true);
      } else {
        console.log('Invalid session, redirecting to login');
        const keysToRemove = ['currentUser', 'userRole', 'token', 'userId', 'role', 'user', 'auth', 'isAuthenticated'];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        setCurrentUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
        
        if (!publicPaths.includes(currentPath) && !/^\/menu\/\d+$/.test(currentPath)) {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (user: string, role: string) => {
    console.log('Login called with:', { user, role });
    
    let finalRole = role.toUpperCase();
    if (!finalRole.startsWith('ROLE_')) {
      finalRole = `ROLE_${finalRole}`;
    }
    
    if (finalRole === 'ROLE_CUSTOMER') {
      localStorage.setItem('currentUser', user);
      localStorage.setItem('userRole', finalRole);
      localStorage.setItem('isAuthenticated', 'true');
      setCurrentUser(user);
      setUserRole('CUSTOMER');
      setIsAuthenticated(true);
      return;
    }
    
    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) {
      console.error('Validation failed for role:', { 
        original: role,
        normalized: normalizedRole,
        validRoles: VALID_ROLES
      });
      throw new Error('Invalid role: ' + role);
    }
    
    try {
      localStorage.setItem('currentUser', user);
      localStorage.setItem('userRole', finalRole);
      localStorage.setItem('isAuthenticated', 'true');
      
      setCurrentUser(user);
      setUserRole(normalizedRole);
      setIsAuthenticated(true);
      
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
    if (isAuthenticated || currentUser || userRole) {
      const keysToRemove = [
        'currentUser',
        'userRole',
        'token',
        'userId',
        'role',
        'user',
        'auth',
        'isAuthenticated'
      ];
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      setCurrentUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  };

  const checkAccess = (requiredRole: Role, path: string): boolean => {
    // QR Menu luôn cho phép truy cập
    if (/^\/menu\/\d+$/.test(path)) {
      return true;
    }

    const publicPaths = ['/', '/home', '/menu', '/login', '/register', '/forgot-password', '/booking'];
    
    if (publicPaths.includes(path)) {
      return true;
    }

    if (!userRole || !isAuthenticated) {
      return false;
    }

    console.log('Checking access:', {
      userRole,
      requiredRole,
      path,
      isAuthenticated
    });

    if (userRole === 'MANAGER') {
      return true;
    }

    if (!path.toLowerCase().startsWith(`/${userRole.toLowerCase()}`)) {
      console.warn('Path prefix mismatch:', {
        path,
        expectedPrefix: `/${userRole.toLowerCase()}`
      });
      return false;
    }

    if (userRole !== requiredRole) {
      console.warn('Role mismatch:', {
        userRole,
        requiredRole
      });
      return false;
    }

    const hasPathAccess = canAccessPath(userRole, path);
    
    console.log('Access check result:', {
      roleMatch: userRole === requiredRole,
      pathAccess: hasPathAccess
    });

    return hasPathAccess;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        userRole, 
        isAuthenticated,
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
