/* src/pages/receptionist/TakeawayOrder.tsx */
import React, { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { message } from 'antd';
import TaskbarReceptionist from '../../components/TaskbarReceptionist';
import { Link, useNavigate } from 'react-router-dom';

type ItemKind = 'dish' | 'combo';
interface OrderItem {
  kind: ItemKind;                 // từ /menu luôn có kind
  dishId?: number | null;
  comboId?: number | null;
  name?: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

const STORAGE_KEY = 'takeaway_selection';   // dùng chung với trang Public

const formatVnd = (n?: number) =>
    typeof n === 'number' ? `${n.toLocaleString('vi-VN')} đ` : '0 đ';

const TakeawayOrder: React.FC = () => {
  const navigate = useNavigate();

  // ===== FORM =====
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ===== Đọc món đã chọn từ localStorage (do /menu ghi) =====
  const loadFromStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setItems([]);
      return;
    }
    try {
      const arr = JSON.parse(raw) as OrderItem[];
      setItems(Array.isArray(arr) ? arr : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadFromStorage();
    // nếu người dùng mở menu ở tab khác rồi quay lại (optional): nghe event storage
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) loadFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ===== Tính subtotal =====
  useEffect(() => {
    setSubTotal(
        items.reduce((s, it) => s + (it.unitPrice ?? 0) * (it.quantity ?? 0), 0)
    );
  }, [items]);

  const handleClearItems = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  // cập nhật 1 item + đồng bộ localStorage
  const updateItemField = (idx: number, patch: Partial<OrderItem>) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      // đồng bộ lại giỏ trong localStorage để nếu rời trang vẫn giữ đúng
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ===== Submit tạo đơn =====
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim()) {
      message.info('Vui lòng nhập tên khách hàng và số điện thoại');
      return;
    }
    if (items.length === 0) {
      message.info('Bạn chưa chọn món — bấm “+ Chọn món”.');
      return;
    }

    // map đúng định dạng gửi BE
    const mapped = items
        .map((it) => {
          const base = {
            quantity: it.quantity,
            unitPrice: it.unitPrice ?? 0,
            notes: it.notes,
          };
          if (it.kind === 'dish' && typeof it.dishId === 'number') {
            return { ...base, dishId: it.dishId, comboId: null };
          }
          if (it.kind === 'combo' && typeof it.comboId === 'number') {
            return { ...base, comboId: it.comboId, dishId: null };
          }
          return null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

    if (mapped.length === 0) {
      message.error('Các món đã chọn thiếu mã món/combo. Vui lòng chọn lại từ menu.');
      return;
    }

    const payload = {
      customerName,
      phone,
      notes: orderNotes,
      items: mapped,
      orderType: 'TAKEAWAY',
      source: 'RECEPTION_TAKEAWAY',
    };

    try {
      setSubmitting(true);
      const res = await axios.post('/api/receptionist/orders/takeaway', payload, {
        withCredentials: true,
      });
      message.success('Tạo đơn mang đi thành công');

      const orderId = (res?.data && (res.data.orderId ?? res.data.id)) as number | undefined;
      if (orderId) {
        // báo Chef reload + highlight
        sessionStorage.setItem(
            'chef_force_reload',
            JSON.stringify({ orderId, ts: Date.now() })
        );
        // sang bếp
        navigate(`/chef?highlight=${orderId}`);
        // xoá giỏ sau khi gửi
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // fallback: reset form
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
      setCustomerName('');
      setPhone('');
      setOrderNotes('');
    } catch (err) {
      console.error(err);
      message.error('Tạo đơn thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const returnTo = '/receptionist/takeaway';

  return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 min-h-screen sticky top-0 z-10">
          <TaskbarReceptionist />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo đơn Mang Đi</h1>
            <p className="text-gray-600">
              Nhập thông tin khách hàng, bấm “+ Chọn món” để mở menu, sau đó tạo đơn.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Thông tin khách */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Tên khách hàng</label>
                  <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Số điện thoại</label>
                  <input
                      type="tel"
                      className="w-full border rounded px-3 py-2"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                  />
                </div>
              </div>

              {/* Món đã chọn (giống Public) */}
              <div className="bg-white border rounded-lg">
                <div className="flex items-center justify-between p-3 border-b">
                  <h2 className="font-semibold">Món đã chọn</h2>
                  <div className="flex gap-2">
                    <Link
                        to={`/menu?mode=takeaway&return=${encodeURIComponent(returnTo)}`}
                        className="px-3 py-1 rounded bg-blue-600 text-white"
                    >
                      + Chọn món
                    </Link>
                    {items.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearItems}
                            className="px-3 py-1 rounded bg-gray-200"
                        >
                          Xoá hết
                        </button>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  {items.length === 0 ? (
                      <div className="text-gray-500">Chưa có món nào. Bấm “+ Chọn món”.</div>
                  ) : (
                      <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-gray-50">
                          <th className="border px-2 py-1 text-left">Tên</th>
                          <th className="border px-2 py-1">SL</th>
                          <th className="border px-2 py-1 text-right">Đơn giá</th>
                          <th className="border px-2 py-1 text-right">Tạm tính</th>
                          <th className="border px-2 py-1">Ghi chú</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((it, i) => (
                            <tr key={i}>
                              <td className="border px-2 py-1">
                                {it.name ||
                                    (it.kind === 'dish'
                                        ? `Món #${it.dishId}`
                                        : `Combo #${it.comboId}`)}
                              </td>
                              <td className="border px-2 py-1 text-center">
                                <input
                                    type="number"
                                    min={1}
                                    className="w-16 border rounded px-2 py-1 text-center"
                                    value={it.quantity}
                                    onChange={(e) =>
                                        updateItemField(i, {
                                          quantity: Math.max(1, Number(e.target.value) || 1),
                                        })
                                    }
                                />
                              </td>
                              <td className="border px-2 py-1 text-right">{formatVnd(it.unitPrice)}</td>
                              <td className="border px-2 py-1 text-right">
                                {formatVnd((it.unitPrice ?? 0) * (it.quantity ?? 0))}
                              </td>
                              <td className="border px-2 py-1">
                                <input
                                    type="text"
                                    className="w-full border rounded px-1 py-1 text-sm"
                                    value={it.notes ?? ''}
                                    onChange={e => updateItemField(i, { notes: e.target.value })}
                                    placeholder="Ghi chú"
                                />
                              </td>
                            </tr>
                        ))}
                        </tbody>
                        <tfoot>
                        <tr>
                          <td className="border px-2 py-2 text-right font-semibold" colSpan={3}>
                            Tổng
                          </td>
                          <td className="border px-2 py-2 text-right font-semibold">
                            {formatVnd(subTotal)}
                          </td>
                          <td className="border" />
                        </tr>
                        </tfoot>
                      </table>
                  )}
                </div>
              </div>

              {/* Ghi chú đơn */}
              <div>
                <label className="block mb-1 font-medium">Ghi chú đơn hàng</label>
                <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end items-center gap-3 text-lg font-semibold">
                <span>SubTotal:</span>
                <span>{formatVnd(subTotal)}</span>
              </div>

              <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => {
                      setCustomerName('');
                      setPhone('');
                      setOrderNotes('');
                      handleClearItems();
                    }}
                    className="px-4 py-2 border rounded-lg"
                    disabled={submitting}
                >
                  Xóa form
                </button>
                <button
                    type="submit"
                    className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 disabled:opacity-60"
                    disabled={submitting || items.length === 0}
                >
                  {submitting ? 'Đang tạo…' : 'Tạo đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default TakeawayOrder;
