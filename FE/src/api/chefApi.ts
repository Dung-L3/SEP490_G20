export interface KitchenOrderItem {
    orderDetailId: number;
    orderId: number;
    dishName: string;
    quantity: number;
    status: string;
    tableNumber: string;
    orderTime: string;
    notes?: string;
}

import type { LucideIcon } from 'lucide-react';
import { AlertCircle, ChefHat, CheckCircle } from 'lucide-react';

export type OrderStatus = {
    value: string;
    label: string;
    color: string;
    bgColor: string;
    icon: LucideIcon;
}

export const statusList = [
    {
        value: 'pending',
        label: 'Chờ xử lý',
        icon: AlertCircle,
        color: 'border-yellow-500 text-yellow-600',
        bgColor: 'hover:bg-yellow-50'
    },
    {
        value: 'cooking',
        label: 'Đang chế biến',
        icon: ChefHat,
        color: 'border-blue-500 text-blue-600',
        bgColor: 'hover:bg-blue-50'
    },
    {
        value: 'completed',
        label: 'Hoàn thành',
        icon: CheckCircle,
        color: 'border-green-500 text-green-600',
        bgColor: 'hover:bg-green-50'
    }
];

const BASE_URL = 'http://localhost:8080/api/chef';

export const fetchPendingOrders = async (): Promise<KitchenOrderItem[]> => {
    const response = await fetch(`${BASE_URL}/orders`, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch pending orders');
    }

    return response.json();
};

export const fetchCookingOrders = async (): Promise<KitchenOrderItem[]> => {
    const response = await fetch(`${BASE_URL}/orders/cooking`, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch cooking orders');
    }

    return response.json();
};

export const updateOrderStatus = async (orderDetailId: number, status: string): Promise<KitchenOrderItem> => {
    const endpoint = status === 'cooking' ? 'accept' : 'complete';
    const response = await fetch(`${BASE_URL}/orders/${orderDetailId}/${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || errorJson.error || `Failed to update order status to ${status}`);
        } catch (e) {
            throw new Error(errorText || `Failed to update order status to ${status}`);
        }
    }

    return response.json();
};