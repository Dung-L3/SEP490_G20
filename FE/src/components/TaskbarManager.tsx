
import { useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const TaskbarManager = () => {
  const navigate = useNavigate();
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
        onClick={() => navigate('/manager/revenue')}
      >Quản lý doanh thu</button>
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
        onClick={() => navigate('/manager/workshift')}
      >Quản lý ca làm việc</button>
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
        onClick={() => navigate('/manager/table')}
      >Quản lý bàn</button>
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
        onClick={() => navigate('/manager/promotions')}
      >Quản lý mã giảm giá</button>
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
        onClick={() => navigate('/manager/purchase-history')}
      >Lịch sử giao dịch</button>
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
        onClick={() => navigate('/manager/staff')}
      >Quản lý nhân sự</button>
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
        onClick={() => navigate('/manager/dish')}
      >Quản lý món ăn</button>
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
        onClick={() => navigate('/manager/combo')}
      >Quản lý combo</button>
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
        onClick={() => navigate('/manager/order')}
      >Quản lý đơn hàng</button>
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
        onClick={() => navigate('/qr-manager')}
      >Quản lý QR</button>
      </div>
      <button
        style={{
          background: '#ef4444',
          border: 'none',
          color: '#fff',
          fontSize: '16px',
          padding: '10px 0',
          textAlign: 'center',
          width: '100%',
          cursor: 'pointer',
          borderRadius: '4px',
          marginTop: '16px',
          marginBottom: '8px',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#dc2626')}
        onMouseOut={e => (e.currentTarget.style.background = '#ef4444')}
        onClick={() => {
          // Gọi API logout nếu cần
          navigate('/');
        }}
      >Đăng xuất</button>
    </div>
  );
};

export default TaskbarManager;
