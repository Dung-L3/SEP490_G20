type PurchaseStatus = 'completed' | 'pending' | 'cancelled';

interface PurchaseHistory {
    id: number;
    customerId: string;
    customerName: string;
    orderDate: string;
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'banking';
    status: PurchaseStatus;
    items: PurchaseItem[];
}

interface PurchaseItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

const mockPurchases: PurchaseHistory[] = [
    {
        id: 1,
        customerId: 'CUS001',
        customerName: 'Nguyễn Văn An',
        orderDate: '2025-07-29T10:30:00',
        totalAmount: 450000,
        paymentMethod: 'cash',
        status: 'completed',
        items: [
            { id: 1, name: 'Phở bò đặc biệt', quantity: 2, price: 75000, subtotal: 150000 },
            { id: 2, name: 'Cơm rang hải sản', quantity: 3, price: 100000, subtotal: 300000 }
        ]
    },
    {
        id: 2,
        customerId: 'CUS002',
        customerName: 'Trần Thị Bình',
        orderDate: '2025-07-29T11:15:00',
        totalAmount: 680000,
        paymentMethod: 'card',
        status: 'completed',
        items: [
            { id: 3, name: 'Lẩu thái', quantity: 1, price: 400000, subtotal: 400000 },
            { id: 4, name: 'Gỏi cuốn tôm thịt', quantity: 4, price: 70000, subtotal: 280000 }
        ]
    },
    {
        id: 3,
        customerId: 'CUS003',
        customerName: 'Lê Văn Cường',
        orderDate: '2025-07-29T12:00:00',
        totalAmount: 325000,
        paymentMethod: 'banking',
        status: 'pending',
        items: [
            { id: 5, name: 'Bún chả', quantity: 3, price: 75000, subtotal: 225000 },
            { id: 6, name: 'Nước ép cam', quantity: 4, price: 25000, subtotal: 100000 }
        ]
    },
    {
        id: 4,
        customerId: 'CUS004',
        customerName: 'Phạm Thị Dung',
        orderDate: '2025-07-28T15:45:00',
        totalAmount: 850000,
        paymentMethod: 'cash',
        status: 'completed',
        items: [
            { id: 7, name: 'Cá hồi nướng', quantity: 2, price: 250000, subtotal: 500000 },
            { id: 8, name: 'Súp hải sản', quantity: 5, price: 70000, subtotal: 350000 }
        ]
    },
    {
        id: 5,
        customerId: 'CUS005',
        customerName: 'Hoàng Văn Em',
        orderDate: '2025-07-28T18:20:00',
        totalAmount: 420000,
        paymentMethod: 'banking',
        status: 'cancelled',
        items: [
            { id: 9, name: 'Gà nướng ngũ vị', quantity: 1, price: 320000, subtotal: 320000 },
            { id: 10, name: 'Rau muống xào tỏi', quantity: 2, price: 50000, subtotal: 100000 }
        ]
    },
    {
        id: 6,
        customerId: 'CUS006',
        customerName: 'Ngô Thị Phương',
        orderDate: '2025-07-28T19:10:00',
        totalAmount: 560000,
        paymentMethod: 'card',
        status: 'completed',
        items: [
            { id: 11, name: 'Tôm hùm nướng phô mai', quantity: 1, price: 460000, subtotal: 460000 },
            { id: 12, name: 'Salad trộn', quantity: 2, price: 50000, subtotal: 100000 }
        ]
    }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const purchaseHistoryApi = {
    // Lấy tất cả lịch sử mua hàng
    getAll: async (): Promise<PurchaseHistory[]> => {
        await delay(500); // Giả lập độ trễ network
        return mockPurchases;
    },

    // Cập nhật trạng thái đơn hàng
    updateStatus: async (id: number, newStatus: 'completed' | 'pending' | 'cancelled'): Promise<void> => {
        await delay(500); // Giả lập độ trễ network
        const index = mockPurchases.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Không tìm thấy đơn hàng');
        mockPurchases[index] = {
            ...mockPurchases[index],
            status: newStatus
        };
    },

    // Lấy chi tiết một đơn hàng
    getById: async (id: number): Promise<PurchaseHistory | undefined> => {
        await delay(300);
        return mockPurchases.find(p => p.id === id);
    },

    // Tìm kiếm đơn hàng theo bộ lọc
    search: async (params: {
        startDate?: string;
        endDate?: string;
        customerName?: string;
        minAmount?: number;
        maxAmount?: number;
        paymentMethod?: string;
        status?: string;
    }): Promise<PurchaseHistory[]> => {
        await delay(500);
        
        let filtered = [...mockPurchases];

        if (params.startDate) {
            filtered = filtered.filter(p => p.orderDate >= params.startDate!);
        }

        if (params.endDate) {
            filtered = filtered.filter(p => p.orderDate <= params.endDate!);
        }

        if (params.customerName) {
            const searchName = params.customerName.toLowerCase();
            filtered = filtered.filter(p => 
                p.customerName.toLowerCase().includes(searchName)
            );
        }

        if (params.minAmount) {
            filtered = filtered.filter(p => p.totalAmount >= params.minAmount!);
        }

        if (params.maxAmount) {
            filtered = filtered.filter(p => p.totalAmount <= params.maxAmount!);
        }

        if (params.paymentMethod) {
            filtered = filtered.filter(p => p.paymentMethod === params.paymentMethod);
        }

        if (params.status) {
            filtered = filtered.filter(p => p.status === params.status);
        }

        return filtered;
    },

    // Thống kê tổng quan
    getStatistics: async () => {
        await delay(300);
        return {
            totalOrders: mockPurchases.length,
            completedOrders: mockPurchases.filter(p => p.status === 'completed').length,
            pendingOrders: mockPurchases.filter(p => p.status === 'pending').length,
            cancelledOrders: mockPurchases.filter(p => p.status === 'cancelled').length,
            totalRevenue: mockPurchases
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.totalAmount, 0)
        };
    }
};
