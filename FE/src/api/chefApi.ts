export const BASE_URL = '/api';

export interface KitchenOrderItem {
  orderDetailId: number;
  orderId: number;
  dishName: string;
  quantity: number;
  status: string;
  notes?: string;
  tableNumber: string;
  orderTime: string;
}

export interface OrderStatus {
  value: string;
  label: string;
  icon: React.FC<any>;
  color: string;
  bgColor: string;
}

import { Clock, ChefHat, AlertCircle } from 'lucide-react';

export const statusList: OrderStatus[] = [
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: AlertCircle,
    color: 'border-red-400 text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    value: 'pending',
    label: 'Đơn chờ',
    icon: Clock,
    color: 'border-yellow-400 text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    value: 'processing',
    label: 'Đã chế biến xong',
    icon: ChefHat,
    color: 'border-blue-400 text-blue-600', 
    bgColor: 'bg-blue-50',
  }
];

const parseJsonSafe = async (res: Response) => {
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
  }
  return await res.json();
};

const enrichOrders = (data: any[]): KitchenOrderItem[] => {
  return data.map((item, idx) => {
    // Backend đã trả về tableNumber rồi, chỉ cần kiểm tra và format
    let tableNumber = item.tableNumber || 'Bàn không xác định';
    
    // Đảm bảo có prefix "Bàn" nếu chưa có và không phải "Bàn không xác định"
    if (tableNumber !== 'Bàn không xác định' && 
        !tableNumber.toLowerCase().includes('bàn') && 
        !tableNumber.toLowerCase().includes('table')) {
      tableNumber = `Bàn ${tableNumber}`;
    }

    return {
      ...item,
      tableNumber,
      orderTime: item.orderTime || new Date(Date.now() - idx * 60000).toISOString(),
    };
  });
};

export const fetchPendingOrders = async (): Promise<KitchenOrderItem[]> => {
  const res = await fetch(`${BASE_URL}/chef/orders/pending`);
  const data = await parseJsonSafe(res);
  
  // Debug log để xem data thực tế
  console.log('Raw data from backend:', data);
  if (data.length > 0) {
    console.log('First order structure:', data[0]);
  }
  
  const enrichedData = enrichOrders(data);
  console.log('Enriched data:', enrichedData);
  
  return enrichedData;
};

export const updateOrderStatus = async (orderDetailId: number, status: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/chef/orders/${orderDetailId}/status?status=${status}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update order status: ${errorText}`);
  }
};

export const cancelOrder = async (orderDetailId: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/chef/orders/${orderDetailId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Không thể hủy đơn hàng: ${errorText}`);
  }
};
