// src/pages/Menu.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { dishApi, type Dish as ApiDish } from '../api/dishApi';

type UiDish = {
  id: number;
  name: string;
  price: number;            // dùng number để dễ tính toán
  description?: string;
  image?: string;
};

type TakeawaySelectionItem = {
  kind: 'dish' | 'combo';
  dishId?: number | null;
  comboId?: number | null;
  name: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
};

const formatVnd = (n: number) => `${n.toLocaleString('vi-VN')} đ`;

const Menu = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const isTakeawayMode = params.get('mode') === 'takeaway';

  const { addToCart } = useCart();
  const [showAlert, setShowAlert] = useState<{ name: string; quantity: number } | null>(null);
  const [dishes, setDishes] = useState<UiDish[]>([]);
  const [loading, setLoading] = useState(true);

  // map từ Dish (BE) -> UiDish (FE)
  const toUi = (d: ApiDish): UiDish => ({
    id: d.dishId,
    name: d.dishName,
    price: Number(d.price) || 0,
    description: d.unit ? `Đơn vị: ${d.unit}` : undefined,
    image: d.imageUrl,
  });

  useEffect(() => {
    (async () => {
      try {
        // tuỳ bạn: getAll() hoặc getByStatus(true)
        const data = await dishApi.getByStatus(true);
        setDishes(data.map(toUi));
      } catch (e) {
        console.error(e);
        alert('Không tải được thực đơn');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addToTakeawaySelection = (item: TakeawaySelectionItem) => {
    const key = 'takeaway_selection';
    const arr: TakeawaySelectionItem[] = JSON.parse(localStorage.getItem(key) || '[]');

    // gộp theo dishId/comboId
    const idx = arr.findIndex(
        (x) => (x.dishId ?? 0) === (item.dishId ?? 0) && (x.comboId ?? 0) === (item.comboId ?? 0)
    );
    if (idx >= 0) arr[idx].quantity += item.quantity;
    else arr.push(item);

    localStorage.setItem(key, JSON.stringify(arr));
  };

  const handleOrder = (dish: UiDish) => {
    if (isTakeawayMode) {
      // ✅ LƯU ĐÚNG id từ DB vào localStorage
      addToTakeawaySelection({
        kind: 'dish',
        dishId: dish.id,
        comboId: null,
        name: dish.name,
        unitPrice: dish.price, // chỉ để hiển thị tạm tính; BE vẫn lấy giá từ DB
        quantity: 1,
      });
      nav('/takeaway-order');
      return;
    }

    // giỏ hàng cũ của bạn
    addToCart({ ...dish, price: dish.price });
    setShowAlert({ name: dish.name, quantity: 1 });
    setTimeout(() => setShowAlert(null), 2000);
  };

  return (
      <div className="min-h-screen bg-gray-900">
        <Header />

        {showAlert && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-bounce-in">
                Đã thêm <span className="text-yellow-300 font-bold">{showAlert.name}</span> x{showAlert.quantity} vào giỏ hàng!
              </div>
            </div>
        )}

        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-yellow-400 mb-4 text-center">Thực Đơn</h2>

            {loading ? (
                <div className="text-center text-gray-300">Đang tải…</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {dishes.map((dish) => (
                      <div
                          key={dish.id}
                          className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-red-600/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700"
                      >
                        <div className="relative overflow-hidden">
                          <img
                              src={dish.image || 'https://via.placeholder.com/400x300?text=Dish'}
                              alt={dish.name}
                              className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-4 right-4 bg-red-600 text-yellow-400 px-3 py-1 rounded-full font-bold">
                            {formatVnd(dish.price)}
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2">{dish.name}</h3>
                          <p className="text-gray-300 mb-4">{dish.description || '—'}</p>
                          <button
                              className="w-full bg-red-600 hover:bg-red-700 text-yellow-400 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center"
                              onClick={() => handleOrder(dish)}
                          >
                            Đặt Món <ArrowRight className="w-4 h-4 ml-2" />
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
  );
};

export default Menu;
