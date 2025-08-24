import { type ComponentType } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '../config/roleConfig';
import { canAccessPath } from '../config/roleConfig';
import { useAuth } from '../hooks/useAuth';

interface ProtectedComponentProps {
  Component: ComponentType;
  requiredRole: Role;
}

export const ProtectedComponent = ({ Component, requiredRole }: ProtectedComponentProps) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  
  console.warn('Protected Component Check:', {
    path: location.pathname,
    isAuthenticated,
    userRole,
    requiredRole
  });

  // Kiểm tra đăng nhập
  if (!isAuthenticated) {
    console.warn('Authentication required - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền truy cập dựa trên role và đường dẫn
  const hasAccess = userRole && canAccessPath(userRole, location.pathname);
  
  if (!hasAccess) {
    console.warn('Access denied:', { 
      current: userRole, 
      required: requiredRole, 
      path: location.pathname 
    });
    alert('Bạn không có quyền truy cập trang này');
    return <Navigate to="/" replace />;
  }

  console.warn('Access granted');
  return <Component />;
};