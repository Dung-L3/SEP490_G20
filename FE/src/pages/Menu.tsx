import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

const Menu = () => {
  const { addToCart } = useCart();
  const [showAlert, setShowAlert] = useState<{name: string, quantity: number} | null>(null);

  const dishes = [
    {
      name: "Cơm Tấm Sườn Nướng",
      price: "65.000đ",
      description: "Cơm tấm thơm ngon với sườn nướng đậm đà",
      image: "https://i1-giadinh.vnecdn.net/2024/03/07/7-Hoan-thien-thanh-pham-1-6244-1709800134.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=Y03-BsY4ORbpVkG4zm_DcA"
    },
    {
      name: "Bánh Xèo Miền Tây",
      price: "45.000đ",
      description: "Bánh xèo giòn tan với nhân tôm thịt đầy đặn",
      image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "Lẩu Cá Kèo",
      price: "180.000đ",
      description: "Lẩu cá kèo chua cay đặc sản miền Tây",
      image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "Gỏi Cuốn Tôm Thịt",
      price: "35.000đ",
      description: "Gỏi cuốn tươi mát với tôm thịt tươi ngon",
      image: "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "Phở Bò",
      price: "50.000đ",
      description: "Món phở nổi tiếng với nước dùng thơm ngon và thịt bò mềm",
      image: "https://giavichinsu.com/wp-content/uploads/2024/01/cach-nau-pho-bo.jpg"
    },
    {
      name: "Bún Chả Hà Nội",
      price: "60.000đ",
      description: "Bún chả nướng thơm, nước mắm pha đặc trưng",
      image: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_1_12_638406880045931692_cach-lam-bun-cha-ha-noi-0.jpg"
    },
    {
      name: "Chả Cá Lã Vọng",
      price: "120.000đ",
      description: "Món chả cá thơm ngon, ăn kèm với bún và rau sống",
      image: "https://file.hstatic.net/200000700229/article/lam-cha-ca-la-vong-bang-noi-chien-khong-dau_7e476b1bfcff43428bc8af05fd931d74.jpeg"
    },
    {
      name: "Mì Quảng",
      price: "55.000đ",
      description: "Mì Quảng đặc sản miền Trung, thơm ngon với nước dùng đặc trưng",
      image: "https://danangfantasticity.com/wp-content/uploads/2024/04/cach-thuong-thuc-mot-to-mi-quang-dung-dieu-nguoi-da-nang.jpg"
    },
    {
      name: "Bánh Mì Thịt Nướng",
      price: "30.000đ",
      description: "Bánh mì thơm ngon, thịt nướng giòn ngọt",
      image: "https://cdn.tgdd.vn/Files/2021/08/20/1376583/cach-lam-banh-mi-thit-nuong-cuc-don-gian-bang-chai-nhua-co-san-tai-nha-202108201640593483.jpg"
    },
    {
      name: "Bánh Cuốn Hà Nội",
      price: "45.000đ",
      description: "Bánh cuốn nóng hổi, nhân thịt heo thơm lừng",
      image: "https://static.tuoitre.vn/tto/i/s626/2013/05/08/DxofPVKe.jpg"
    },
    {
      name: "Cơm Gà Hội An",
      price: "70.000đ",
      description: "Cơm gà thơm ngon, đậm đà với nước mắm, rau sống",
      image: "https://i-giadinh.vnecdn.net/2023/04/22/Buoc-11-thanh-pham-1-11-9981-1682135995.jpg"
    },
    {
      name: "Xôi Xéo",
      price: "40.000đ",
      description: "Xôi xéo với đậu xanh, mỡ hành thơm lừng",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLXHCgHafFLTjysi9B5c1qDkgbYs_ef_qGvw&s"
    },
    
  ];

  
  type Dish = {
    name: string;
    price: string;
    description: string;
    image: string;
  };

  // Hàm đặt món mới
  const handleOrder = (dish: Dish) => {
    addToCart({ ...dish, price: Number(dish.price.replace(/\D/g, '')) });
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dishes.map((dish, index) => (
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
                    onClick={() => handleOrder(dish)}
                  >
                    Đặt Món <ArrowRight className="w-4 h-4 ml-2" />
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

export default Menu;
