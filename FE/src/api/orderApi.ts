export interface TableInfo {
  id: number;
  name: string;
  status: string;
  capacity: number;
}

export interface CreateOrderResponse {
  orderId: number;
  message: string;
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
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  quantity?: number;
  orderStatus?: 'pending' | 'cooking' | 'completed';
  orderDetailId?: number;
}

const BASE_URL = '/api';

export const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
  try {
    console.log('Creating order:', orderData);
    
    const response = await fetch(`${BASE_URL}/waiter/orders/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create order: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Order created successfully:', result);
    
    return {
      orderId: result.orderId || 1,
      message: result.message || 'Order created successfully'
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const fetchOccupiedTables = async (): Promise<TableInfo[]> => {
  try {
    console.log('Fetching occupied tables...');
    const response = await fetch(`${BASE_URL}/waiter/tables?status=OCCUPIED`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Tables API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tables API error:', response.status, errorText);
      throw new Error(`Failed to fetch tables: ${response.status}`);
    }

    const data = await response.json();
    console.log('Tables data received:', data);
    
    if (!Array.isArray(data)) {
      console.warn('Expected array but got:', typeof data, data);
      return [];
    }

    return data.map((table: any) => ({
      id: table.tableId || table.id || 0,
      name: table.tableName || table.name || 'Unknown Table',
      status: table.status || 'AVAILABLE',
      capacity: table.capacity || 4
    }));
  } catch (error) {
    console.error('Error fetching occupied tables:', error);
    
    // Return fallback data
    return [
      { id: 1, name: 'Bàn 1', status: 'OCCUPIED', capacity: 4 },
      { id: 2, name: 'Bàn 2', status: 'OCCUPIED', capacity: 6 }
    ];
  }
};

export const fetchMenuItems = async (search: string = ''): Promise<MenuItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/waiter/menu?search=${encodeURIComponent(search)}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch menu items: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
};

export const updateTableStatus = async (tableId: number, status: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/waiter/tables/${tableId}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error(`Failed to update table status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating table status:', error);
    throw error;
  }
};

export const fetchOrderStatus = async (orderDetailId: number): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/waiter/orders/details/${orderDetailId}/status`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order status: ${response.status}`);
    }

    const data = await response.json();
    return data.status || 'pending';
  } catch (error) {
    console.error('Error fetching order status:', error);
    return 'pending';
  }
};

export const fetchOrderItems = async (tableId: number): Promise<MenuItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/waiter/orders/table/${tableId}/active`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order items: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
};