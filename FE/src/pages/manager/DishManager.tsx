import { useState, useEffect } from 'react';
import TaskbarManager from '../../components/TaskbarManager';
import DishEditModal from '../../components/DishEditModal';
import DishAddModal from '../../components/DishAddModal';
import { dishApi } from '../../api/dishApi';

interface Dish {
  dishId: number;
  dishName: string;
  categoryId: number;
  price: number;
  status: boolean;
  unit: string;
  imageUrl: string;
  createdAt: string;
}

const DishManager = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState('');
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [newDish, setNewDish] = useState<Dish>({
    dishId: 0,
    dishName: '',
    categoryId: 1,
    price: 0,
    status: true,
    unit: '',
    imageUrl: '',
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const data = await dishApi.getAll();
        setDishes(data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    };
    fetchDishes();
  }, []);

  const handleImageUrl = (value: string) => {
    const defaultImage = 'https://res.cloudinary.com/dx1iwvfdm/image/upload/v1704297479/default-image_qo4zv3.jpg';
    if (editDish) {
      setEditDish(prev => ({ ...prev!, imageUrl: value || defaultImage }));
    } else {
      setNewDish(prev => ({ ...prev, imageUrl: value || defaultImage }));
    }
  };

  const handleAddSave = async () => {
    try {
      // Validate required fields
      if (!newDish.dishName.trim()) {
        setAddError('Vui lòng nhập tên món ăn!');
        return;
      }
      if (newDish.price <= 0) {
        setAddError('Vui lòng nhập giá hợp lệ!');
        return;
      }
      
      // Nếu không có ảnh, sử dụng ảnh mặc định
      if (!newDish.imageUrl) {
        newDish.imageUrl = 'https://res.cloudinary.com/dx1iwvfdm/image/upload/v1704297479/default-image_qo4zv3.jpg';
      }

      // Remove dishId before sending to backend
      const { dishId, ...dishPayload } = newDish;
      const newDishData = await dishApi.create(dishPayload);
      setDishes(prev => [...prev, newDishData]);
      setAddOpen(false);
      setNewDish({
        dishId: 0,
        dishName: '',
        categoryId: 1,
        price: 0,
        status: true,
        unit: '',
        imageUrl: '',
        createdAt: new Date().toISOString()
      });
      setAddError('');
    } catch (error) {
      console.error('Error creating dish:', error);
      setAddError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi thêm món ăn');
    }
  };

  const handleAddCancel = () => {
    setAddOpen(false);
    setAddError('');
  };

  const handleEdit = (dish: Dish) => {
    setEditDish(dish);
  };



  const handleEditSave = async () => {
    try {
      if (editDish) {
        // Validate required fields
        if (!editDish.dishName.trim()) {
          throw new Error('Vui lòng nhập tên món ăn!');
        }
        if (editDish.price <= 0) {
          throw new Error('Vui lòng nhập giá hợp lệ!');
        }
        
        // Nếu không có ảnh, sử dụng ảnh mặc định
        if (!editDish.imageUrl) {
          editDish.imageUrl = 'https://res.cloudinary.com/dx1iwvfdm/image/upload/v1704297479/default-image_qo4zv3.jpg';
        }

        const updatedDish = await dishApi.update(editDish.dishId, editDish);
        setDishes(dishes => dishes.map(dish => dish.dishId === editDish.dishId ? updatedDish : dish));
        setEditDish(null);
      }
    } catch (error: unknown) {
      console.error('Error updating dish:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Có lỗi xảy ra khi cập nhật món ăn');
      }
    }
  };

  const handleEditCancel = () => {
    setEditDish(null);
  };

  const handleDelete = async (dish: Dish) => {
    try {
      if (window.confirm('Bạn có chắc chắn muốn xóa món này?')) {
        await dishApi.delete(dish.dishId);
        setDishes(dishes => dishes.filter(d => d.dishId !== dish.dishId));
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  const handleToggleStatus = async (dish: Dish) => {
    try {
      const updatedDish = await dishApi.update(dish.dishId, {
        ...dish,
        status: !dish.status
      });
      setDishes(dishes => dishes.map(d => d.dishId === dish.dishId ? updatedDish : d));
    } catch (error) {
      console.error('Error toggling dish status:', error);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <TaskbarManager />
      <div style={{ marginLeft: '220px', padding: '24px', width: '100%' }}>
        <h1>Quản lý món ăn</h1>
        <p>Đây là trang quản lý món ăn.</p>
        
        {/* Nút thêm món ăn */}
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
          >
            + Thêm món ăn
          </button>
        </div>

        {/* Bảng món ăn */}
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
                {dishes.map((dish) => (
                  <tr key={dish.dishId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src={dish.imageUrl} alt={dish.dishName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{dish.dishName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-700">{dish.price.toLocaleString()}đ</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(dish)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                          dish.status
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Nhấn để chuyển trạng thái"
                      >
                        {dish.status ? 'Còn' : 'Hết món'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(dish)}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(dish)}
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

        {/* Modal thêm món ăn */}
        {addOpen && (
          <DishAddModal
            dish={{
              name: newDish.dishName,
              price: newDish.price.toString(),
              image: newDish.imageUrl,
              status: newDish.status ? 'Còn' : 'Hết món'
            }}
            onChange={(e) => {
              const { name, value } = e.target;
              if (name === 'name') {
                setNewDish(prev => ({ ...prev, dishName: value }));
              } else if (name === 'price') {
                setNewDish(prev => ({ ...prev, price: parseInt(value.replace(/[^\d]/g, '')) || 0 }));
              } else if (name === 'status') {
                setNewDish(prev => ({ ...prev, status: value === 'Còn' }));
              }
            }}
            onImageUrl={handleImageUrl}
            onCancel={handleAddCancel}
            onSave={handleAddSave}
          />
        )}
        {addError && (
          <div style={{ color: 'red', marginTop: 12, fontWeight: 600 }}>{addError}</div>
        )}

        {/* Modal chỉnh sửa món ăn */}
        {editDish && (
          <DishEditModal
            dish={{
              name: editDish.dishName,
              price: editDish.price.toString(),
              image: editDish.imageUrl,
              status: editDish.status ? 'Còn' : 'Hết món'
            }}
            onChange={(e) => {
              const { name, value } = e.target;
              if (name === 'name') {
                setEditDish(prev => ({ ...prev!, dishName: value }));
              } else if (name === 'price') {
                setEditDish(prev => ({ ...prev!, price: parseInt(value.replace(/[^\d]/g, '')) || 0 }));
              } else if (name === 'status') {
                setEditDish(prev => ({ ...prev!, status: value === 'Còn' }));
              }
            }}
            onImageUrl={handleImageUrl}
            onCancel={handleEditCancel}
            onSave={handleEditSave}
          />
        )}
      </div>
    </div>
  );
};

export default DishManager;
