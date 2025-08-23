// src/pages/ResetPassword.tsx
import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface LocationState { email?: string; token?: string; } // token = OTP

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { email: emailFromState, token: otpFromState } = (state as LocationState) || {};

  // ---- State ----
  const [email] = useState<string>(emailFromState?.trim().toLowerCase() || '');
  const [otp, setOtp] = useState<string>(otpFromState ?? '');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [sending, setSending] = useState(false);       // reset password
  const [resending, setResending] = useState(false);   // resend OTP
  const [error, setError] = useState('');              // lỗi tổng (server/general)
  const [info, setInfo] = useState('');                // thông báo (gửi lại OTP thành công, ...)

  // ---- Validate (client-side) ----
  const OTP_LEN = 6;
  const otpSanitize = (v: string) => v.replace(/\D/g, '').slice(0, OTP_LEN);
  const otpValid = useMemo(() => /^\d{6}$/.test(otp), [otp]);

  // Mật khẩu: tối thiểu 8, có chữ & số (tuỳ policy của bạn)
  const passValid = useMemo(() => {
    if (newPass.length < 8) return false;
    return true;
  }, [newPass]);

  const passMatch = newPass === confirmPass;

  const formValid = email && otpValid && passValid && passMatch && !sending;

  const parseServerError = (status: number, body: unknown): string => {
    const text =
      typeof body === 'string'
        ? body
        : (body as any)?.message ||
          (body as any)?.error ||
          JSON.stringify(body);

    // map lỗi thường gặp khi reset (OTP sai, hết hạn, token invalid)
    if (status === 400 || status === 401 || status === 403) {
      if (/otp|token|expired|invalid|not\s*match/i.test(text)) {
        return 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng nhập lại hoặc bấm "Gửi lại mã OTP".';
      }
      return text || `Yêu cầu không hợp lệ (${status}).`;
    }
    if (status === 404) return 'Không tìm thấy tài khoản với email này.';
    if (status === 429) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.';
    return text || `Đổi mật khẩu thất bại (${status}).`;
  };

  // ---- Handlers ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!formValid) {
      if (!email) return setError('Thiếu email. Vui lòng thực hiện lại từ bước Quên mật khẩu.');
      if (!otpValid) return setError('OTP phải gồm 6 chữ số.');
      if (!passValid) return setError('Mật khẩu tối thiểu 8 ký tự');
      if (!passMatch) return setError('Xác nhận mật khẩu không khớp.');
    }

    setSending(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          token: otp,             // BE của bạn đang nhận { email, token, newPassword }
          newPassword: newPass,
        }),
      });

      if (!res.ok) {
        // đọc text/JSON để map lỗi đẹp
        let body: unknown = '';
        try {
          const txt = await res.text();
          body = txt ? JSON.parse(txt) : '';
        } catch {
          // giữ nguyên body=''
        }
        const friendly = parseServerError(res.status, body);
        setError(friendly);
        return;
        // Lưu ý: KHÔNG điều hướng nếu OTP sai → người dùng sửa OTP tại đây luôn.
      }

      // Thành công
      navigate('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Thiếu email. Vui lòng thực hiện lại từ bước Quên mật khẩu.');
      return;
    }
    setError('');
    setInfo('');
    setResending(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        setError(txt || `Gửi lại OTP thất bại (${res.status}).`);
        return;
      }
      setInfo('Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setResending(false);
    }
  };

  // Nếu vào trang mà thiếu email → hướng dẫn quay lại
  if (!email) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Đặt lại mật khẩu</h2>
            <p className="text-gray-300 mb-6">
              Thiếu email. Vui lòng bắt đầu lại từ bước <span className="font-medium">Quên mật khẩu</span>.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg"
            >
              Quay lại Quên mật khẩu
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-700"
          noValidate
        >
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
            Đặt lại mật khẩu
          </h2>

          {/* Info + Error */}
          {info && <div className="mb-3 text-green-400 text-center">{info}</div>}
          {error && <div className="mb-3 text-red-500 text-center" role="alert">{error}</div>}

          {/* Email hiển thị (không sửa) */}
          <p className="text-gray-300 mb-4 text-center">
            Email: <span className="font-medium">{email}</span>
          </p>

          {/* OTP */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Mã OTP</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={OTP_LEN}
              value={otp}
              onChange={(e) => setOtp(otpSanitize(e.target.value))}
              className={`w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 border ${otp && !otpValid ? 'border-red-500' : 'border-transparent'}`}
              placeholder="Nhập 6 chữ số"
              autoFocus={!otpFromState}
            />
            {otp && !otpValid && (
              <p className="mt-1 text-sm text-red-400">OTP phải gồm đúng 6 chữ số.</p>
            )}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className={`mt-2 text-sm underline ${resending ? 'opacity-50 cursor-not-allowed' : 'text-yellow-400 hover:text-yellow-300'}`}
            >
              {resending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
            </button>
          </div>

          {/* New password */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              className={`w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 border ${newPass && !passValid ? 'border-red-500' : 'border-transparent'}`}
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
            />
            {newPass && !passValid && (
              <p className="mt-1 text-sm text-red-400">
                Mật khẩu tối thiểu 8 ký tự
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              className={`w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 border ${confirmPass && !passMatch ? 'border-red-500' : 'border-transparent'}`}
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="Nhập lại mật khẩu"
            />
            {confirmPass && !passMatch && (
              <p className="mt-1 text-sm text-red-400">Xác nhận mật khẩu không khớp.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!formValid}
            className={`w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg transition-colors text-lg shadow ${
              (!formValid || sending) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {sending ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
