export interface Staff {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  status: boolean;
  roleNames: string[];
}

export interface StaffRequest {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  status: boolean;
  passwordHash?: string;
  roleNames: string[];
}
