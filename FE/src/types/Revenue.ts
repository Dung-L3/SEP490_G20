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
  shiftId: string;
  shiftName: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueResponse {
  success: boolean;
  data: MonthlyRevenue[] | DailyRevenue[] | ShiftRevenue[];
  message?: string;
}
