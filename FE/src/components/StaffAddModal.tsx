import React, { useState } from 'react';

interface StaffAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone: string;
    roleName: string;
  }) => Promise<void>;
}

export const StaffAddModal: React.FC<StaffAddModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    roleName: 'WAITER' // Default role
  });

  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const roles = [
    { value: 'ROLE_MANAGER', label: 'Quản lý' },
    { value: 'ROLE_WAITER', label: 'Phục vụ' },
    { value: 'ROLE_CHEF', label: 'Đầu bếp' },
    { value: 'ROLE_RECEPTIONIST', label: 'Thu ngân' }
  ];

  const validateField = (name: string, value: string) => {
    const errors: { [key: string]: string } = {};
    
    console.log(`Validating field ${name} with value:`, value);
    
    switch(name) {
      case 'password':
        // Always validate password if it's the password field
        if (!value) {
          errors.password = 'Vui lòng nhập mật khẩu';
        } else if (value.length < 8) {
          errors.password = `Mật khẩu phải có ít nhất 8 ký tự (hiện tại: ${value.length} ký tự)`;
          console.log('Password validation failed in validateField:', value);
        }
        break;
        
      case 'email':
        if (!value) {
          errors.email = 'Vui lòng nhập email';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.email = 'Email không hợp lệ';
          }
        }
        break;
        
      case 'phone':
        if (!value) {
          errors.phone = 'Vui lòng nhập số điện thoại';
        } else {
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(value)) {
            errors.phone = 'Số điện thoại phải có 10 chữ số';
          }
        }
        break;
    }
    
    console.log(`Validation result for ${name}:`, errors);
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log(`Field ${name} changed to: ${value}`); // Debug log
    
    // Update form data
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated form data:', newData); // Debug log
      return newData;
    });

    // Validate field immediately
    const fieldErrors = validateField(name, value);
    console.log(`Validation errors for ${name}:`, fieldErrors); // Debug log
    
    setValidationErrors(prev => {
      const newErrors = {
        ...prev,
        [name]: fieldErrors[name] || ''
      };
      console.log('Updated validation errors:', newErrors); // Debug log
      return newErrors;
    });
  };

  // Validate all fields before submit
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    // Check required fields first
    if (!formData.username) errors.username = 'Vui lòng nhập tên đăng nhập';
    if (!formData.password) errors.password = 'Vui lòng nhập mật khẩu';
    if (!formData.fullName) errors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.email) errors.email = 'Vui lòng nhập email';
    if (!formData.phone) errors.phone = 'Vui lòng nhập số điện thoại';

    // Password validation - always check length regardless of other errors
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      errors.password = `Mật khẩu phải có ít nhất 8 ký tự (hiện tại: ${formData.password.length} ký tự)`;
      console.log('Password validation failed in validateForm - Invalid length:', formData.password.length);
      // Return early with just the password error to ensure it's addressed first
      return { password: errors.password };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Vui lòng nhập email';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Số điện thoại phải có 10 chữ số';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({}); // Reset validation errors

    console.log('Form data before validation:', formData);

    // Kiểm tra ngay lập tức nếu mật khẩu không đủ 8 ký tự
    if (!formData.password || formData.password.length < 8) {
      const errorMsg = formData.password 
        ? `Mật khẩu phải có ít nhất 8 ký tự (hiện tại: ${formData.password.length} ký tự)`
        : 'Vui lòng nhập mật khẩu';
      console.log('Password validation failed:', errorMsg);
      setValidationErrors({ password: errorMsg });
      setError('Vui lòng kiểm tra lại mật khẩu');
      return;
    }

    // Step 2: Full form validation
    const formErrors = validateForm();
    console.log('Full form validation results:', formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      console.log('Form validation failed with errors:', formErrors);
      setValidationErrors(formErrors);
      setError('Vui lòng điền đầy đủ thông tin và sửa các lỗi');
      return;
    }

    // Double check password length as final validation
    if (formData.password.length < 8) {
      const errorMsg = `Mật khẩu phải có ít nhất 8 ký tự (hiện tại: ${formData.password.length} ký tự)`;
      console.log('Final password validation failed:', errorMsg);
      setValidationErrors(prev => ({
        ...prev,
        password: errorMsg
      }));
      setError('Vui lòng kiểm tra lại mật khẩu');
      return;
    }

    console.log('All validations passed, proceeding with submission');

    try {
      await onSave(formData);
      onClose();
      // Reset form
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        roleName: 'WAITER'
      });
    } catch (error: any) {
      console.error('Error saving staff:', error);
      
      // Handle specific error messages from backend
      if (error.message) {
        if (error.message.includes('Email đã tồn tại')) {
          setError('Email đã được sử dụng, vui lòng dùng email khác');
        } else if (error.message.includes('Tên đăng nhập đã tồn tại')) {
          setError('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác');
        } else if (error.message.includes('Số điện thoại đã tồn tại')) {
          setError('Số điện thoại đã được sử dụng');
        } else if (error.message.includes('Mật khẩu phải có ít nhất 8 ký tự')) {
          setError('Mật khẩu phải có ít nhất 8 ký tự');
        } else {
          setError(error.message);
        }
      } else {
        setError('Có lỗi xảy ra khi thêm nhân viên');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Thêm nhân viên mới</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${validationErrors.password ? 'border-red-500' : ''}`}
              required
              pattern=".{8,}"
              minLength={8}
              onInvalid={(e: React.InvalidEvent<HTMLInputElement>) => {
                e.preventDefault();
                setValidationErrors(prev => ({
                  ...prev,
                  password: 'Mật khẩu phải có ít nhất 8 ký tự'
                }));
              }}
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${validationErrors.email ? 'border-red-500' : ''}`}
              required
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${validationErrors.phone ? 'border-red-500' : ''}`}
              required
            />
            {validationErrors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.phone}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <select
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
