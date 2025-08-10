import { useState, useEffect } from "react";
import { TrendingUp, Clock } from "lucide-react";
import TaskbarManager from "../../components/TaskbarManager";
import { revenueApi } from "../../api/revenueApi";
import type {
  MonthlyRevenue,
  DailyRevenue,
  ShiftRevenue
} from "../../types/Revenue";

// Interfaces
interface DateRange {
  startDate: string;
  endDate: string;
}

const getInitialDateRange = (): DateRange => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    startDate: firstDay.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0]
  };
};

const RevenueManager = () => {
  // States for revenue data
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [shiftRevenue, setShiftRevenue] = useState<ShiftRevenue[]>([]);
  
  // States for filters and loading
  const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch data based on date range
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [monthlyData, dailyData] = await Promise.all([
          revenueApi.getMonthlyRevenue(dateRange.startDate, dateRange.endDate),
          revenueApi.getDailyRevenue(dateRange.startDate, dateRange.endDate)
        ]);

        console.log('Monthly Data:', monthlyData);
        console.log('Daily Data:', dailyData);

        setMonthlyRevenue(monthlyData);
        setDailyRevenue(dailyData);
        setError("");
      } catch (err) {
        console.error("Error fetching revenue data:", err);
        setError("Không thể tải dữ liệu doanh thu");
      } finally {
        setLoading(false);
      }
    };

    if (dateRange.startDate && dateRange.endDate) {
      fetchData();
    }
  }, [dateRange]);

  // Fetch shift revenue data
  useEffect(() => {
    const fetchShiftData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const data = await revenueApi.getShiftRevenue(today);
        console.log('Shift Data:', data);
        setShiftRevenue(data);
      } catch (err) {
        console.error("Error fetching shift revenue:", err);
      }
    };

    fetchShiftData();
  }, []);

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 min-h-screen sticky top-0 z-10">
          <TaskbarManager />
        </div>
        <div className="flex-1 min-w-0 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 min-h-screen sticky top-0 z-10">
          <TaskbarManager />
        </div>
        <div className="flex-1 min-w-0 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-xl font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Taskbar */}
      <div className="w-64 min-h-screen sticky top-0 z-10">
        <TaskbarManager />
      </div>
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quản lý doanh thu</h1>
                  <p className="text-sm text-gray-500">Theo dõi và phân tích doanh thu</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="self-center">đến</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h3>
            <div className="space-y-4">
              {monthlyRevenue.map((item) => {
                console.log('Monthly Item:', item);
                return (
                  <div key={item.month} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.month}</p>
                      <p className="text-sm text-gray-500">{item.orderCount} đơn hàng</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(item.revenue)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Doanh thu theo ngày</h3>
            <div className="space-y-4">
              {dailyRevenue.map((item) => {
                console.log('Daily Item:', item);
                return (
                  <div key={item.date} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(item.date)}</p>
                      <p className="text-sm text-gray-500">{item.orderCount} đơn hàng</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(item.revenue)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shift Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Doanh thu theo ca</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shiftRevenue.map((shift) => {
                console.log('Shift Item:', shift);
                return (
                  <div key={shift.shiftId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{shift.shiftName}</p>
                      <div className="p-2 bg-blue-100 rounded">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(shift.revenue)}</p>
                    <p className="mt-2 text-sm text-gray-500">{shift.orderCount} đơn hàng</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueManager;
