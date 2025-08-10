import axiosClient from './axiosClient';
import type { Revenue } from '../types/Revenue';

export const revenueApi = {
    // Lấy doanh thu theo tháng
    getMonthlyRevenue: async (startDate: string, endDate: string) => {
        try {
            const response = await axiosClient.get(`/reports/revenue/monthly`, {
                params: {
                    from: startDate,
                    to: endDate
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching monthly revenue:', error);
            throw error;
        }
    },

    // Lấy doanh thu theo ngày
    getDailyRevenue: async (startDate: string, endDate: string) => {
        try {
            const response = await axiosClient.get(`/reports/revenue/daily`, {
                params: {
                    from: startDate,
                    to: endDate
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching daily revenue:', error);
            throw error;
        }
    },

    // Lấy doanh thu theo ca
    getShiftRevenue: async (date: string) => {
        try {
            const response = await axiosClient.get(`/reports/revenue/shifts`, {
                params: {
                    date
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching shift revenue:', error);
            throw error;
        }
    }
};
