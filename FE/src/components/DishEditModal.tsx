import React from 'react';

interface Dish {
  name: string;
  price: string;
  image: string;
  status: string;
}

interface DishEditModalProps {
  dish: Dish;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onImageFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: () => void;
}

const DishEditModal: React.FC<DishEditModalProps> = ({ dish, onChange, onImageFile, onCancel, onSave }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 2px 16px #0002' }}>
      <h2 style={{ marginBottom: 16 }}>Chỉnh sửa món ăn</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Tên món:</label><br />
        <input name="name" value={dish.name} onChange={onChange} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #e5e7eb' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Giá:</label><br />
        <input name="price" value={dish.price} onChange={onChange} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #e5e7eb' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Hình ảnh:</label><br />
        <input
          name="image"
          value={dish.image}
          onChange={onChange}
          placeholder="Dán link ảnh hoặc chọn file"
          style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #e5e7eb', marginBottom: 6 }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={onImageFile}
          style={{ marginTop: 4 }}
        />
        {dish.image && (
          <img src={dish.image} alt="dish" style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 6, display: 'block', marginTop: 8 }} />
        )}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Trạng thái:</label><br />
        <select name="status" value={dish.status} onChange={onChange} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #e5e7eb' }}>
          <option value="Còn">Còn</option>
          <option value="Hết món">Hết món</option>
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onCancel} style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: '#e5e7eb', color: '#222' }}>Hủy</button>
        <button onClick={onSave} style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: '#22c55e', color: '#fff' }}>Lưu</button>
      </div>
    </div>
  </div>
);

export default DishEditModal;
