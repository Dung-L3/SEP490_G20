// Kiểu item cho giỏ takeaway
export type TakeawayCartItem = {
    dishId?: number | null;
    comboId?: number | null;
    name: string;
    unitPrice: number;
    quantity: number;
    notes?: string;
};

const KEY = 'takeawayCart';

export function getTakeawayCart(): TakeawayCartItem[] {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}

export function setTakeawayCart(items: TakeawayCartItem[]) {
    localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToTakeawayCart(item: TakeawayCartItem) {
    const cart = getTakeawayCart();
    const idx = cart.findIndex(i =>
        (i.dishId ?? 0) === (item.dishId ?? 0) &&
        (i.comboId ?? 0) === (item.comboId ?? 0)
    );
    if (idx >= 0) {
        cart[idx].quantity += item.quantity;
    } else {
        cart.push(item);
    }
    setTakeawayCart(cart);
}

export function updateQty(index: number, qty: number) {
    const cart = getTakeawayCart();
    if (cart[index]) {
        cart[index].quantity = Math.max(1, qty);
        setTakeawayCart(cart);
    }
}

export function removeAt(index: number) {
    const cart = getTakeawayCart();
    cart.splice(index, 1);
    setTakeawayCart(cart);
}

export function clearTakeawayCart() {
    localStorage.removeItem(KEY);
}
