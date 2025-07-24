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
}

const BASE_URL = 'http://localhost:8080/api';

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
    status: item.status === 'OCCUPIED' ? 'Đang phục vụ' : item.status,
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

interface OrderDetails {
  dishId: number;
  quantity: number;
  note: string;
}

interface CreateOrderRequest {
  tableId: number;
  orderDetails: OrderDetails[];
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
    throw new Error(errorText || 'Failed to submit order');
  }

  const result = await response.json();
  return result;
};