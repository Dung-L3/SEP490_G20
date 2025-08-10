export async function loginApi(data: { username: string; password: string }) {
  console.log('Login request data:', data);
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  let result = null;
  const text = await res.text();
  try {
    result = text ? JSON.parse(text) : {};
    // Ensure role is in correct format from database
    if (result.role) {
      result.role = result.role.toUpperCase();
      console.log('Normalized role:', result.role);
    }
  } catch {
    result = {};
  }
  console.log('Login response:', result);
  if (!res.ok) throw new Error(result?.message || 'Đăng nhập thất bại');
  return result;
}
