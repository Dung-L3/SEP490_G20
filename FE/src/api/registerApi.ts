export async function registerCustomerApi(data: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string;
}) {
  const res = await fetch('http://localhost:8080/api/auth/register/customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  let result = null;
  const text = await res.text();
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = {};
  }
  if (!res.ok) throw new Error(result?.message || 'Đăng ký thất bại');
  return result;
}
