export type Role = 'MANAGER' | 'CHEF' | 'WAITER' | 'RECEPTIONIST' | 'CUSTOMER';

// Định nghĩa các prefix path cho mỗi role
export const ROLE_PATH_PREFIXES: Record<Role, string> = {
  MANAGER: '/manager',
  CHEF: '/chef',
  WAITER: '/waiter',
  RECEPTIONIST: '/receptionist',
  CUSTOMER: '/menu'
};

export const ROLE_ACCESS_MAP: Record<Role, string[]> = {
  MANAGER: [
    '/manager/*',
    '/chef/*',
    '/waiter/*',
    '/receptionist/*'
  ],
  CHEF: [
    '/chef',
    '/chef/*'
  ],
  WAITER: [
    '/waiter',
    '/waiter/orders',
    '/waiter/tables',
    '/waiter/order/*'
  ],
  RECEPTIONIST: [
    '/receptionist',
    '/receptionist/orders',
    '/receptionist/takeaway',
    '/receptionist/reservations',
    '/receptionist/payment/*'
  ],
  CUSTOMER: [
    '/',
    '/menu',
    '/menu/*',
    '/profile',
    '/orders',
    '/cart'
  ]
};

/**
 * Kiểm tra xem một role có được phép truy cập một đường dẫn không
 */
export const canAccessPath = (role: Role, path: string): boolean => {
  // Chuẩn hóa role và đường dẫn
  const normalizedRole = role.toUpperCase().replace('ROLE_', '') as Role;
  const normalizedPath = path.toLowerCase();

  console.log('Checking path access:', {
    role: normalizedRole,
    path: normalizedPath
  });

  // 1. Kiểm tra xem path có bắt đầu bằng prefix của role không
  const rolePrefix = ROLE_PATH_PREFIXES[normalizedRole].toLowerCase();
  if (!normalizedPath.startsWith(rolePrefix)) {
    console.error('Path does not match role prefix:', {
      path: normalizedPath,
      rolePrefix,
      role: normalizedRole
    });
    return false;
  }

  // 2. Kiểm tra xem path có nằm trong khu vực của role khác không
  const isInOtherRoleArea = Object.entries(ROLE_PATH_PREFIXES)
    .some(([otherRole, prefix]) => {
      if (otherRole === normalizedRole) return false;
      return normalizedPath.startsWith(prefix.toLowerCase());
    });

  if (isInOtherRoleArea) {
    console.error('Path is in other role area:', {
      path: normalizedPath,
      role: normalizedRole
    });
    return false;
  }

  // 3. Kiểm tra quyền truy cập cụ thể từ ROLE_ACCESS_MAP
  const allowedPaths = ROLE_ACCESS_MAP[normalizedRole];
  if (!allowedPaths) {
    console.error('No paths configured for role:', normalizedRole);
    return false;
  }

  // 4. Với Manager, kiểm tra thêm điều kiện đặc biệt
  if (normalizedRole === 'MANAGER') {
    // Manager chỉ có thể truy cập các path hợp lệ đã được định nghĩa
    const allValidPaths = Object.values(ROLE_ACCESS_MAP).flat();
    const isValidPath = allValidPaths.some(allowedPath => {
      const pattern = allowedPath
        .replace(/:[^/]+/g, '[^/]+')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`, 'i');
      return regex.test(normalizedPath);
    });

    if (!isValidPath) {
      console.error('Invalid path for Manager:', normalizedPath);
      return false;
    }
    return true;
  }

  // 5. Kiểm tra path có match với bất kỳ pattern nào trong allowedPaths
  const hasAccess = allowedPaths.some(allowedPath => {
    const pattern = allowedPath
      .replace(/:[^/]+/g, '[^/]+') // Thay thế :param thành [^/]+
      .replace(/\*/g, '.*'); // Thay thế * thành .*
    const regex = new RegExp(`^${pattern}$`, 'i');
    const matches = regex.test(normalizedPath);

    console.log('Path pattern check:', {
      allowedPath,
      pattern,
      path: normalizedPath,
      matches
    });

    return matches;
  });

  if (!hasAccess) {
    console.error('Path not allowed for role:', {
      role: normalizedRole,
      path: normalizedPath,
      allowedPaths
    });
  }

  return hasAccess;
};
