import { type ComponentType } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '../config/roleConfig';
import { canAccessPath } from '../config/roleConfig';

interface ProtectedComponentProps {
  Component: ComponentType;
  requiredRole: Role;
}

export const ProtectedComponent = ({ Component, requiredRole }: ProtectedComponentProps) => {
  const userRole = localStorage.getItem('userRole') as Role | null;
  const location = useLocation();
  
  console.warn('Protected Component Check:');
  console.warn('Current Role:', userRole);
  console.warn('Required Role:', requiredRole);
  console.warn('Current Path:', location.pathname);

  if (!userRole) {
    console.warn('No role found - redirecting to login');
    alert('Vui lòng đăng nhập để truy cập trang này');
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra quyền truy cập dựa trên role và đường dẫn
  const hasAccess = canAccessPath(userRole, location.pathname);
  
  if (!hasAccess) {
    console.warn('Access denied:', { current: userRole, required: requiredRole, path: location.pathname });
    alert(`Bạn không có quyền truy cập trang này.`);
    return <Navigate to="/" replace />;
  }

  console.warn('Access granted');
  return <Component />;
};