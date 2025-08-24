// src/components/Header.tsx
import { useState } from 'react';
import { ChefHat, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const { cart } = useCart();
  // const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gradient-to-r from-black to-gray-900 text-white sticky top-0 z-50 shadow-lg border-b border-red-600">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <ChefHat className="w-8 h-8 text-yellow-500" />
            <Link to="/">
              <h1 className="text-2xl font-bold">Nhà Hàng Hương Quê</h1>
              <p className="text-yellow-400 text-sm">Hương vị truyền thống</p>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {/*<Link to="/" className="hover:text-yellow-400 transition-colors font-medium">Trang Chủ</Link>*/}
            <Link to="/menu" className="hover:text-yellow-400 transition-colors font-medium">Thực Đơn</Link>
            {/*<Link to="/cart" className="hover:text-yellow-400 transition-colors font-medium flex items-center relative">*/}
            {/*  /!* ...giỏ hàng... *!/*/}
            {/*  Giỏ hàng*/}
            {/*  {cartCount > 0 && (*/}
            {/*    <span className="absolute -top-2 -right-3 bg-red-600 text-yellow-400 text-xs font-bold rounded-full px-2 py-0.5">*/}
            {/*      {cartCount}*/}
            {/*    </span>*/}
            {/*  )}*/}
            {/*</Link>*/}
            <Link to="/takeaway-order" className="hover:text-yellow-400 transition-colors font-medium">Đơn mang đi</Link>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">{currentUser}</span>
                <button onClick={handleLogout} className="ml-2 px-3 py-1 bg-gray-700 hover:bg-red-600 rounded text-sm font-semibold">Đăng xuất</button>
              </div>
            ) : (
              <Link to="/login" className="hover:text-yellow-400 transition-colors font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v.75a2.25 2.25 0 01-2.25 2.25h-3A2.25 2.25 0 018.25 9.75V9m7.5 0h-7.5m7.5 0a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0115.75 21h-7.5A2.25 2.25 0 016 19.75v-7.5A2.25 2.25 0 018.25 9h7.5z" />
                </svg>
                Đăng nhập
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-red-600 mt-4 pt-4">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="hover:text-yellow-400 transition-colors font-medium">Trang Chủ</Link>
              <Link to="/menu" className="hover:text-yellow-400 transition-colors font-medium">Thực Đơn</Link>
              <Link to="/cart" className="hover:text-yellow-400 transition-colors font-medium flex items-center">
                {/* ...giỏ hàng... */}
                Giỏ hàng
              </Link>
              {currentUser ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-400 font-bold">{currentUser}</span>
                  <button onClick={handleLogout} className="ml-2 px-3 py-1 bg-gray-700 hover:bg-red-600 rounded text-sm font-semibold">Đăng xuất</button>
                </div>
              ) : (
                <Link to="/login" className="hover:text-yellow-400 transition-colors font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v.75a2.25 2.25 0 01-2.25 2.25h-3A2.25 2.25 0 018.25 9.75V9m7.5 0h-7.5m7.5 0a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0115.75 21h-7.5A2.25 2.25 0 016 19.75v-7.5A2.25 2.25 0 018.25 9h7.5z" />
                  </svg>
                  Đăng nhập
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
