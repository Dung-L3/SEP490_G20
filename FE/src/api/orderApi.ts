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

export interface OrderItem {
  dishId: number;
  quantity: number;
  notes?: string;
  unitPrice: number;
}

export interface CreateOrderRequest {
  tableId: number;
  items: OrderItem[];
  orderType?: string;
}

export interface CreateOrderResponse {
  orderId: number;
  message: string;
  order?: Order;
}

export interface Order {
  orderId: number;
  orderType: string;
  customerName?: string;
  phone?: string;
  subTotal: number;
  discountAmount: number;
  finalTotal: number;
  tableId?: number;
  createdAt: string;
  statusId: number;
  isRefunded: number;
  notes?: string;
}

const BASE_URL = '/api';
const API_URL = '/api/v1/orders';

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

export const orderApi = {
  create: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
    try {
      console.log('🚀 Sending order to API:', orderData);
      
      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          orderType: orderData.orderType || 'DINE_IN',
          tableId: orderData.tableId,
          items: orderData.items.map(item => ({
            dishId: item.dishId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: item.notes || ''
          }))
        })
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ API Success Response:', result);
      
      // Đảm bảo trả về đúng format CreateOrderResponse
      return {
        orderId: result.orderId || result.id,
        message: result.message || 'Đơn hàng đã được tạo thành công',
        order: result.order || result
      };
    } catch (error) {
      console.error('💥 Order API Error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }
      
      throw error;
    }
  },

  getAll: async (): Promise<Order[]> => {
    try {
      const response = await fetch(`${API_URL}/getAll`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Order> => {
    try {
      const response = await fetch(`${API_URL}/getById/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  }
};

export const createOrder = orderApi.create;

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