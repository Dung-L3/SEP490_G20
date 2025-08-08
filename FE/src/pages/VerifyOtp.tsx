// src/pages/VerifyOtp.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface LocationState { email: string; }

export default function VerifyOtp() {
  const { state } = useLocation();
  const { email } = (state as LocationState) || {};
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Vui lòng nhập OTP.');
      return;
    }
    setError('');
    setVerifying(true);
    // Chuyển qua ResetPassword, giữ email + token
    navigate('/reset-password', { state: { email, token } });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit}
          className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-700"
        >
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
            Nhập mã OTP
          </h2>
          <p className="text-gray-300 mb-4 text-center">
            Mã đã gửi tới: <span className="font-medium">{email}</span>
          </p>
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          <div className="mb-6">
            <label className="block text-gray-300 mb-1">OTP</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={token}
              onChange={e => setToken(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={verifying}
            className={`w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg transition-colors text-lg shadow ${
              verifying ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {verifying ? 'Đang xác thực...' : 'Xác thực OTP'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
