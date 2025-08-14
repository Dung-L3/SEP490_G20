// src/pages/Home.tsx
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { dishApi } from '../api/dishApi';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // State để lưu món ăn ngẫu nhiên
  const [randomDishes, setRandomDishes] = useState<Array<{
    name: string;
    price: string;
    image: string;
    description: string;
  }>>([]);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      title: "Hương Vị Quê Nhà",
      subtitle: "Nơi lưu giữ tinh hoa ẩm thực dân gian"
    },
    {
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      title: "Món Ăn Truyền Thống",
      subtitle: "Được chế biến từ những nguyên liệu tươi ngon nhất"
    },
    {
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      title: "Không Gian Ấm Cúng",
      subtitle: "Thiết kế mang đậm nét văn hóa Việt Nam"
    }
  ];

  // Load random dishes khi component mount
  useEffect(() => {
    const loadRandomDishes = async () => {
      try {
        const allDishes = await dishApi.getAll();
        // Lọc món active và lấy random 4 món
        const activeDishes = allDishes.filter(dish => dish.status);
        const shuffled = [...activeDishes].sort(() => 0.5 - Math.random());
        const formatted = shuffled.slice(0, 4).map(dish => ({
          name: dish.dishName,
          price: `${dish.price.toLocaleString()}đ`,
          image: dish.imageUrl || '/placeholder-dish.jpg',
          description: `Món ${dish.dishName} đặc biệt`
        }));
        setRandomDishes(formatted);
      } catch (error) {
        console.error('Error loading dishes:', error);
      }
    };

    loadRandomDishes();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Hàm để điều hướng đến trang Đặt Món
  const handleOrderClick = () => {
    navigate('/menu'); // Điều hướng tới trang Thực Đơn (Menu)
  };

  // Hàm để điều hướng tới trang Đặt Bàn
  const handleBookingClick = () => {
    navigate('/booking'); // Điều hướng đến trang Đặt Bàn
  };

  return (
      <div className="min-h-screen bg-gray-900">
        <Header />

        {/* Hero Section */}
        <section className="relative h-screen overflow-hidden">
          {heroSlides.map((slide, index) => (
              <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  <div className="relative h-full flex items-center justify-center text-center text-white px-4">
                    <div className="max-w-4xl">
                      <h2 className="text-5xl md:text-7xl font-bold mb-6 text-shadow-lg">
                        {slide.title}
                      </h2>
                      <p className="text-xl md:text-2xl mb-8 text-yellow-300">
                        {slide.subtitle}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleOrderClick}  // Gọi hàm điều hướng đến trang menu
                            className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
                        >
                          Xem Thực Đơn
                        </button>
                        <button
                            onClick={handleBookingClick}  // Gọi hàm điều hướng đến trang đặt bàn
                            className="border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
                        >
                          Đặt Bàn Ngay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          ))}

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
                <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white bg-opacity-50'}`}
                    onClick={() => setCurrentSlide(index)}
                />
            ))}
          </div>
        </section>

        {/* Featured Dishes Section */}
        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-yellow-400 mb-8">Món Ăn Nổi Bật</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {randomDishes.map((dish, index) => (
                  <div key={index} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-red-600/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700">
                    <div className="relative overflow-hidden">
                      <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-red-600 text-yellow-400 px-3 py-1 rounded-full font-bold">
                        {dish.price}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{dish.name}</h3>
                      <p className="text-gray-300 mb-4">{dish.description}</p>
                      <button
                          className="w-full bg-red-600 hover:bg-red-700 text-yellow-400 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center"
                          onClick={handleOrderClick}
                      >
                        Xem Thực Đơn
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
  );
};

export default Home;
