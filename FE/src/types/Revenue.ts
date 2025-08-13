// Revenue types for API responses
export interface RevenueData {
  period: string;
  invoiceCount: number;
  totalRevenue: number;
}

export interface MonthlyRevenue extends RevenueData {}
export interface DailyRevenue extends RevenueData {}
export interface ShiftRevenue extends RevenueData {}

export interface RevenueResponse {
  success: boolean;
  data: RevenueData[];
  message?: string;
}
