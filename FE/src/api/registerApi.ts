interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  roleName?: string;
}

async function handleApiResponse(res: Response) {
  const text = await res.text();
  let result: any = {};
  
  try {
    if (text) {
      result = JSON.parse(text);
    }
  } catch (error) {
    console.error('Error parsing response:', error);
  }

  if (!res.ok) {
    console.error('API Error:', text);
    throw new Error(
      result?.message || 
      result?.error || 
      'Có lỗi xảy ra, vui lòng thử lại'
    );
  }

  return result;
}

export async function registerEmployeeApi(data: RegisterRequest) {
  const requestData = {
    ...data,
    roleName: data.roleName?.toUpperCase()
  };

  const res = await fetch('/api/auth/register/employee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });

  return handleApiResponse(res);
}

export async function registerCustomerApi(data: RegisterRequest) {
  const requestData = {
    ...data,
    roleName: 'CUSTOMER'  // Backend sẽ thêm prefix ROLE_ nếu cần
  };

  const res = await fetch('/api/auth/register/customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });

  return handleApiResponse(res);
}
