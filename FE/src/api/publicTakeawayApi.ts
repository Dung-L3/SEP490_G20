// src/api/publicTakeawayApi.ts
export interface CreateTakeawayOrderRequest {
    customerName: string;
    phone: string;
    notes?: string;
    items: Array<{
        dishId?: number | null;
        comboId?: number | null;
        quantity: number;
        unitPrice: number;
        notes?: string;
    }>;
}

// BE có thể serialize BigDecimal thành number hoặc string → dùng union
export interface TakeawayOrderResponse {
    orderId: number;
    customerName: string;
    phone: string;
    notes?: string;
    subTotal: number | string;
    finalTotal: number | string;
    items?: Array<{
        dishId?: number | null;
        comboId?: number | null;
        quantity: number;
        unitPrice: number | string;
        notes?: string;
    }>;
}

export async function createTakeawayOrder(
    payload: CreateTakeawayOrderRequest
): Promise<TakeawayOrderResponse> {
    const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create takeaway order');
    }

    return res.json() as Promise<TakeawayOrderResponse>;
}