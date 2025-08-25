import { useNavigate } from 'react-router-dom';
import {ChefHat, UserCircle, LogOut} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TaskbarReceptionist = () => {
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
    <div style={{
      background: '#f3f4f6',
      padding: '20px 10px',
      borderRight: '1px solid #e5e7eb',
      minHeight: '100vh',
      width: '220px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      position: 'fixed',
      top: 0,
      left: 0,
      justifyContent: 'space-between'
    }}>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', cursor: 'pointer' }} onClick={() => navigate('/manager') }>
          <ChefHat style={{ width: 36, height: 36, color: '#eab308', marginRight: 10 }} />
          <div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', display: 'block' }}>Nhà Hàng Hương Quê</span>
            <span style={{ fontSize: '12px', color: '#eab308' }}>Hương vị truyền thống</span>
          </div>
        </div>
          <div className="mb-6">
              <h2 className="font-bold text-lg">Quản lý</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 px-2 py-1 bg-gray-50 rounded-md">
                  <UserCircle size={18} className="text-gray-500" />
                  <span>{currentUser || 'Receptionist'}</span>
              </div>
          </div>
      <button
        style={{
          background: 'none',
          border: 'none',
          color: '#111827',
          fontSize: '16px',
          padding: '10px 0',
          textAlign: 'left',
          width: '100%',
          cursor: 'pointer',
          marginBottom: '8px',
          borderRadius: '4px',
          transition: 'background 0.2s'
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#e5e7eb')}
        onMouseOut={e => (e.currentTarget.style.background = 'none')}
        onClick={() => navigate('/receptionist/reservations')}
      >Quản lý đặt bàn</button>
      <button
        style={{
          background: 'none',
          border: 'none',
          color: '#111827',
          fontSize: '16px',
          padding: '10px 0',
          textAlign: 'left',
          width: '100%',
          cursor: 'pointer',
          marginBottom: '8px',
          borderRadius: '4px',
          transition: 'background 0.2s'
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#e5e7eb')}
        onMouseOut={e => (e.currentTarget.style.background = 'none')}
        onClick={() => navigate('/receptionist/orders/unpaid')}
      >Quản lý đơn hàng chưa thanh toán</button>
          <button
              style={{
                  background: 'none',
                  border: 'none',
                  color: '#111827',
                  fontSize: '16px',
                  padding: '10px 0',
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  borderRadius: '4px',
                  transition: 'background 0.2s'
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#e5e7eb')}
              onMouseOut={e => (e.currentTarget.style.background = 'none')}
              onClick={() => navigate('/receptionist/takeaway')}
          >
              Tạo đơn mang đi
          </button>
      </div>
        <button
            className="flex items-center gap-2 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded transition-colors"
            onClick={handleLogout}
        >
            <LogOut size={20} className="text-red-600" />
            <span>Đăng xuất</span>
        </button>
    </div>
  );
};

export default TaskbarReceptionist;
