// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập email.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Gửi yêu cầu thất bại');
      // Next: chuyển qua trang VerifyOTP, giữ email trong state
      navigate('/verify-otp', { state: { email } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
    } finally {
      setSending(false);
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
            Quên mật khẩu
          </h2>
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          <div className="mb-6">
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className={`w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg transition-colors text-lg shadow ${
              sending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {sending ? 'Đang gửi...' : 'Gửi mã OTP'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
