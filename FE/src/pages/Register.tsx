import Header from '../components/Header';
import { registerCustomerApi } from '../api/registerApi';
import Footer from '../components/Footer';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    email: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: any = {};
    if (!fullName) errors.fullName = 'Vui lòng nhập họ và tên.';
    if (!email) errors.email = 'Vui lòng nhập email.';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) errors.email = 'Email không hợp lệ.';
    if (!phone) errors.phone = 'Vui lòng nhập số điện thoại.';
    else if (!/^\d{10}$/.test(phone)) errors.phone = 'Số điện thoại phải đủ 10 số.';
    if (!username) errors.username = 'Vui lòng nhập tên đăng nhập.';
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    }
    if (!confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    else if (password !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Vui lòng kiểm tra lại thông tin.');
      return;
    }
    setError('');
    registerCustomerApi({ 
      username, 
      password, 
      fullName, 
      email, 
      phone,
      roleName: 'customer' // Backend sẽ tự động set role là ROLE_CUSTOMER
    })
      .then(() => {
        alert('Đăng ký thành công!');
        navigate('/login');
      })
      .catch(err => {
        // Kiểm tra nếu có response từ server
        if (err.response?.data?.message) {
          const errorMessage = err.response.data.message;
          const newFieldErrors = { ...fieldErrors };

          // Kiểm tra email trùng
          if (errorMessage.includes('Email đã tồn tại')) {
            newFieldErrors.email = 'Email này đã được đăng ký';
          }

          // Kiểm tra username trùng
          if (errorMessage.includes('duplicate key') && errorMessage.includes('Users')) {
            newFieldErrors.username = 'Tên đăng nhập này đã tồn tại';
          }

          // Kiểm tra số điện thoại trùng
          if (errorMessage.includes('Số điện thoại đã tồn tại') || (errorMessage.includes('duplicate key') && errorMessage.includes('phone'))) {
            newFieldErrors.phone = 'Số điện thoại này đã được đăng ký';
          }

          setFieldErrors(newFieldErrors);
        }
        setError('Vui lòng kiểm tra lại thông tin đăng ký');
      });
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
              onChange={e => {
                const newFullName = e.target.value;
                setFullName(newFullName);
                // Xóa lỗi fullName nếu đã nhập
                if (newFullName.trim()) {
                  setFieldErrors(prev => ({ ...prev, fullName: '' }));
                }
              }}
              autoFocus
            />
            {fieldErrors.fullName && <div className="text-red-500 text-sm mt-1">{fieldErrors.fullName}</div>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={email}
              onChange={e => {
                const newEmail = e.target.value;
                setEmail(newEmail);
                // Chỉ xóa lỗi định dạng email, giữ nguyên lỗi trùng email
                const currentError = fieldErrors.email;
                if (currentError && currentError !== 'Email này đã được đăng ký') {
                  if (/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(newEmail)) {
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                  }
                }
              }}
              placeholder="Nhập email của bạn"
            />
            {fieldErrors.email && <div className="text-red-500 text-sm mt-1">{fieldErrors.email}</div>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Số điện thoại</label>
            <input
              type="tel"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={phone}
              onChange={e => {
                // Chỉ cho phép nhập số
                const value = e.target.value.replace(/[^0-9]/g, '');
                setPhone(value);
                // Chỉ xóa lỗi định dạng số điện thoại, giữ nguyên lỗi trùng
                const currentPhoneError = fieldErrors.phone;
                if (currentPhoneError && currentPhoneError !== 'Số điện thoại này đã được đăng ký') {
                  if (/^\d{10}$/.test(value)) {
                    setFieldErrors(prev => ({ ...prev, phone: '' }));
                  }
                }
              }}
              maxLength={10}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            {fieldErrors.phone && <div className="text-red-500 text-sm mt-1">{fieldErrors.phone}</div>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={username}
              onChange={e => {
                const newUsername = e.target.value;
                setUsername(newUsername);
                // Chỉ xóa lỗi trường trống, giữ nguyên lỗi trùng username
                const currentUsernameError = fieldErrors.username;
                if (currentUsernameError && currentUsernameError !== 'Tên đăng nhập này đã tồn tại') {
                  if (newUsername.trim()) {
                    setFieldErrors(prev => ({ ...prev, username: '' }));
                  }
                }
              }}
            />
            {fieldErrors.username && <div className="text-red-500 text-sm mt-1">{fieldErrors.username}</div>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={password}
              onChange={e => {
                const newPassword = e.target.value;
                setPassword(newPassword);
                // Xóa lỗi password nếu đủ 8 ký tự
                if (newPassword.length >= 8) {
                  setFieldErrors(prev => ({ ...prev, password: '' }));
                }
              }}
            />
            {fieldErrors.password && <div className="text-red-500 text-sm mt-1">{fieldErrors.password}</div>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={confirmPassword}
              onChange={e => {
                const newConfirmPassword = e.target.value;
                setConfirmPassword(newConfirmPassword);
                // Xóa lỗi confirmPassword nếu khớp với password
                if (newConfirmPassword === password) {
                  setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                }
              }}
            />
            {fieldErrors.confirmPassword && <div className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</div>}
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
