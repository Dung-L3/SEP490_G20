export const BASE_URL = 'http://localhost:8080/api';

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

import { Clock, Flame, CheckCircle } from 'lucide-react';

export const statusList: OrderStatus[] = [
  {
    value: 'pending',
    label: 'Đơn chờ',
    icon: Clock,
    color: 'border-yellow-400 text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    value: 'cooking',
    label: 'Đang nấu',
    icon: Flame,
    color: 'border-blue-500 text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    value: 'completed',
    label: 'Hoàn thành',
    icon: CheckCircle,
    color: 'border-green-500 text-green-600',
    bgColor: 'bg-green-50',
  },
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
  return data.map((item, idx) => ({
    ...item,
    tableNumber: item.tableNumber || 'Không rõ bàn',
    orderTime: item.orderTime || new Date(Date.now() - idx * 60000).toISOString(),
  }));
};

export const fetchPendingOrders = async (): Promise<KitchenOrderItem[]> => {
  const res = await fetch(`${BASE_URL}/chef/orders/pending`);
  const data = await parseJsonSafe(res);
  return enrichOrders(data);
};

export const fetchCookingOrders = async (): Promise<KitchenOrderItem[]> => {
  const res = await fetch(`${BASE_URL}/chef/orders/cooking`);
  const data = await parseJsonSafe(res);
  return enrichOrders(data);
};

export const updateOrderStatus = async (
  orderDetailId: number,
  newStatus: string
): Promise<KitchenOrderItem> => {
  let endpoint = '';
  if (newStatus === 'cooking') {
    endpoint = `${BASE_URL}/chef/orders/${orderDetailId}/processing`;
  } else if (newStatus === 'completed') {
    endpoint = `${BASE_URL}/chef/orders/${orderDetailId}/completed`;
  } else {
    throw new Error('Trạng thái không hợp lệ');
  }

  const res = await fetch(endpoint, {
    method: 'PUT',
  });

  const data = await parseJsonSafe(res);
  return enrichOrders([data])[0];
};
