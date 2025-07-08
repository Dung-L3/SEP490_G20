import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const location = useLocation();
  type AddedItem = { name: string; quantity: number } | null;
  const [showAlert, setShowAlert] = useState(false);
  const [addedItem, setAddedItem] = useState<AddedItem>(null);

  useEffect(() => {
    if (location.state && location.state.addedItem) {
      setAddedItem(location.state.addedItem);
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-8 text-center">Giỏ hàng của bạn</h2>
        {showAlert && addedItem && (
          <div className="mb-4 flex justify-center">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-bounce-in">
              Đã thêm <span className="text-yellow-300 font-bold">{addedItem.name}</span> x{addedItem.quantity} vào giỏ hàng!
            </div>
          </div>
        )}
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-700">
          {cart.length === 0 ? (
            <p className="text-gray-300 text-center">Chưa có sản phẩm nào trong giỏ hàng.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-700 mb-6">
                {cart.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover border border-gray-700" />
                      <div>
                        <div className="text-white font-semibold">{item.name}</div>
                        <div className="text-yellow-400">{item.price.toLocaleString()}đ</div>
                        {/* Ghi chú cho từng món ăn */}
                        <input
                          type="text"
                          placeholder="Ghi chú cho món này (ví dụ: không cay, thêm topping...)"
                          className="mt-2 w-full px-2 py-1 rounded bg-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          // Nếu muốn lưu ghi chú, cần thêm state cho từng món
                          // value={item.note || ''}
                          // onChange={e => handleNoteChange(item.name, e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 bg-gray-700 text-yellow-400 rounded hover:bg-yellow-500 hover:text-black font-bold"
                        onClick={() => updateQuantity(item.name, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        title="Giảm số lượng"
                      >-</button>
                      <span className="text-gray-300 min-w-[24px] text-center">x{item.quantity}</span>
                      <button
                        className="px-2 py-1 bg-gray-700 text-yellow-400 rounded hover:bg-yellow-500 hover:text-black font-bold"
                        onClick={() => updateQuantity(item.name, item.quantity + 1)}
                        title="Tăng số lượng"
                      >+</button>
                      <button
                        className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                        onClick={() => removeFromCart(item.name)}
                        title="Xóa món"
                      >X</button>
                    </div>
                  </li>
                ))}
              </ul>
            
              <div className="flex justify-between items-center text-lg font-bold text-yellow-400 mb-2">
                <span>Tổng cộng:</span>
                <span>{total.toLocaleString()}đ</span>
              </div>
              <button
                className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors text-lg shadow-lg"
                onClick={() => window.location.href = '/payment'}
                disabled={cart.length === 0}
              >
                Đặt Món
              </button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
