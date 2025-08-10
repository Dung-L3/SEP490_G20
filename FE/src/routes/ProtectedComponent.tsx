import { type ComponentType } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedComponentProps {
  Component: ComponentType;
  requiredRole: string;
}

export const ProtectedComponent = ({ Component, requiredRole }: ProtectedComponentProps) => {
  const userRole = localStorage.getItem('userRole');
  
  console.warn('Protected Component Check:');
  console.warn('Current Role:', userRole);
  console.warn('Required Role:', requiredRole);

  if (!userRole) {
    console.warn('No role found - redirecting to login');
    alert('Vui lòng đăng nhập để truy cập trang này');
    return <Navigate to="/login" replace />;
  }

  if (userRole !== requiredRole) {
    console.warn('Access denied:', { current: userRole, required: requiredRole });
    alert(`Bạn không có quyền truy cập. Trang này chỉ dành cho ${requiredRole}`);
    return <Navigate to="/" replace />;
  }

  console.warn('Access granted');
  return <Component />;
};