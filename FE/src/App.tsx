import WaiterOrder from './pages/waiter/Order';
import WaiterTableView from './pages/waiter/TableView';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Menu from './pages/Menu';  // Import trang Menu
import Cart from './pages/Cart';  // Import trang Giỏ hàng
import Payment from './pages/Payment'; // Import trang Thanh Toán
import Login from './pages/Login'; // Import trang Đăng Nhập
import Register from './pages/Register'; // Import trang Đăng Ký
import ManagerHome from './pages/manager/ManagerHome'; // Import trang ManagerHome
import RevenueManager from './pages/manager/RevenueManager'; // Import trang Quản lý doanh thu
import TableManager from './pages/manager/TableManager'; // Import trang Quản lý bàn
import StaffManager from './pages/manager/StaffManager'; // Import trang Quản lý nhân sự
import DishManager from './pages/manager/DishManager'; // Import trang Quản lý món ăn
import OrderManager from './pages/manager/OrderManager'; // Import trang Quản lý đơn hàng
import ReportManager from './pages/manager/ReportManager'; // Import trang Báo cáo
import { CartProvider } from './contexts/CartContext';
import { TableCartProvider } from './contexts/TableCartContext';



import Chef from './pages/chef/Chef';

function App() {
  return (
    <CartProvider>
      <TableCartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/menu" element={<Menu />} />  {/* Route cho trang Thực Đơn */}
            <Route path="/cart" element={<Cart />} />  {/* Route cho trang Giỏ hàng */}
            <Route path="/payment" element={<Payment />} /> {/* Route cho trang Thanh Toán */}
            <Route path="/login" element={<Login />} /> {/* Route cho trang Đăng Nhập */}
            <Route path="/register" element={<Register />} /> {/* Route cho trang Đăng Ký */}
            <Route path="/manager" element={<ManagerHome />} /> {/* Route cho trang Manager */}
            <Route path="/manager/revenue" element={<RevenueManager />} /> {/* Route cho trang Quản lý doanh thu */}
            <Route path="/manager/table" element={<TableManager />} /> {/* Route cho trang Quản lý bàn */}
            <Route path="/manager/staff" element={<StaffManager />} /> {/* Route cho trang Quản lý nhân sự */}
            <Route path="/manager/dish" element={<DishManager />} /> {/* Route cho trang Quản lý món ăn */}
            <Route path="/manager/order" element={<OrderManager />} /> {/* Route cho trang Quản lý đơn hàng */}
            <Route path="/manager/report" element={<ReportManager />} /> {/* Route cho trang Báo cáo */}
          <Route path="/waiter/orders" element={<WaiterOrder />} /> {/* Route cho waiter đặt món */}
          <Route path="/waiter/tables" element={<WaiterTableView />} /> {/* Route cho waiter xem bàn */}
          <Route path="/chef" element={<Chef />} /> {/* Route cho trang Chef (bếp trưởng) */}
          </Routes>
        </Router>
      </TableCartProvider>
    </CartProvider>
  );
}

export default App;
