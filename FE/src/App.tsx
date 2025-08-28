import WaiterOrder from './pages/waiter/Order';
import WaiterTableView from './pages/waiter/TableView';
import PurchaseHistoryManager from './pages/manager/PurchaseHistoryManager';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WorkshiftManager from './pages/manager/WorkshiftManager';
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


import { CartProvider } from './contexts/CartContext';
import { TableCartProvider } from './contexts/TableCartContext';
import { AuthProvider } from './contexts/AuthContext';
import OrderList from './pages/receptionist/OrderList';
import OrderPayment from './pages/receptionist/OrderPayment';
import Chef from './pages/chef/Chef';
import QRMenu from './pages/QRMenu';
import QRCodeManager from './pages/manager/QRCodeManager';
import ReservationList from './pages/receptionist/ReservationList';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp      from './pages/VerifyOtp';
import ResetPassword  from './pages/ResetPassword';
import TakeawayOrder from './pages/receptionist/TakeawayOrder';
import ComboManager from './pages/manager/ComboManager';
import PromotionsManager from './pages/manager/PromotionsManager';
import TakeawayOrderPublic from './pages/TakeawayOrderPublic';
import CustomerList from './pages/receptionist/CustomerList';

function App() {
  return (
    <CartProvider>
      <TableCartProvider>
        <Router>
          <AuthProvider>
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
            <Route path="/manager/workshift" element={<WorkshiftManager />} /> {/* Route cho trang Quản lý ca làm việc */}
            <Route path="/manager/dish" element={<DishManager />} /> {/* Route cho trang Quản lý món ăn */}
            <Route path="/manager/combo" element={<ComboManager />} /> {/* Route cho trang Quản lý combo */}
            <Route path="/manager/purchase-history" element={<PurchaseHistoryManager />} /> {/* Route cho trang Lịch sử giao dịch */}
            <Route path="/manager/promotions" element={<PromotionsManager />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp"    element={<VerifyOtp/>}     />
            <Route path="/reset-password" element={<ResetPassword/>}  />
          <Route path="/waiter/orders" element={<WaiterOrder />} /> {/* Route cho waiter đặt món */}
          <Route path="/waiter/tables" element={<WaiterTableView />} /> {/* Route cho waiter xem bàn */}
          <Route path="/chef" element={<Chef />} /> {/* Route cho trang Chef (bếp trưởng) */}
           <Route path="/takeaway-order" element={<TakeawayOrderPublic />} /> {/*Route cho trang đơn hàng mang đi công khai*/}
         
          {/* QR Menu Routes */}
          <Route path="/menu/:tableId" element={<QRMenu />} /> {/* Route cho trang QR menu khách hàng */}
          <Route path="/qr-manager" element={<QRCodeManager />} /> {/* Route cho trang quản lý QR codes */}

          {/* Receptionist Routes */}
            <Route path="/receptionist/orders/unpaid" element={<OrderList />} /> {/* Route cho trang xử lý thanh toán của order */}
            <Route path="/receptionist/:orderId/payment" element={<OrderPayment />} />
            <Route path="/receptionist/reservations"element={<ReservationList/>} />
              <Route path="/receptionist/takeaway" element={<TakeawayOrder />} /> {/* Route cho trang đơn hàng mang đi */}
              <Route path="/receptionist/customer/list" element={<CustomerList />} /> {/* Route cho trang đơn hàng mang đi */}
            </Routes>
          </AuthProvider>
        </Router>
      </TableCartProvider>
    </CartProvider>
  );
}

export default App;
