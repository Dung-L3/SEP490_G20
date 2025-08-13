export interface PurchaseHistoryDto {
    orderId: number;
    orderDate: string;
    customerName: string | null;
    phone: string;
    orderType: 'DINEIN' | 'TAKEAWAY';
    subTotal: number;
    discountAmount: number;
    finalTotal: number;
    paymentMethod: string;
    isRefunded: number;
}

export interface PurchaseHistoryResponse {
    totalVisits: number;
    totalSpent: number;
    averageSpent: number;
}

// Lấy tất cả lịch sử giao dịch
export const getAllPurchaseHistory = async (): Promise<PurchaseHistoryDto[]> => {
    const response = await fetch('/api/purchase-history/all', {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch purchase history');
    }
    return response.json();
};

// Lấy lịch sử giao dịch theo số điện thoại
export const getPurchaseHistoryByPhone = async (phone: string): Promise<PurchaseHistoryDto[]> => {
    const response = await fetch(`/api/purchase-history/customer/${phone}`, {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch customer purchase history');
    }
    return response.json();
};

// Lấy thống kê khách hàng theo số điện thoại
export const getCustomerStatistics = async (phone: string): Promise<PurchaseHistoryResponse> => {
    const response = await fetch(`/api/purchase-history/statistics/${phone}`, {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch customer statistics');
    }
    return response.json();
};







