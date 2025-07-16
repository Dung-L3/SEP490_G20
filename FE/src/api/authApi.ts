export async function loginApi(data: { username: string; password: string }) {
  console.log('Login request data:', data);
  const res = await fetch('/api/auth/login', {
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
  console.log('Login response:', result);
  if (!res.ok) throw new Error(result?.message || 'Đăng nhập thất bại');
  return result;
}
