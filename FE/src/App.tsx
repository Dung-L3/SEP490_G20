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
import OrderManager from './pages/manager/OrderManager'; // Import trang Quản lý đơn hàng
import ReportManager from './pages/manager/ReportManager'; // Import trang Báo cáo
import { CartProvider } from './contexts/CartContext';
import { TableCartProvider } from './contexts/TableCartContext';
import { AuthProvider } from './contexts/AuthContext';
import OrderList from './pages/receptionist/OrderList';
import OrderPayment from './pages/receptionist/OrderPayment';
import ReceptionistHome from './pages/receptionist/ReceptionistHome';
import Chef from './pages/chef/Chef';
import QRMenu from './pages/QRMenu';
import QRCodeManager from './pages/QRCodeManager';

function App() {
  return (
    <TableCartProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Manager Routes */}
            <Route path="/manager" element={<ManagerHome />} />
            <Route path="/manager/revenue" element={<RevenueManager />} />
            <Route path="/manager/table" element={<TableManager />} />
            <Route path="/manager/staff" element={<StaffManager />} />
            <Route path="/manager/workshift" element={<WorkshiftManager />} />
            <Route path="/manager/dish" element={<DishManager />} />
            <Route path="/manager/order" element={<OrderManager />} />
            <Route path="/manager/report" element={<ReportManager />} />
            <Route path="/manager/purchase-history" element={<PurchaseHistoryManager />} />

            {/* Waiter Routes */}
            <Route path="/waiter/orders" element={<WaiterOrder />} />
            <Route path="/waiter/tables" element={<WaiterTableView />} />
            
            {/* Chef Routes */}
            <Route path="/chef" element={<Chef />} />

            {/* QR Menu Routes - CHỨC NĂNG MỚI */}
            <Route path="/menu/:tableId" element={<QRMenu />} />
            <Route path="/qr-manager" element={<QRCodeManager />} />
            
            {/* Receptionist Routes */}
            <Route path="/receptionist" element={<ReceptionistHome />} />
            <Route path="/receptionist/orders" element={<OrderList />} />
            <Route path="/receptionist/payment" element={<OrderPayment />} />
          </Routes>
        </AuthProvider>
      </Router>
    </TableCartProvider>
  );
}

export default App;
