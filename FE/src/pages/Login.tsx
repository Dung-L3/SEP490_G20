import Header from '../components/Header';
import { loginApi } from '../api/authApi';
import Footer from '../components/Footer';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { username });
      const res = await loginApi({ username, password });
      console.log('Server response:', res);
      
      if (!res || !res.token) {
        throw new Error('Không nhận được token từ server');
      }

      // Thực hiện login
      try {
        login(username, res.role);

        // Kiểm tra dữ liệu đã được lưu
        const savedData = {
          token: localStorage.getItem('token'),
          currentUser: localStorage.getItem('currentUser'),
          userRole: localStorage.getItem('userRole'),
          isAuthenticated: localStorage.getItem('isAuthenticated')
        };

        console.log('Saved authentication data:', savedData);

        if (!savedData.token || !savedData.currentUser || !savedData.userRole) {
          throw new Error('Lưu thông tin đăng nhập thất bại');
        }

        // Điều hướng dựa trên role
        const role = savedData.userRole.toUpperCase();
        console.log('Redirecting with role:', role);

        switch(role) {
          case 'ROLE_MANAGER':
          case 'MANAGER':
            window.location.href = '/manager';
            break;
          case 'ROLE_WAITER':
          case 'WAITER':
            window.location.href = '/waiter/orders';
            break;
          case 'ROLE_CHEF':
          case 'CHEF':
            window.location.href = '/chef';
            break;
          case 'ROLE_RECEPTIONIST':
          case 'RECEPTIONIST':
            window.location.href = '/receptionist';
            break;
          case 'ROLE_CUSTOMER':
          case 'CUSTOMER':
            window.location.href = '/';
            break;
          default:
            throw new Error(`Role không hợp lệ: ${role}`);
        }
      } catch (error) {
        throw new Error('Xử lý đăng nhập thất bại: ' + (error as Error).message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError((error as Error).message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-700">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Đăng nhập</h2>
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg transition-colors text-lg shadow mb-4"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          <div className="text-center">
            <span className="text-gray-300 mr-2">Chưa có tài khoản?</span>
            <a href="/register" className="text-yellow-400 hover:underline font-semibold">Đăng ký</a>
          </div>
          <div className="text-center">
            <a href="/forgot-password" className="text-yellow-400 hover:underline font-semibold">Quên mật khẩu</a>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
