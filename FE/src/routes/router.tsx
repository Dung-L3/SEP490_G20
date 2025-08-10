import { createBrowserRouter } from 'react-router-dom';
import { ProtectedComponent } from './ProtectedComponent';

// Chef pages
import Chef from '../pages/chef/Chef';

// Waiter pages
import Order from '../pages/waiter/Order';
import TableView from '../pages/waiter/TableView';

// Receptionist pages
import ReceptionistHome from '../pages/receptionist/ReceptionistHome';
import OrderList from '../pages/receptionist/OrderList';
import OrderPayment from '../pages/receptionist/OrderPayment';
import ReservationList from '../pages/receptionist/ReservationList';
import TakeawayOrder from '../pages/receptionist/TakeawayOrder';

// Manager pages
import ManagerHome from '../pages/manager/ManagerHome';
import ComboManager from '../pages/manager/ComboManager';
import CustomerReport from '../pages/manager/CustomerReport';
import DishManager from '../pages/manager/DishManager';
import OrderManager from '../pages/manager/OrderManager';
import PromotionsManager from '../pages/manager/PromotionsManager';
import PurchaseHistoryManager from '../pages/manager/PurchaseHistoryManager';
import QRCodeManager from '../pages/manager/QRCodeManager';
import ReportManager from '../pages/manager/ReportManager';
import RevenueManager from '../pages/manager/RevenueManager';
import StaffManager from '../pages/manager/StaffManager';
import TableManager from '../pages/manager/TableManager';
import WorkshiftManager from '../pages/manager/WorkshiftManager';

export const router = createBrowserRouter([
  // Chef Route
  {
    path: "/chef",
    element: <ProtectedComponent Component={Chef} requiredRole="Chef" />
  },

  // Waiter Routes
  {
    path: "/waiter/orders",
    element: <ProtectedComponent Component={Order} requiredRole="Waiter" />
  },
  {
    path: "/waiter/tables",
    element: <ProtectedComponent Component={TableView} requiredRole="Waiter" />
  },

  // Receptionist Routes
  {
    path: "/receptionist",
    element: <ProtectedComponent Component={ReceptionistHome} requiredRole="Receptionist" />
  },
  {
    path: "/receptionist/orders",
    element: <ProtectedComponent Component={OrderList} requiredRole="Receptionist" />
  },
  {
    path: "/receptionist/:orderId/payment",
    element: <ProtectedComponent Component={OrderPayment} requiredRole="Receptionist" />
  },
  {
    path: "/receptionist/reservations",
    element: <ProtectedComponent Component={ReservationList} requiredRole="Receptionist" />
  },
  {
    path: "/receptionist/takeaway",
    element: <ProtectedComponent Component={TakeawayOrder} requiredRole="Receptionist" />
  },
  {
    path: "/manager",
    element: <ProtectedComponent Component={ManagerHome} requiredRole="Manager" />
  },
  {
    path: "/manager/combo",
    element: <ProtectedComponent Component={ComboManager} requiredRole="Manager" />
  },
  {
    path: "/manager/customer-report",
    element: <ProtectedComponent Component={CustomerReport} requiredRole="Manager" />
  },
  {
    path: "/manager/dish",
    element: <ProtectedComponent Component={DishManager} requiredRole="Manager" />
  },
  {
    path: "/manager/order",
    element: <ProtectedComponent Component={OrderManager} requiredRole="Manager" />
  },
  {
    path: "/manager/promotions",
    element: <ProtectedComponent Component={PromotionsManager} requiredRole="Manager" />
  },
  {
    path: "/manager/purchase-history",
    element: <ProtectedComponent Component={PurchaseHistoryManager} requiredRole="Manager" />
  },
  {
    path: "/manager/qr",
    element: <ProtectedComponent Component={QRCodeManager} requiredRole="Manager" />
  },
  {
    path: "/manager/report",
    element: <ProtectedComponent Component={ReportManager} requiredRole="Manager" />
  },
  {
    path: "/manager/revenue",
    element: <ProtectedComponent Component={RevenueManager} requiredRole="Manager" />
  },
  {
    path: "/manager/staff",
    element: <ProtectedComponent Component={StaffManager} requiredRole="Manager" />
  },
  {
    path: "/manager/table",
    element: <ProtectedComponent Component={TableManager} requiredRole="Manager" />
  },
  {
    path: "/manager/workshift",
    element: <ProtectedComponent Component={WorkshiftManager} requiredRole="Manager" />
  }
]);