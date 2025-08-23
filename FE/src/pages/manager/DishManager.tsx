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
  imageUrl?: string;
  createdAt: string;
}

const DishManager = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');
  const [editDish, setEditDish] = useState<Dish | null>(null);
  // Khởi tạo giá trị mặc định cho món mới
  const defaultDishState: Dish = {
    dishId: 0,
    dishName: '',
    categoryId: 0, // Để trống để người dùng phải chọn
    price: 0,
    status: true, // Mặc định là còn hàng
    unit: '',
    imageUrl: '',
    createdAt: new Date().toISOString()
  };

  const [newDish, setNewDish] = useState<Dish>(defaultDishState);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const data = await dishApi.getAll();
        setDishes(data);
        setFilteredDishes(data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    };
    fetchDishes();
  }, []);

  // Xử lý tìm kiếm khi searchTerm thay đổi
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDishes(dishes);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filtered = dishes.filter(dish => 
      dish.dishName.toLowerCase().includes(searchTermLower)
    );
    setFilteredDishes(filtered);
  }, [searchTerm, dishes]);

  const handleImageUrl = (value: string) => {
    const defaultImage = 'https://res.cloudinary.com/dx1iwvfdm/image/upload/v1704297479/default-image_qo4zv3.jpg';
    if (editDish) {
      setEditDish(prev => ({ ...prev!, imageUrl: value || defaultImage }));
    } else {
      setNewDish(prev => ({ ...prev, imageUrl: value || defaultImage }));
    }
  };

  const handleAddSave = async (): Promise<void> => {
    try {
      // Reset error message
      setAddError('');

      // Validate required fields
      if (!newDish.dishName.trim()) {
        setAddError('Vui lòng nhập tên món ăn');
        return;
      }
      if (!newDish.unit.trim()) {
        setAddError('Vui lòng nhập đơn vị');
        return;
      }
      if (newDish.price <= 0) {
        setAddError('Vui lòng nhập giá hợp lệ');
        return;
      }
      if (!newDish.categoryId) {
        setAddError('Vui lòng chọn danh mục');
        return;
      }
      
      // Chuẩn bị payload theo format API yêu cầu
      const dishPayload = {
        dishName: newDish.dishName.trim(),
        categoryId: parseInt(newDish.categoryId.toString()),
        price: parseFloat(newDish.price.toString()),
        status: newDish.status,
        unit: newDish.unit.trim(),
        imageUrl: newDish.imageUrl || 'https://res.cloudinary.com/dx1iwvfdm/image/upload/v1704297479/default-image_qo4zv3.jpg'
      };

      console.log('Sending dish payload:', dishPayload);

      // Gọi API tạo món mới thông qua dishApi
      const createdDish = await dishApi.create(dishPayload);
      
      // Cập nhật state
      setDishes(dishes => [...dishes, createdDish]);
      setAddOpen(false);
      setNewDish(defaultDishState);
      setAddError('');
      // Hiển thị thông báo thành công
      alert('Thêm món ăn mới thành công!');
    } catch (error) {
      console.error('Error creating dish:', error);
      if (error instanceof Error) {
        setAddError(error.message);
      }
      setAddError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi thêm món ăn');
    }
  };

  const handleAddCancel = () => {
    setAddOpen(false);
    setNewDish(defaultDishState);
    setAddError(''); // Clear any errors when closing
  };

  const handleEdit = (dish: Dish) => {
    setEditDish(dish);
    setEditError(''); // Clear any errors when opening edit modal
  };



  const handleEditSave = async (): Promise<void> => {
    try {
      setEditError('');
      
      if (!editDish) {
        setEditError('Không tìm thấy thông tin món ăn');
        return;
      }

      // Validate required fields
      if (!editDish.dishName.trim()) {
        setEditError('Vui lòng nhập tên món ăn');
        return;
      }
      if (!editDish.unit.trim()) {
        setEditError('Vui lòng nhập đơn vị');
        return;
      }
      if (editDish.price <= 0) {
        setEditError('Vui lòng nhập giá hợp lệ');
        return;
      }
      if (!editDish.categoryId) {
        setEditError('Vui lòng chọn danh mục');
        return;
      }
        
      // Nếu không có ảnh, sử dụng ảnh mặc định
      if (!editDish.imageUrl) {
        editDish.imageUrl = 'https://res.cloudinary.com/dx1iwvfdm/image/upload/v1704297479/default-image_qo4zv3.jpg';
      }

      // Gửi yêu cầu cập nhật thông qua dishApi
      const updatedDish = await dishApi.update(editDish.dishId, editDish);
      
      // Cập nhật state
      setDishes(prevDishes => prevDishes.map(d => 
        d.dishId === editDish.dishId ? {...d, ...updatedDish} : d
      ));
      setEditDish(null);
    } catch (error: unknown) {
      console.error('Error updating dish:', error);
      if (error instanceof Error) {
        setEditError(error.message);
      } else {
        setEditError('Có lỗi xảy ra khi cập nhật món ăn');
      }
    }
  };

  const handleEditCancel = () => {
    setEditDish(null);
  };

  const handleDelete = async (dish: Dish) => {
    try {
      if (window.confirm('Bạn có chắc chắn muốn xóa món này? Hành động này không thể hoàn tác!')) {
        await dishApi.deleteDish(dish.dishId);
        // Cập nhật UI sau khi xóa thành công
        setDishes(prevDishes => prevDishes.filter(d => d.dishId !== dish.dishId));
        alert('Đã xóa món ăn thành công!');
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa món ăn');
    }
  };

  const handleToggleStatus = async (dish: Dish) => {
    try {
      const newStatus = !dish.status;
      await dishApi.updateStatus(dish.dishId, newStatus);
      // Cập nhật state sau khi API thành công
      setDishes(dishes => dishes.map(d => 
        d.dishId === dish.dishId 
          ? { ...d, status: newStatus }
          : d
      ));
    } catch (error) {
      console.error('Error toggling dish status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái món ăn');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <TaskbarManager />
      <div style={{ marginLeft: '220px', padding: '24px', width: '100%' }}>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Quản Lý Món Ăn
          <div className="h-1 w-24 bg-blue-600 mt-2"></div>
        </h1>
        {/* Thanh tìm kiếm và nút thêm món */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên món..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Danh mục</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Đơn vị</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDishes.map((dish) => (
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
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${dish.categoryId === 1 ? 'bg-blue-100 text-blue-800' : 
                          dish.categoryId === 2 ? 'bg-purple-100 text-purple-800' : 
                          'bg-amber-100 text-amber-800'}`}>
                        {dish.categoryId === 1 ? 'Món chính' : 
                         dish.categoryId === 2 ? 'Món phụ' : 'Đồ uống'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {dish.unit}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-700">
                      {dish.price.toLocaleString()}đ
                    </td>
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
            dish={newDish}
            error={addError}
            onChange={(e) => {
              const { name, value } = e.target;
              setNewDish(prev => {
                const updated = { ...prev };
                
                switch (name) {
                  case 'dishName':
                    updated.dishName = value;
                    break;
                  case 'categoryId':
                    updated.categoryId = parseInt(value) || 0;
                    break;
                  case 'unit':
                    updated.unit = value;
                    break;
                  case 'price': {
                    // Remove non-numeric characters except decimal point
                    const numericValue = value.replace(/[^\d.]/g, '');
                    // Ensure only one decimal point
                    const formattedValue = numericValue.replace(/(\..*)\./g, '$1');
                    updated.price = parseFloat(formattedValue) || 0;
                    break;
                  }
                  case 'status':
                    updated.status = value === 'true';
                    break;
                }
                
                return updated;
              });
            }}
            onImageUrl={handleImageUrl}
            onCancel={handleAddCancel}
            onSave={handleAddSave}
          />
        )}

        {/* Modal chỉnh sửa món ăn */}
        {editDish && (
          <DishEditModal
            dish={editDish}
            error={editError}
            onChange={(e) => {
              const { name, value } = e.target;
              if (name === 'dishName') {
                setEditDish(prev => ({ ...prev!, dishName: value }));
              } else if (name === 'categoryId') {
                setEditDish(prev => ({ ...prev!, categoryId: parseInt(value) }));
              } else if (name === 'unit') {
                setEditDish(prev => ({ ...prev!, unit: value }));
              } else if (name === 'price') {
                setEditDish(prev => ({ ...prev!, price: parseFloat(value.replace(/[^\d]/g, '')) || 0 }));
              } else if (name === 'status') {
                setEditDish(prev => ({ ...prev!, status: value === 'true' }));
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
