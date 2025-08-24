// src/pages/ResetPassword.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface LocationState { email: string; token: string; }

export default function ResetPassword() {
  const { state } = useLocation();
  const { email, token } = (state as LocationState) || {};
  const [newPass, setNewPass] = useState('');
  const [error, setError] = useState('');
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass) {
      setError('Vui lòng nhập mật khẩu mới.');
      return;
    }
    setError('');
    setResetting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, token, newPassword: newPass })
      });
      if (!res.ok) throw new Error('Đổi mật khẩu thất bại');
      // Thành công, chuyển về Login
      navigate('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit}
          className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-700"
        >
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
            Đặt lại mật khẩu
          </h2>
          <p className="text-gray-300 mb-4 text-center">
            Email: <span className="font-medium">{email}</span>
          </p>
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          <div className="mb-6">
            <label className="block text-gray-300 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={resetting}
            className={`w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg transition-colors text-lg shadow ${
              resetting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {resetting ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  )
}