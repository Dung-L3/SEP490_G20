import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: chỉ kiểm tra không rỗng, không thực hiện xác thực thực tế
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setError('');
    localStorage.setItem('currentUser', username);
    alert('Đăng nhập thành công!');
    navigate('/');
    // Có thể chuyển hướng hoặc lưu trạng thái đăng nhập ở đây
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
          >
            Đăng nhập
          </button>
          <div className="text-center">
            <span className="text-gray-300 mr-2">Chưa có tài khoản?</span>
            <a href="/register" className="text-yellow-400 hover:underline font-semibold">Đăng ký</a>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
