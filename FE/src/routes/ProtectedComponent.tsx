import { type ComponentType } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '../config/roleConfig';
import { canAccessPath } from '../config/roleConfig';
import { useAuth } from '../hooks/useAuth';

// Các đường dẫn không cần xác thực
const publicPaths = ['/', '/login', '/register', '/forgot-password', '/booking'];

// Kiểm tra xem một đường dẫn có phải là public path không
const isPublicMenuPath = (path: string): boolean => {
  // Cho phép truy cập /menu/:tableId (ví dụ: /menu/1, /menu/23, etc.)
  return /^\/menu\/\d+$/.test(path);
};

interface ProtectedComponentProps {
  Component: ComponentType;
  requiredRole: Role;
}

// Default paths cho mỗi role sau khi bị từ chối truy cập
const DEFAULT_PATHS: Record<Role, string> = {
  MANAGER: '/manager',
  CHEF: '/chef',
  WAITER: '/waiter/orders',
  RECEPTIONIST: '/receptionist',
  CUSTOMER: '/menu'
};

export const ProtectedComponent = ({ Component, requiredRole }: ProtectedComponentProps) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  
  // Cho phép truy cập các trang công khai mà không cần xác thực
  if (publicPaths.includes(location.pathname) || isPublicMenuPath(location.pathname)) {
    return <Component />;
  }

  console.warn('Protected Component Check:', {
    path: location.pathname,
    isAuthenticated,
    userRole,
    requiredRole
  });

  // Kiểm tra xác thực ngay lập tức
  if (!isAuthenticated || !userRole) {
    console.warn('Not authenticated - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Kiểm tra xem role của user có khớp với role yêu cầu không
  if (userRole !== requiredRole) {
    console.warn('Role mismatch:', { userRole, requiredRole });
    alert('Bạn không có quyền truy cập trang này');
    return <Navigate to={DEFAULT_PATHS[userRole]} replace />;
  }

  // 2. Kiểm tra xem đường dẫn hiện tại có thuộc về role không
  const currentPath = location.pathname.toLowerCase();
  const rolePrefix = `/${userRole.toLowerCase()}`;
  
  if (!currentPath.startsWith(rolePrefix)) {
    console.warn('Path prefix mismatch:', {
      currentPath,
      rolePrefix
    });
    alert('Bạn không có quyền truy cập trang này');
    return <Navigate to={DEFAULT_PATHS[userRole]} replace />;
  }

  // 3. Kiểm tra quyền truy cập chi tiết
  const hasPathAccess = canAccessPath(userRole, currentPath);

  if (!hasPathAccess) {
    console.warn('Access denied by canAccessPath:', {
      userRole,
      path: currentPath
    });
    alert('Bạn không có quyền truy cập trang này');
    return <Navigate to={DEFAULT_PATHS[userRole]} replace />;
  }

  console.warn('Access granted');
  return <Component />;
};