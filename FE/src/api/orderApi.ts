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
  categoryId: number;
  quantity?: number;
  orderStatus?: 'pending' | 'cooking' | 'completed';
  orderDetailId?: number;
  isCombo?: boolean;
  comboItems?: {
    dishId: number;
    dishName: string;
    quantity: number;
  }[];
}

export interface OrderItem {
  dishId: number | null;
  comboId: number | null;
  quantity: number;
  notes?: string;
  unitPrice: number;
  isCombo: boolean;
  comboItems?: {
    dishId: number;
    dishName: string;
    quantity: number;
  }[];
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
  const response = await fetch(`${BASE_URL}/waiter/tables?status=Đang phục vụ,OCCUPIED`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Lỗi máy chủ: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.map((item: any) => ({
    id: item.id || item.tableId,
    name: item.name || item.tableName,
    status: item.status,
    capacity: parseInt(item.type || item.tableType) || 4
  }));
};

export const fetchMenuItems = async (categoryId?: number, search?: string): Promise<MenuItem[]> => {
  let endpoint = `${BASE_URL}/dishes`;
  
  if (categoryId) {
    endpoint = `${endpoint}/category/${categoryId}`;
  } else if (search?.trim()) {
    endpoint = `${endpoint}/search?name=${encodeURIComponent(search)}`;
  }

  const response = await fetch(endpoint, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Không thể lấy danh sách món ăn: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const menuData = Array.isArray(data) ? data.map(item => ({
    id: item.dishId,
    name: item.dishName,
    price: Number(item.price),
    image: item.imageUrl || '/placeholder-dish.jpg',
    status: item.status,
    categoryId: item.categoryId,
    unit: item.unit
  })) : [];

  return menuData.filter(item => item.status === true);
};

export const orderApi = {
  create: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
    try {
      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          orderType: orderData.orderType || 'DINEIN',
          tableId: orderData.tableId,
          items: orderData.items.map(item => ({
            dishId: item.dishId,
            comboId: item.comboId,
            isCombo: item.isCombo,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: item.notes || ''
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      
      return {
        orderId: result.orderId || result.id,
        message: result.message || 'Đã gửi đơn hàng thành công!',
        order: result.order || result
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
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
    throw new Error(`Không thể lấy trạng thái đơn hàng: ${response.status}`);
  }

  const data = await response.json();
  return data.status;
};

export const fetchOrderItems = async (orderId: number): Promise<MenuItem[]> => {
  const response = await fetch(`${BASE_URL}/waiter/orders/${orderId}/items`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Không thể lấy danh sách món đã đặt: ${response.status}`);
  }

  const data = await response.json();
  return data
    .filter((item: any) => item.status === 'PENDING') // Chỉ lấy món ở trạng thái pending
    .map((item: any) => ({
      id: item.dishId,
      name: item.dishName,
      price: Number(item.unitPrice),
      image: item.imageUrl || '/placeholder-dish.jpg',
      quantity: item.quantity,
      orderStatus: 'pending',
      orderDetailId: item.orderDetailId
    }));
};