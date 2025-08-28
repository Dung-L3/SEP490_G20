import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import { categoryApi } from '../api/categoryApi';
import { dishApi } from '../api/dishApi';
import type { Category } from '../api/categoryApi';
import type { Dish } from '../api/dishApi';
import { comboApi } from '../api/comboApi';
import type { ComboDTO } from '../api/comboApi';
import {useNavigate, useSearchParams} from "react-router-dom";

const STORAGE_KEY = 'takeaway_selection';

const Menu = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const isTakeawayMode = params.get('mode') === 'takeaway';
  const returnTo = params.get('return');

  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Record<number, Dish[]>>({});
  const [combos, setCombos] = useState<ComboDTO[]>([]);

  // Load categories, dishes và combos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryList, comboList] = await Promise.all([
          categoryApi.getAll(),
          comboApi.getAllCombos()
        ]);
        console.log('All combos:', comboList);
        setCategories(categoryList);
        setCombos(comboList);

        // Load dishes for each category
        const dishesMap: Record<number, Dish[]> = {};
        await Promise.all(
            categoryList.map(async (category) => {
              const categoryDishes = await dishApi.getByCategory(category.categoryId);
              dishesMap[category.categoryId] = categoryDishes.filter(dish => dish.status);
            })
        );
        setDishes(dishesMap);
      } catch (error) {
        console.error('Error loading menu data:', error);
      }
    };

    loadData();
  }, []);

  const goBackAfterPick = () => {
    if (returnTo) nav(decodeURIComponent(returnTo)); // <- quan trọng
    else nav(-1);
  };

  const addToTakeawaySelection = (item: {
    kind: 'dish' | 'combo';
    dishId?: number | null;
    comboId?: number | null;
    name: string;
    unitPrice: number;
    quantity: number;
  }) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: any[] = raw ? JSON.parse(raw) : [];
    const idx = arr.findIndex(x =>
        x?.kind === item.kind &&
        (Number(x?.dishId) || 0) === (Number(item.dishId) || 0) &&
        (Number(x?.comboId) || 0) === (Number(item.comboId) || 0)
    );
    if (idx >= 0) arr[idx].quantity += item.quantity;
    else arr.push({
      ...item,
      dishId: item.kind === 'dish' ? Number(item.dishId) : null,
      comboId: item.kind === 'combo' ? Number(item.comboId) : null,
      quantity: Math.max(1, Number(item.quantity) || 1),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  };

  const handleChooseDish = (dish: Dish) => {
    if (!isTakeawayMode) return;
    addToTakeawaySelection({
      kind: 'dish',
      dishId: dish.dishId,
      comboId: null,
      name: dish.dishName,
      unitPrice: dish.price,
      quantity: 1,
    });
    goBackAfterPick(); // 👈 thay nav(-1)
  };

  const handleChooseCombo = (combo: ComboDTO) => {
    if (!isTakeawayMode) return;
    addToTakeawaySelection({
      kind: 'combo',
      comboId: combo.comboId,
      dishId: null,
      name: combo.comboName,
      unitPrice: combo.price,
      quantity: 1,
    });
    goBackAfterPick(); // 👈 thay nav(-1)
  };

  return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-yellow-400 mb-8 text-center">Thực Đơn</h2>

            {/* Combo Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">Combo Đặc Biệt</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {combos.map((combo) => (
                    <div key={combo.comboId} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-red-600/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700">
                      <div className="relative overflow-hidden">
                        <img
                            src="/images/combo-default.jpg"
                            alt={combo.comboName}
                            className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 bg-red-600 text-yellow-400 px-3 py-1 rounded-full font-bold">
                          {combo.price.toLocaleString()}đ
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{combo.comboName}</h3>
                        <p className="text-gray-300 mb-4 line-clamp-2">
                          {(combo.comboItems?.map(item => item.dishName).join(', ')) ?? ''}
                        </p>
                        {isTakeawayMode && (
                            <div
                                className="w-full bg-red-600 text-yellow-400 py-2 rounded-lg font-semibold text-center cursor-pointer hover:bg-red-700"
                                onClick={() => handleChooseCombo(combo)}
                            >
                                Chọn combo
                            </div>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* Categories Section */}
            {categories.map(category => (
                <div key={category.categoryId} className="mb-12">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-6">{category.categoryName}</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {dishes[category.categoryId]?.map((dish, index) => (
                        <div key={index} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-red-600/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700">
                          <div className="relative overflow-hidden">
                            <img
                                src={dish.imageUrl || '/placeholder-dish.jpg'}
                                alt={dish.dishName}
                                className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-4 right-4 bg-red-600 text-yellow-400 px-3 py-1 rounded-full font-bold">
                              {dish.price.toLocaleString()}đ
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">{dish.dishName}</h3>
                            <p className="text-gray-300 mb-4">Món {dish.dishName} đặc biệt</p>
                            {isTakeawayMode && (
                                <div
                                    className="w-full bg-red-600 text-yellow-400 py-2 rounded-lg font-semibold text-center cursor-pointer hover:bg-red-700"
                                    onClick={() => handleChooseDish(dish)}
                                >
                                    Chọn món
                                </div>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            ))}
          </div>
        </section>
        <Footer />
      </div>
  );
};

export default Menu;