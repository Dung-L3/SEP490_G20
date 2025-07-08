

import { ChefHat } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 border-t border-red-600">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <ChefHat className="w-8 h-8 text-yellow-500" />
            <h3 className="text-2xl font-bold">Nhà Hàng Hương Quê</h3>
          </div>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Nơi lưu giữ và lan tỏa những hương vị truyền thống của quê hương Việt Nam. 
            Chúng tôi tự hào mang đến cho quý khách những trải nghiệm ẩm thực đáng nhớ nhất.
          </p>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-400">
              © 2025 Nhà Hàng Hương Quê. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
