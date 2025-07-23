import React, { useState, useEffect } from 'react';
import { useTableCart } from '../../contexts/TableCartContext';
import type { TableInfo } from '../../data/tables';
import TaskbarWaiter from '../../components/TaskbarWaiter';
import type { MenuItem } from '../../api/orderApi.ts';
import { fetchOccupiedTables, fetchMenuItems, createOrder } from '../../api/orderApi.ts';

const Order: React.FC = () => {
  const { tableCarts, setTable, currentTable, addToCart, updateQuantity, removeFromCart, clearCart } = useTableCart();
  const [search, setSearch] = useState('');
  const [tableList, setTableList] = useState<TableInfo[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const tables = await fetchOccupiedTables();
        setTableList(tables);
      } catch (error) {
        console.error('Error fetching tables:', error);
        setTableList([]);
        alert('Không thể lấy danh sách bàn. Vui lòng thử lại sau.');
      }
    };

    fetchTables();
  }, []);



  // Fetch menu items
  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      try {
        const items = await fetchMenuItems(search);
        console.log('Menu items:', items);
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setMenuItems([]);
        alert('Không thể lấy danh sách món. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [search]);

  // Lấy bàn từ query string nếu có
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam && tableParam !== currentTable) {
      setTable(tableParam);
    }
  }, [currentTable, setTable]);

  const filteredMenu = menuItems.filter(item =>
    item && item.name && item.name.toLowerCase().includes(search.toLowerCase())
  );
  const cart = tableCarts[currentTable] || [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Taskbar trái */}
      <TaskbarWaiter />
      <div className="hidden md:block w-56" />
      
      {/* Nội dung chính */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt món cho khách</h1>
            <p className="text-gray-600">Chọn món ăn và thêm vào giỏ hàng</p>
          </div>
          {/* Chọn bàn */}
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
              </svg>
              <label htmlFor="table-select" className="font-semibold text-gray-700">Chọn bàn:</label>
            </div>
            <select
              id="table-select"
              className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-semibold text-blue-800 min-w-[160px]"
              value={currentTable}
              onChange={e => setTable(e.target.value)}
            >
              {tableList && tableList.length > 0 ? (
                tableList.map(table => (
                  <option key={table.id} value={table.name}>
                    Bàn {table.name}
                  </option>
                ))
              ) : (
                <option value="">Không có bàn đang phục vụ</option>
              )}
            </select>
          </div>
        </div>

        {/* Search bar với hiệu ứng */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
            />
            <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Menu món ăn với grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredMenu.map(item => (
            <div key={item.name} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{item.name}</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">{item.price.toLocaleString()} đ</span>
                  <div className="flex items-center text-yellow-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                    <span className="ml-1 text-sm text-gray-600">4.5</span>
                  </div>
                </div>
                <button
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => addToCart(item)}
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm vào giỏ
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Giỏ hàng với thiết kế hiện đại */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m.2 0L5 3H3m4 10L5 21h14M9 19a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Giỏ hàng
            </h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {cart.length} món
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m.2 0L5 3H3m4 10L5 21h14M9 19a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <p className="text-gray-500 text-lg">Chưa có món nào trong giỏ hàng</p>
              <p className="text-gray-400 text-sm mt-2">Hãy chọn những món ăn yêu thích của bạn!</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.name} className="flex items-center bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 ml-4">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-blue-600 font-bold">{item.price.toLocaleString()} đ</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center bg-white rounded-lg border-2 border-gray-200">
                        <button
                          className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                          onClick={() => updateQuantity(item.name, Math.max(1, item.quantity - 1))}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => updateQuantity(item.name, Number(e.target.value))}
                          className="w-16 text-center border-0 bg-transparent focus:outline-none py-1"
                        />
                        <button
                          className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                          onClick={() => updateQuantity(item.name, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString()} đ</p>
                      </div>
                      <button
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        onClick={() => removeFromCart(item.name)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-bold text-gray-800">Tổng cộng:</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()} đ
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                    onClick={clearCart}
                    disabled={cart.length === 0}
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa giỏ hàng
                    </span>
                  </button>
                  <button
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={cart.length === 0}
                    onClick={async () => {
                      const orderData = {
                        tableId: Number(currentTable.replace(/\D/g, '')),
                        orderDetails: cart.map(item => ({
                          dishId: item.id,
                          quantity: item.quantity,
                          note: ""
                        }))
                      };
                      
                      try {
                        const response = await createOrder(orderData);
                        alert(response.message || 'Đơn hàng đã được gửi thành công!');
                        clearCart();
                        const tables = await fetchOccupiedTables();
                        setTableList(tables);
                      } catch (error) {
                        console.error('Error submitting order:', error);
                        alert('Có lỗi xảy ra khi gửi đơn hàng!');
                      }
                    }}
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Gửi đơn hàng
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Order;