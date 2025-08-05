export interface TableInfo {
  id: number;
  name: string;
  status: string;
  capacity: number;
  estimatedTime?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  status: boolean;
  quantity?: number;
  orderStatus?: 'pending' | 'cooking' | 'completed';
  orderDetailId?: number;
}

const BASE_URL = '/api';

export const fetchOccupiedTables = async (): Promise<TableInfo[]> => {
  const response = await fetch(`${BASE_URL}/waiter/tables?status=Occupied`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.map((item: any) => ({
    id: item.tableId,
    name: item.tableName,
    status: item.status,
    capacity: parseInt(item.tableType) || 4
  }));
};

export const fetchMenuItems = async (search?: string): Promise<MenuItem[]> => {
  const endpoint = search?.trim() 
    ? `${BASE_URL}/dishes/search?name=${encodeURIComponent(search)}`
    : `${BASE_URL}/dishes`;

  const response = await fetch(endpoint, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch menu items: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const menuData = Array.isArray(data) ? data.map(item => ({
    id: item.dishId,
    name: item.dishName,
    price: Number(item.price),
    image: item.imageUrl || '/placeholder-dish.jpg',
    status: item.status
  })) : [];

  return menuData.filter(item => item.status === true);
};

interface CreateOrderRequest {
  tableId: number;
  items: {
    dishId: number;
    quantity: number;
    notes: string;
    unitPrice: number;
  }[];
}

interface OrderResponse {
  orderId: number;
  status: string;
  message?: string;
}

export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  const response = await fetch(`${BASE_URL}/waiter/orders/dine-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || errorJson.error || 'Có lỗi xảy ra khi gửi đơn hàng');
    } catch (e) {
      throw new Error(errorText || 'Có lỗi xảy ra khi gửi đơn hàng');
    }
  }

  const result = await response.json();
  return result;
};

export const updateTableStatus = async (tableId: number, status: string): Promise<TableInfo> => {
  const response = await fetch(`${BASE_URL}/waiter/tables/${tableId}/status?status=${status}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json'
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `Failed to update table status: ${response.status}`);
    } catch (e) {
      throw new Error(errorText || `Failed to update table status: ${response.status}`);
    }
  }

  return response.json();
};



export const fetchOrderStatus = async (orderDetailId: number): Promise<string> => {
  const response = await fetch(`${BASE_URL}/waiter/orders/detail/${orderDetailId}/status`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order status: ${response.status}`);
  }

  return response.text();
};

export const fetchOrderItems = async (orderId: number): Promise<MenuItem[]> => {
  const response = await fetch(`${BASE_URL}/waiter/orders/${orderId}/items`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order items: ${response.status}`);
  }

  const data = await response.json();
  return data.map((item: any) => ({
    id: item.dishId,
    name: item.dishName,
    price: Number(item.unitPrice),
    image: item.imageUrl || '/placeholder-dish.jpg',
    quantity: item.quantity,
    orderStatus: item.status.toLowerCase(),
    orderDetailId: item.orderDetailId
  }));
};