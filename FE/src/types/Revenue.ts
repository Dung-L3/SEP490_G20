// Revenue types for API responses
export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orderCount: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface ShiftRevenue {
  period: string;
  invoiceCount: number;
  totalRevenue: number;
}

export interface RevenueResponse {
  success: boolean;
  data: MonthlyRevenue[] | DailyRevenue[] | ShiftRevenue[];
  message?: string;
}
