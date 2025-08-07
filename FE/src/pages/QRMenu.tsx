
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { tableApi } from '../api/tableApi';
import { dishApi, type Dish } from '../api/dishApi';
import { categoryApi, type Category } from '../api/categoryApi';
import { createOrder, type CreateOrderResponse } from '../api/orderApi';
import { type UiTable, mapApiTableToUiTable } from '../utils/tableMapping';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

interface CartItem {
  dish: Dish;
  quantity: number;
  notes?: string;
}

const QRMenu: FC = () => {
  const { tableId } = useParams();
  const [table, setTable] = useState<UiTable | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!tableId) {
        setError('Không tìm thấy thông tin bàn');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch table info, dishes and categories simultaneously
        const [tableResponse, dishesResponse, categoriesResponse] = await Promise.all([
          tableApi.getById(parseInt(tableId)),
          dishApi.getByStatus(true), // Only active dishes
          categoryApi.getAll()
        ]);

        const uiTable = mapApiTableToUiTable(tableResponse);
        setTable(uiTable);
        setDishes(dishesResponse);
        setCategories(categoriesResponse);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableId]);

  const addToCart = (dish: Dish) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.dish.dishId === dish.dishId);
      if (existingItem) {
        return prevCart.map(item =>
          item.dish.dishId === dish.dishId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { dish, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (dishId: number) => {
    setCart(prevCart => {
      return prevCart.map(item =>
        item.dish.dishId === dishId
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item
      ).filter(item => item.quantity > 0);
    });
  };

  const getItemQuantity = (dishId: number) => {
    const item = cart.find(item => item.dish.dishId === dishId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.dish.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('Vui lòng chọn món trước khi đặt!');
      return;
    }

    if (!table) {
      alert('Không tìm thấy thông tin bàn!');
      return;
    }

    try {
      setOrderLoading(true);
      
      const orderItems = cart.map(item => ({
        dishId: item.dish.dishId,
        quantity: item.quantity,
        notes: item.notes || '',
        unitPrice: item.dish.price
      }));

      const orderData = {
        tableId: parseInt(tableId!),
        items: orderItems
      };

      await createOrder(orderData);
      
      // Clear cart after successful order
      setCart([]);
      setShowCart(false);
      alert('Đặt món thành công! Món ăn sẽ được chuẩn bị trong giây lát.');
      
    } catch (error) {
      console.error('Lỗi khi đặt món:', error);
      alert('Có lỗi xảy ra khi đặt món. Vui lòng thử lại!');
    } finally {
      setOrderLoading(false);
    }
  };

  // Group dishes by category using real category data
  const groupedDishes = dishes.reduce((acc, dish) => {
    const category = categories.find(cat => cat.categoryId === dish.categoryId);
    const categoryName = category ? category.categoryName : `Danh mục ${dish.categoryId}`;
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Lỗi</p>
          <p>{error || 'Không tìm thấy thông tin bàn'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thực đơn</h1>
              <p className="text-gray-600">Bàn {table.name} - Khu vực {table.areaId}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              table.status === 'Available' 
                ? 'bg-green-100 text-green-800' 
                : table.status === 'Occupied'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {table.status}
            </div>
          </div>
        </div>

        {/* Menu Categories */}
        {Object.keys(groupedDishes).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Hiện tại chưa có món ăn nào.</p>
          </div>
        ) : (
          Object.entries(groupedDishes).map(([categoryName, categoryDishes]) => (
            <div key={categoryName} className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{categoryName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryDishes.map((dish) => (
                  <div key={dish.dishId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{dish.dishName}</h3>
                      <span className="text-lg font-bold text-blue-600">
                        {dish.price.toLocaleString()}đ
                      </span>
                    </div>
                    
                    {dish.imageUrl && (
                      <img 
                        src={dish.imageUrl} 
                        alt={dish.dishName}
                        className="w-full h-32 object-cover rounded-md mb-3"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <p className="text-sm text-gray-600 mb-3">Đơn vị: {dish.unit}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(dish.dishId)}
                          disabled={getItemQuantity(dish.dishId) === 0}
                          className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={16} />
                        </button>
                        
                        <span className="w-8 text-center font-medium">
                          {getItemQuantity(dish.dishId)}
                        </span>
                        
                        <button
                          onClick={() => addToCart(dish)}
                          className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary - Fixed at bottom */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="flex items-center space-x-2 text-gray-600"
                >
                  <ShoppingCart size={20} />
                  <span>{getTotalItems()} món</span>
                </button>
                <div>
                  <span className="text-gray-600">Tổng cộng:</span>
                  <span className="text-xl font-bold text-gray-900 ml-2">
                    {getTotalAmount().toLocaleString()}đ
                  </span>
                </div>
              </div>
              <button 
                onClick={handleOrder}
                disabled={orderLoading || cart.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {orderLoading ? 'Đang đặt...' : 'Đặt món'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-96 rounded-t-lg p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Giỏ hàng ({getTotalItems()} món)</h3>
              <button 
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.dish.dishId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.dish.dishName}</h4>
                    <p className="text-sm text-gray-600">
                      {item.dish.price.toLocaleString()}đ x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromCart(item.dish.dishId)}
                      className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.dish)}
                      className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRMenu;
