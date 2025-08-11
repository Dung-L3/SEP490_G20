import React, { useState, useEffect } from 'react';
import { useTableCart } from '../../contexts/TableCartContext';
import type { TableInfo } from '../../api/orderApi.ts';
import TaskbarWaiter from './TaskbarWaiter';
import type { MenuItem } from '../../api/orderApi.ts';
import type { ComboDTO } from '../../api/comboApi';
import type { Category } from '../../api/categoryApi';
import { comboApi } from '../../api/comboApi';
import { categoryApi } from '../../api/categoryApi';
import { 
  fetchOccupiedTables, 
  fetchMenuItems, 
  createOrder, 
  updateTableStatus, 
  fetchOrderStatus,
  fetchOrderItems
} from '../../api/orderApi.ts';

const Order: React.FC = () => {
  const { tableCarts, setTable, currentTable, addToCart, updateQuantity, removeFromCart, clearCart } = useTableCart();
  const [search, setSearch] = useState('');
  const [tableList, setTableList] = useState<TableInfo[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [combos, setCombos] = useState<ComboDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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



  // Fetch menu items and combos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [comboList, categoryList] = await Promise.all([
          comboApi.getAllCombos(),
          categoryApi.getAll()
        ]);

        const menuItemsPromises = categoryList.map(category => 
          fetchMenuItems(category.categoryId, search)
        );
        const menuItemsByCategory = await Promise.all(menuItemsPromises);
        const allMenuItems = menuItemsByCategory.flat();
        
        console.log('Menu items:', allMenuItems);
        console.log('Combos:', comboList);
        console.log('Categories:', categoryList);
        
        setMenuItems(allMenuItems);
        const activeComboList = Array.isArray(comboList) ? comboList : [];
        setCombos(activeComboList);
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching menu items and combos:', error);
        setMenuItems([]);
        setCombos([]);
        alert('Không thể lấy danh sách món và combo. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [search]);

  // Lấy bàn từ query string nếu có
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam && tableParam !== currentTable) {
      setTable(tableParam);
    }
  }, [currentTable, setTable]);

  // Fetch trạng thái đơn hàng hiện tại của bàn
  useEffect(() => {
    if (!currentTable) return;

    const fetchCurrentOrder = async () => {
      try {
        const selectedTable = tableList.find(table => table.name === currentTable);
        if (!selectedTable) return;

        const activeOrders = await fetchOrderItems(selectedTable.id);
        if (activeOrders && activeOrders.length > 0) {
          // Thêm các món từ đơn hàng hiện tại vào giỏ hàng
          clearCart();
          activeOrders.forEach(item => addToCart({
            ...item,
            orderStatus: item.orderStatus as 'pending' | 'cooking' | 'completed'
          }));
        }
      } catch (error) {
        console.error('Error fetching current order:', error);
      }
    };

    fetchCurrentOrder();
  }, [currentTable, tableList, addToCart, clearCart]);

  // Poll trạng thái món ăn
  useEffect(() => {
    if (!currentTable) return;
    
    const cart = tableCarts[currentTable] || [];
    const itemsWithOrderDetail = cart.filter(item => item.orderDetailId);

    if (itemsWithOrderDetail.length === 0) return;

    const pollStatus = async () => {
      try {
        const updatedItems = await Promise.all(
          cart.map(async (item) => {
            if (!item.orderDetailId) return item;

            try {
              const statusResponse = await fetchOrderStatus(item.orderDetailId);
              const status = typeof statusResponse === 'object' ? (statusResponse as any).status : statusResponse;
              
              // Nếu món đã chuyển sang cooking hoặc completed, xóa khỏi giỏ hàng
              if (status !== 'pending') {
                return null;
              }
              return item;
            } catch (error) {
              // Nếu không fetch được status, giữ nguyên trạng thái cũ
              console.error(`Error fetching status for item ${item.name}:`, error);
              return item;
            }
          })
        );

        // Chỉ giữ lại các món có trạng thái pending
        const pendingItems = updatedItems.filter(item => item !== null);
        
        // Chỉ cập nhật nếu có thay đổi
        if (pendingItems.length !== cart.length) {
          clearCart();
          pendingItems.forEach(item => addToCart(item));
        }
      } catch (error) {
        console.error('Error polling order status:', error);
      }
    };

    const interval = setInterval(pollStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [currentTable, tableCarts, addToCart, clearCart, fetchOrderStatus]);

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
              <option value="">--- Chọn bàn ---</option>
              {tableList && tableList.length > 0 ? (
                tableList.map(table => (
                  <option key={table.id} value={table.name}>
                    Bàn {table.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Không có bàn đang phục vụ</option>
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

        {/* Phần Combo */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-8 h-8 mr-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Combo đặc biệt
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : combos.map(combo => (
            <div key={combo.comboId} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border-2 border-yellow-100">
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-3">{combo.comboName}</h3>
                <p className="text-gray-600 mb-4 text-sm">{combo.description}</p>
                <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Món trong combo:</h4>
                  <ul className="space-y-1">
                    {combo.comboItems.map((item, index) => (
                      <li key={index} className="text-gray-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item.dishName} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-yellow-600">{combo.price.toLocaleString()} đ</span>
                  <div className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                    Combo
                  </div>
                </div>
                <button
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => addToCart({
                    id: combo.comboId,
                    name: combo.comboName,
                    price: combo.price,
                    isCombo: true,
                    comboItems: combo.comboItems.map(item => ({
                      dishId: item.dishId,
                      dishName: item.dishName || '',
                      quantity: item.quantity
                    }))
                  })}
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm combo vào giỏ
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Menu món ăn */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Menu món lẻ
        </h2>
        <div className="space-y-8 mb-8">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : categories.map(category => {
            const categoryItems = filteredMenu.filter(item => item.categoryId === category.categoryId);
            if (categoryItems.length === 0) return null;
            
            return (
              <div key={category.categoryId}>
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  {category.categoryName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryItems.map(item => (
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
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => addToCart({...item, image: item.image || '/placeholder-dish.jpg'})}
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
            ))
          }
        </div>
              </div>
            );
          })}
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
                      <div className="flex items-center gap-2">
                        <p className="text-blue-600 font-bold">{item.price.toLocaleString()} đ</p>
                        {item.orderStatus && (
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            item.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            item.orderStatus === 'cooking' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.orderStatus === 'pending' ? 'Chờ xử lý' :
                             item.orderStatus === 'cooking' ? 'Đang chế biến' :
                             'Hoàn thành'}
                          </span>
                        )}
                      </div>
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
                      {(!item.orderDetailId || item.orderStatus === 'pending') && (
                        <button
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          onClick={() => removeFromCart(item.name)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
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
                      if (!currentTable) {
                        alert('Vui lòng chọn bàn trước khi gửi đơn hàng');
                        return;
                      }
                      
                      if (cart.length === 0) {
                        alert('Vui lòng thêm ít nhất một món vào đơn hàng');
                        return;
                      }

                      // Kiểm tra trạng thái bàn trong tableList
                      const selectedTable = tableList.find(table => table.name === currentTable);
                      if (!selectedTable) {
                        alert('Không tìm thấy thông tin bàn');
                        return;
                      }
                      
                      if (selectedTable.status !== 'OCCUPIED') {
                        try {
                          await updateTableStatus(selectedTable.id, 'OCCUPIED');
                          // Refresh table list after status update
                          const updatedTables = await fetchOccupiedTables();
                          setTableList(updatedTables);
                        } catch (error) {
                          console.error('Error updating table status:', error);
                          alert('Không thể cập nhật trạng thái bàn. Vui lòng thử lại.');
                          return;
                        }
                      }

                      const orderData = {
                        tableId: Number(currentTable.replace(/\D/g, '')),
                        orderType: 'DINEIN',
                        items: cart.map(item => ({
                          dishId: item.isCombo ? null : item.id,
                          comboId: item.isCombo ? item.id : null,
                          quantity: item.quantity || 1,
                          notes: "",
                          unitPrice: item.price,
                          isCombo: !!item.isCombo
                        }))
                      };
                      
                      try {
                        const response = await createOrder(orderData) as { message?: string; id?: number; orderId?: number; };
                        // Xử lý response từ orderApi mới
                        const message = response?.message || 'Đơn hàng đã được gửi thành công!';
                        const orderId = response?.orderId || response?.id;
                        
                        alert(message);
                        
                        // Cập nhật trạng thái của các món trong giỏ hàng
                        const updatedCart = cart.map(item => ({
                          ...item,
                          orderStatus: 'pending' as 'pending' | 'cooking' | 'completed',
                          orderDetailId: orderId
                        }));
                        
                        // Cập nhật giỏ hàng với trạng thái mới
                        clearCart();
                        updatedCart.forEach(item => addToCart(item));
                        
                        const tables = await fetchOccupiedTables();
                        setTableList(tables);
                      } catch (error) {
                        console.error('Error submitting order:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi đơn hàng!';
                        alert(errorMessage);
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