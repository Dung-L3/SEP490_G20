export const DB_ROLES = {
    MANAGER: 'Manager',
    WAITER: 'Waiter',
    CHEF: 'Chef',
    RECEPTIONIST: 'Receptionist'
} as const;

export type UserRole = typeof DB_ROLES[keyof typeof DB_ROLES];

export const isValidRole = (role: string): role is UserRole => {
    return Object.values(DB_ROLES).includes(role as UserRole);
};