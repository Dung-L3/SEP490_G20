import axiosClient from './axiosClient';

interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  roleName?: string;
}

export async function registerEmployeeApi(data: RegisterRequest) {
  try {
    const requestData = {
      ...data,
      roleName: data.roleName // Đã được format trong StaffAddModal
    };

    const response = await axiosClient.post('/auth/register/employee', requestData);
    return response.data;
  } catch (error) {
    console.error('Error registering employee:', error);
    throw error;
  }
}

export async function registerCustomerApi(data: RegisterRequest) {
  try {
    const requestData = {
      ...data,
      roleName: 'CUSTOMER'  // Backend sẽ thêm prefix ROLE_ nếu cần
    };

    const response = await axiosClient.post('/auth/register/customer', requestData);
    return response.data;
  } catch (error) {
    console.error('Error registering customer:', error);
    throw error;
  }
}
