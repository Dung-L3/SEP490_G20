import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const waiterMenu = [
  { label: 'Đặt món', path: '/waiter/orders' },
  { label: 'Bàn', path: '/waiter/tables' },
];

const TaskbarWaiter: React.FC = () => {
  const location = useLocation();
  return (
    <aside className="bg-white shadow-md min-h-screen hidden md:block" style={{ width: 220, padding: '20px 10px', borderRight: '1px solid #e5e7eb', position: 'fixed', top: 0, left: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      {/* Logo nhà hàng giống TaskbarManager */}
      <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => location.pathname !== '/waiter/orders' && window.location.assign('/waiter/orders')}>
        <ChefHat style={{ width: 36, height: 36, color: '#eab308', marginRight: 10 }} />
        <div>
          <span className="font-bold text-xl text-blue-900 block">Nhà Hàng Hương Quê</span>
          <span className="text-yellow-500 text-xs">Hương vị truyền thống</span>
        </div>
      </div>
      <h2 className="font-bold text-lg mb-4">Nhân viên bồi bàn</h2>
      <ul className="space-y-2">
        {waiterMenu.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={
                'block px-2 py-1 rounded ' +
                (location.pathname === item.path
                  ? 'font-semibold text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-100')
              }
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default TaskbarWaiter;
