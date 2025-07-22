  
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
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newDish, setNewDish] = useState<Omit<Dish, 'dishId' | 'createdAt'>>({
    dishName: '',
    categoryId: 1,
    price: 0,
    status: true,
    unit: '',
    imageUrl: ''
  });

  // Fetch dishes on component mount
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
  // Add dish
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 400; // Reduced from 800 to 400
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with further reduced quality and size
          const quality = 0.5; // Reduced from 0.7 to 0.5
          let base64 = canvas.toDataURL('image/jpeg', quality);
          
          // If the base64 string is still too long, reduce quality further
          if (base64.length > 500000) { // If larger than ~500KB
            const lowerQuality = 0.3;
            base64 = canvas.toDataURL('image/jpeg', lowerQuality);
          }
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedImage = await resizeImage(file);
        console.log('Image size (bytes):', resizedImage.length);
        setNewDish((prev) => ({ ...prev, imageUrl: resizedImage }));
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Có lỗi xử lý hình ảnh. Vui lòng thử lại với ảnh khác.');
      }
    }
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'price') {
      setNewDish((prev) => ({ ...prev, [name]: parseFloat(value) }));
    } else if (name === 'status') {
      setNewDish((prev) => ({ ...prev, [name]: value === 'true' }));
    } else {
      setNewDish((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSave = async () => {
    try {
      if (!newDish.dishName || !newDish.price || !newDish.imageUrl) {
        alert('Vui lòng điền đầy đủ thông tin: Tên món, Giá, và Hình ảnh');
        return;
      }

      // Prepare dish data
      const dishData = {
        ...newDish,
        dishName: newDish.dishName.trim(),
        price: Number(newDish.price),
        categoryId: Number(newDish.categoryId) || 1,
        unit: newDish.unit?.trim() || 'Phần'
      };

      console.log('Sending dish data:', JSON.stringify(dishData, null, 2));

      const createdDish = await dishApi.create(dishData);
      console.log('Created dish:', createdDish);
      
      setDishes((prev) => [...prev, createdDish]);
      setAddOpen(false);
      setNewDish({
        dishName: '',
        categoryId: 1,
        price: 0,
        status: true,
        unit: '',
        imageUrl: ''
      });
    } catch (error) {
      console.error('Error creating dish:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleAddCancel = () => {
    setAddOpen(false);
    setNewDish({
      dishName: '',
      categoryId: 1,
      price: 0,
      status: true,
      unit: '',
      imageUrl: ''
    });
  };

  // Toggle status, edit
  const handleToggleStatus = async (dish: Dish) => {
    try {
      const updatedDish = await dishApi.updateStatus(dish.dishId, !dish.status);
      setDishes(dishes => dishes.map(d => d.dishId === dish.dishId ? updatedDish : d));
    } catch (error) {
      console.error('Error updating dish status:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditDish(dish);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'price') {
      setEditDish((prev) => prev ? { ...prev, [name]: parseFloat(value) } : prev);
    } else if (name === 'status') {
      setEditDish((prev) => prev ? { ...prev, [name]: value === 'true' } : prev);
    } else {
      setEditDish((prev) => prev ? { ...prev, [name]: value } : prev);
    }
  };

  const handleEditImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editDish) {
      try {
        const resizedImage = await resizeImage(file);
        console.log('Image size (bytes):', resizedImage.length);
        setEditDish({ ...editDish, imageUrl: resizedImage });
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Có lỗi xử lý hình ảnh. Vui lòng thử lại với ảnh khác.');
      }
    }
  };

  const handleEditSave = async () => {
    try {
      if (editDish) {
        const updatedDish = await dishApi.update(editDish.dishId, editDish);
        setDishes(dishes => dishes.map(dish => dish.dishId === editDish.dishId ? updatedDish : dish));
        setEditDish(null);
      }
    } catch (error) {
      console.error('Error updating dish:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleEditCancel = () => {
    setEditDish(null);
  };

  // Delete dish
  const handleDelete = async (dish: Dish) => {
    try {
      if (window.confirm('Bạn có chắc chắn muốn xóa món này?')) {
        await dishApi.delete(dish.dishId);
        setDishes(dishes => dishes.filter(d => d.dishId !== dish.dishId));
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      // Handle error (show notification, etc.)
    }
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

        {/* Popup thêm món ăn */}
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
                handleAddChange({ target: { name: 'dishName', value }} as any);
              } else if (name === 'price') {
                handleAddChange({ target: { name, value: value.replace(/[^\d]/g, '') }} as any);
              } else if (name === 'status') {
                handleAddChange({ target: { name, value: value === 'Còn' }} as any);
              } else {
                handleAddChange(e);
              }
            }}
            onImageFile={handleAddImageFile}
            onCancel={handleAddCancel}
            onSave={handleAddSave}
          />
        )}

        {/* Bảng chỉnh sửa */}
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
                handleEditChange({ target: { name: 'dishName', value }} as any);
              } else if (name === 'price') {
                handleEditChange({ target: { name, value: value.replace(/[^\d]/g, '') }} as any);
              } else if (name === 'status') {
                handleEditChange({ target: { name, value: value === 'Còn' }} as any);
              } else {
                handleEditChange(e);
              }
            }}
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
