  
import { useState } from 'react';
import TaskbarManager from '../../components/TaskbarManager';
import DishEditModal from '../../components/DishEditModal';
import DishAddModal from '../../components/DishAddModal';

const initialDishes = [
  { name: "Cơm Tấm Sườn Nướng", price: "65.000đ", image: "https://i1-giadinh.vnecdn.net/2024/03/07/7-Hoan-thien-thanh-pham-1-6244-1709800134.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=Y03-BsY4ORbpVkG4zm_DcA", status: 'Còn' },
  { name: "Bánh Xèo Miền Tây", price: "45.000đ", image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", status: 'Còn' },
  { name: "Lẩu Cá Kèo", price: "180.000đ", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", status: 'Còn' },
  { name: "Gỏi Cuốn Tôm Thịt", price: "35.000đ", image: "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", status: 'Còn' },
  { name: "Phở Bò", price: "50.000đ", image: "https://giavichinsu.com/wp-content/uploads/2024/01/cach-nau-pho-bo.jpg", status: 'Còn' },
  { name: "Bún Chả Hà Nội", price: "60.000đ", image: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_1_12_638406880045931692_cach-lam-bun-cha-ha-noi-0.jpg", status: 'Còn' },
  { name: "Chả Cá Lã Vọng", price: "120.000đ", image: "https://file.hstatic.net/200000700229/article/lam-cha-ca-la-vong-bang-noi-chien-khong-dau_7e476b1bfcff43428bc8af05fd931d74.jpeg", status: 'Còn' },
  { name: "Mì Quảng", price: "55.000đ", image: "https://danangfantasticity.com/wp-content/uploads/2024/04/cach-thuong-thuc-mot-to-mi-quang-dung-dieu-nguoi-da-nang.jpg", status: 'Còn' },
  { name: "Bánh Mì Thịt Nướng", price: "30.000đ", image: "https://cdn.tgdd.vn/Files/2021/08/20/1376583/cach-lam-banh-mi-thit-nuong-cuc-don-gian-bang-chai-nhua-co-san-tai-nha-202108201640593483.jpg", status: 'Còn' },
  { name: "Bánh Cuốn Hà Nội", price: "45.000đ", image: "https://static.tuoitre.vn/tto/i/s626/2013/05/08/DxofPVKe.jpg", status: 'Còn' },
  { name: "Cơm Gà Hội An", price: "70.000đ", image: "https://i-giadinh.vnecdn.net/2023/04/22/Buoc-11-thanh-pham-1-11-9981-1682135995.jpg", status: 'Còn' },
  { name: "Xôi Xéo", price: "40.000đ", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLXHCgHafFLTjysi9B5c1qDkgbYs_ef_qGvw&s", status: 'Còn' },
];

// Xóa món ăn
  const handleDelete = (idx: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món này?')) {
      setDishes(dishes => dishes.filter((_, i) => i !== idx));
    }
  };

const DishManager = () => {
  type Dish = typeof initialDishes[number];
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newDish, setNewDish] = useState<Dish>({ name: '', price: '', image: '', status: 'Còn' });
  // Thêm món ăn
  const handleAddImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewDish((prev) => ({ ...prev, image: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDish((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddSave = () => {
    if (!newDish.name.trim() || !newDish.price.trim() || !newDish.image.trim()) return;
    setDishes((prev) => [...prev, newDish]);
    setAddOpen(false);
    setNewDish({ name: '', price: '', image: '', status: 'Còn' });
  };
  const handleAddCancel = () => {
    setAddOpen(false);
    setNewDish({ name: '', price: '', image: '', status: 'Còn' });
  };

  // Đổi trạng thái, chỉnh sửa
  const handleToggleStatus = (idx: number) => {
    setDishes(dishes => dishes.map((dish, i) =>
      i === idx ? { ...dish, status: dish.status === 'Còn' ? 'Hết món' : 'Còn' } : dish
    ));
  };
  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditDish({ ...dishes[idx] });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditDish((prev) => prev ? { ...prev, [name]: value } : prev);
  };
  const handleEditImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditDish((prev) => prev ? { ...prev, image: ev.target?.result as string } : prev);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleEditSave = () => {
    if (editIdx !== null && editDish) {
      setDishes(dishes => dishes.map((dish, i) => i === editIdx ? editDish : dish));
    }
    setEditIdx(null);
    setEditDish(null);
  };
  const handleEditCancel = () => {
    setEditIdx(null);
    setEditDish(null);
  };

  return (
    <div style={{ display: 'flex' }}>
      <TaskbarManager />
      <div style={{ marginLeft: '220px', padding: '24px', width: '100%' }}>
        <h1>Quản lý món ăn</h1>
        <p>Đây là trang quản lý món ăn.</p>

        {/* Nút thêm món ăn ở góc phải trên bảng */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '8px 20px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 16
            }}
            onClick={() => setAddOpen(true)}
          >+ Thêm món ăn</button>
        </div>
        {/* Bảng món ăn kiểu hiện đại giống StaffManager */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Món ăn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dishes.map((dish, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{dish.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-700">{dish.price}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(idx)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                          dish.status === 'Còn'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Nhấn để chuyển trạng thái"
                      >
                        {dish.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(idx)}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa món này?')) {
                              setDishes(dishes => dishes.filter((_, i) => i !== idx));
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popup thêm món ăn */}
        {addOpen && (
          <DishAddModal
            dish={newDish}
            onChange={handleAddChange}
            onImageFile={handleAddImageFile}
            onCancel={handleAddCancel}
            onSave={handleAddSave}
          />
        )}

        {/* Bảng chỉnh sửa */}
        {editIdx !== null && editDish && (
          <DishEditModal
            dish={editDish}
            onChange={handleEditChange}
            onImageFile={handleEditImageFile}
            onCancel={handleEditCancel}
            onSave={handleEditSave}
          />
        )}
      </div>
    </div>
  );
};

export default DishManager;
