import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, Home, ShoppingCart, Plus, LogOut } from 'lucide-react';
import MergeTableModal from '../../components/MergeTableModal';

interface TaskbarWaiterProps {
  onMergeSuccess?: () => void;
}

const TaskbarWaiter: React.FC<TaskbarWaiterProps> = ({ onMergeSuccess }) => {
  const location = useLocation();
  const [showMergeModal, setShowMergeModal] = useState(false);

  const waiterMenu = [
    { icon: Home, label: 'Sơ đồ bàn', path: '/waiter/tables' },
    { icon: ShoppingCart, label: 'Đặt món', path: '/waiter/orders' },
  ];

  const handleMergeSuccess = () => {
    // Call parent callback to refresh data
    if (onMergeSuccess) {
      onMergeSuccess();
    } else {
      // Fallback to reload if no callback provided
      window.location.reload();
    }
  };

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-56 bg-gradient-to-br from-blue-900 to-blue-800 text-white shadow-xl z-40">
        <div className="p-6">
          {/* Logo nhà hàng */}
          <div className="flex items-center space-x-3 mb-8 cursor-pointer">
            <ChefHat className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold">Nhà Hàng Hương Quê</h1>
              <p className="text-blue-300 text-xs">Hương vị truyền thống</p>
            </div>
          </div>

          {/* Role Title */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-blue-200">Nhân viên bồi bàn</h2>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {waiterMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-blue-800 shadow-lg'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Ghép bàn button */}
            <button
              onClick={() => setShowMergeModal(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-blue-100 hover:bg-blue-700 hover:text-white"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Ghép bàn</span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button className="flex items-center space-x-3 px-4 py-3 text-blue-300 hover:text-white hover:bg-blue-700 rounded-xl transition-all duration-200 w-full">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Merge Table Modal */}
      <MergeTableModal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        onMergeSuccess={handleMergeSuccess}
      />
    </>
  );
};

export default TaskbarWaiter;
