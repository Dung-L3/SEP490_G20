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

// Lấy tất cả lịch sử giao dịch không có số điện thoại
export const getHistoryWithoutPhone = async (): Promise<PurchaseHistoryDto[]> => {
    try {
        const response = await fetch('/api/purchase-history/no-phone', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders without phone number');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Lấy lịch sử giao dịch theo số điện thoại
export const getPurchaseHistoryByPhone = async (phone: string): Promise<PurchaseHistoryDto[]> => {
    try {
        const response = await fetch(`/api/purchase-history/customer/${phone}`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Customer not found');
            }
            throw new Error(data.message || 'Failed to fetch customer purchase history');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Lấy thống kê khách hàng theo số điện thoại
export const getCustomerStatistics = async (phone: string): Promise<PurchaseHistoryResponse> => {
    const response = await fetch(`/api/purchase-history/statistics/${phone}`, {
        credentials: 'include',
    });
    if (response.status === 404) {
        throw new Error('Customer not found');
    }
    if (!response.ok) {
        throw new Error('Failed to fetch customer statistics');
    }
    return response.json();
};







