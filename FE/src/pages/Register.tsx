import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword || !fullName || !phone) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Số điện thoại phải đủ 10 số.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setError('');
    alert('Đăng ký thành công! (Demo)');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-700">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Đăng ký</h2>
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Họ và tên</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Số điện thoại</label>
            <input
              type="tel"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              maxLength={11}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg transition-colors text-lg shadow"
          >
            Đăng ký
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
