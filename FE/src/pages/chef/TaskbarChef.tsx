import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChefHat, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const chefMenu = [
  { label: 'Quản lý món', path: '/chef' },
];

const TaskbarChef: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    }
  };

  return (
    <aside className="bg-white shadow-md min-h-screen hidden md:block" style={{ width: 220, padding: '20px 10px', borderRight: '1px solid #e5e7eb', position: 'fixed', top: 0, left: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      {/* Logo nhà hàng */}
      <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => location.pathname !== '/chef' && window.location.assign('/chef')}>
        <ChefHat style={{ width: 36, height: 36, color: '#eab308', marginRight: 10 }} />
        <div>
          <span className="font-bold text-xl text-blue-900 block">Nhà Hàng Hương Quê</span>
          <span className="text-yellow-500 text-xs">Hương vị truyền thống</span>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="font-bold text-lg">Bếp Trưởng</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 px-2 py-1 bg-gray-50 rounded-md">
          <User size={18} className="text-gray-500" />
          <span>{currentUser}</span>
        </div>
      </div>
      <ul className="space-y-2 w-full">
        {chefMenu.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={
                'block px-2 py-1 rounded ' +
                (location.pathname === item.path
                  ? 'font-semibold text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50')
              }
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto w-full">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <LogOut size={20} className="text-red-600" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default TaskbarChef;
