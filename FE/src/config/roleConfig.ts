export type Role = 'Manager' | 'Chef' | 'Waiter' | 'Receptionist';

export const ROLE_ACCESS_MAP = {
  Manager: ['*'], // Manager có thể truy cập tất cả các trang
  Chef: ['/chef'], // Chef chỉ có thể truy cập trang /chef
  Waiter: ['/waiter/orders', '/waiter/tables'], // Waiter chỉ có thể truy cập các trang /waiter/*
  Receptionist: [
    '/receptionist',
    '/receptionist/orders',
    '/receptionist/takeaway',
    '/receptionist/reservations',
    '/receptionist/:orderId/payment'
  ]
};

/**
 * Kiểm tra xem một role có được phép truy cập một đường dẫn không
 */
export const canAccessPath = (role: Role, path: string): boolean => {
  const allowedPaths = ROLE_ACCESS_MAP[role];
  
  // Manager có thể truy cập tất cả
  if (role === 'Manager') return true;
  
  // Các role khác chỉ có thể truy cập các đường dẫn được phép
  return allowedPaths.some(allowedPath => {
    // Chuyển đổi đường dẫn có tham số thành regex
    // Ví dụ: '/receptionist/:orderId/payment' -> /^\/receptionist\/[^/]+\/payment$/
    const pattern = allowedPath
      .replace(/:[^/]+/g, '[^/]+') // Thay thế :param bằng [^/]+
      .replace(/\*/g, '.*'); // Thay thế * bằng .*
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  });
};
