// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState<string | null>(null); // NEW: lỗi định dạng email
  const [error, setError] = useState('');                         // NEW: lỗi trả về từ server / general
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  // RFC5322-lite: cho phép + . _ - trong local-part; yêu cầu có domain và TLD >= 2 ký tự
  const EMAIL_RE =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

  const validateEmail = (raw: string): string | null => {
    const v = raw.trim();
    if (!v) return 'Vui lòng nhập email.';
    if (v.length > 254) return 'Email quá dài.';
    if (!EMAIL_RE.test(v)) return 'Email không hợp lệ. Ví dụ: name@example.com';
    return null;
  };

  const parseServerError = (status: number, body: unknown): string => {
    const text =
      typeof body === 'string'
        ? body
        : (body as any)?.message ||
          (body as any)?.error ||
          JSON.stringify(body);

    // Map các HTTP status thường gặp từ BE
    if (status === 404) return 'Email không tồn tại trong hệ thống.';
    if (status === 409) {
      // ví dụ: đã gửi OTP gần đây, email trùng yêu cầu
      if (/otp|already|exists|duplicate|sent/i.test(text))
        return 'Mã OTP đã được gửi gần đây. Vui lòng kiểm tra email hoặc thử lại sau.';
      return 'Yêu cầu không hợp lệ (409).';
    }
    if (status === 429) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.';
    if (status === 400 || status === 422) {
      // BE có thể trả thông điệp cụ thể về email
      if (/email/i.test(text)) return text;
      return 'Dữ liệu gửi lên không hợp lệ.';
    }
    return text || `Gửi yêu cầu thất bại (${status}).`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate client
    const vErr = validateEmail(email);
    setEmailErr(vErr);
    if (vErr) return;

    const normalizedEmail = email.trim().toLowerCase();

    setSending(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!res.ok) {
        // cố đọc JSON, fallback text
        let body: unknown = '';
        try {
          const txt = await res.text();
          body = txt ? JSON.parse(txt) : '';
        } catch {
          // body đã là text hoặc rỗng
        }
        const friendly = parseServerError(res.status, body);
        setError(friendly);
        return;
      }

      // Ok -> chuyển sang reset
      navigate('/reset-password', { state: { email: normalizedEmail } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Không thể kết nối máy chủ.');
    } finally {
      setSending(false);
    }
  };

  const onEmailChange = (val: string) => {
    setEmail(val);
    // validate “as-you-type” nhẹ nhàng (chỉ khi đã có lỗi trước đó)
    if (emailErr) setEmailErr(validateEmail(val));
    if (error) setError(''); // clear lỗi server khi người dùng chỉnh sửa
  };

  const onEmailBlur = () => {
    setEmailErr(validateEmail(email));
  };

  const isSubmitDisabled = !!emailErr || !email.trim() || sending;

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
            Quên mật khẩu
          </h2>

          {/* Lỗi server/general */}
          {error && (
            <div className="mb-4 text-red-500 text-center" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              className={`w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 border ${
                emailErr ? 'border-red-500' : 'border-transparent'
              }`}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onBlur={onEmailBlur}
              aria-invalid={!!emailErr}
              aria-describedby={emailErr ? 'email-error' : undefined}
              autoFocus
            />
            {emailErr && (
              <p id="email-error" className="mt-1 text-sm text-red-400">
                {emailErr}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg transition-colors text-lg shadow ${
              isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : ''
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
