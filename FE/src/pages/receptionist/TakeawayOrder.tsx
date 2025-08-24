// src/pages/receptionist/TakeawayOrder.tsx
import React, { useState, useEffect} from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
//import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

interface Dish { dishId: number; dishName: string; price: number; }
interface Combo { comboId: number; comboName: string; price: number; }
type ItemKind = 'dish' | 'combo';

interface OrderItem {
  kind?: ItemKind;
  dishId?: number;
  comboId?: number;
  name?: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

const formatVnd = (n?: number) =>
  typeof n === 'number' ? `${n.toLocaleString('vi-VN')} đ` : '0 đ';

const TakeawayOrder: React.FC = () => {
  const navigate = useNavigate(); // <-- thêm
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [subTotal, setSubTotal] = useState(0);


  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [dRes, cRes] = await Promise.all([
          axios.get<Dish[]>('/api/dishes'),
          axios.get<Combo[]>('/api/combos'),
        ]);
        setDishes(dRes.data);
        setCombos(cRes.data);
      } catch (err) {
        console.warn('Không tải được dishes/combos', err);
      }
    };
    void fetchMeta();
  }, []);

  useEffect(() => {
    const sum = items.reduce((acc, it) => acc + (it.unitPrice || 0) * (it.quantity || 0), 0);
    setSubTotal(sum);
  }, [items]);

  const addItem = () => setItems(prev => [...prev, { kind: undefined, quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const changeKind = (idx: number, kind?: ItemKind) => {
    const next = [...items];
    const it = { ...next[idx] };
    it.kind = kind;
    it.dishId = undefined;
    it.comboId = undefined;
    it.name = undefined;
    it.unitPrice = 0;
    next[idx] = it;
    setItems(next);
  };

  const updateItem = (idx: number, field: keyof OrderItem, value: string) => {
    const next = [...items];
    const it = { ...next[idx] };

    if (field === 'dishId') {
      const dish = dishes.find(d => d.dishId === +value);
      it.dishId = dish?.dishId;
      it.name = dish?.dishName;
      it.unitPrice = dish?.price ?? 0;
    } else if (field === 'comboId') {
      const combo = combos.find(c => c.comboId === +value);
      it.comboId = combo?.comboId;
      it.name = combo?.comboName;
      it.unitPrice = combo?.price ?? 0;
    } else if (field === 'quantity') {
      it.quantity = Math.max(1, +value || 1);
    } else if (field === 'notes') {
      it.notes = value;
    }

    next[idx] = it;
    setItems(next);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const payload = {
    customerName,
    phone,
    notes,
    items: items.map(it => ({
      dishId: it.kind === 'dish' ? it.dishId : undefined,
      comboId: it.kind === 'combo' ? it.comboId : undefined,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      notes: it.notes,
    })),
  };

  try {
    await axios.post('/api/receptionist/orders/takeaway', payload);
    navigate('/chef');
  } catch (err) {
    console.error(err);
    alert('Tạo đơn thất bại');
  }
};


  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Đơn Mang Đi</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Tên khách hàng</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Số điện thoại</label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Danh sách món */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-medium">Món</h2>
            <button type="button" onClick={addItem} className="bg-blue-600 text-white px-4 py-1 rounded">
              + Thêm món
            </button>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Loại</th>
                <th className="border px-2 py-1">Món/Combo</th>
                <th className="border px-2 py-1">Số lượng</th>
                <th className="border px-2 py-1">Giá</th>
                <th className="border px-2 py-1">Ghi chú</th>
                <th className="border px-2 py-1 w-24">{/* trống */}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">
                    <select
                      className="w-full"
                      value={it.kind ?? ''}
                      onChange={e =>
                        changeKind(idx, (e.target.value || undefined) as ItemKind | undefined)
                      }
                    >
                      <option value="">Chọn</option>
                      <option value="dish">Món lẻ</option>
                      <option value="combo">Combo</option>
                    </select>
                  </td>

                  <td className="border px-2 py-1">
                    {it.kind === 'dish' ? (
                      <select
                        className="w-full"
                        value={it.dishId ?? ''}
                        onChange={e => updateItem(idx, 'dishId', e.target.value)}
                      >
                        <option value="">Chọn món</option>
                        {dishes.map(d => (
                          <option key={d.dishId} value={d.dishId}>
                            {d.dishName}
                          </option>
                        ))}
                      </select>
                    ) : it.kind === 'combo' ? (
                      <select
                        className="w-full"
                        value={it.comboId ?? ''}
                        onChange={e => updateItem(idx, 'comboId', e.target.value)}
                      >
                        <option value="">Chọn combo</option>
                        {combos.map(c => (
                          <option key={c.comboId} value={c.comboId}>
                            {c.comboName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-400">Chọn loại trước</span>
                    )}
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      min={1}
                      className="w-24 border rounded px-1"
                      value={it.quantity}
                      onChange={e => updateItem(idx, 'quantity', e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1 text-right">{formatVnd(it.unitPrice)}</td>

                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1"
                      value={it.notes ?? ''}
                      onChange={e => updateItem(idx, 'notes', e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="border px-2 py-3 text-center" colSpan={6}>
                    Chưa có món nào — bấm “+ Thêm món”
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <label className="block mb-1">Ghi chú đơn hàng</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Tổng tiền */}
        <div className="flex justify-end gap-2 text-lg font-medium">
          <span>SubTotal:</span>
          <span>{formatVnd(subTotal)}</span>
        </div>

        <div className="text-right">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">
            Tạo đơn
          </button>
        </div>
      </form>
    </div>
  );
};


export default TakeawayOrder;