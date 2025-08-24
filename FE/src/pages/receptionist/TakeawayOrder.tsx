/* src/pages/receptionist/TakeawayOrder.tsx */
import React, { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import TaskbarReceptionist from '../../components/TaskbarReceptionist';
import { Link } from 'react-router-dom';

type ItemKind = 'dish' | 'combo';
interface OrderItem {
  kind: ItemKind;
  dishId?: number | null;
  comboId?: number | null;
  name?: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

const STORAGE_KEY = 'takeaway_selection';

const formatVnd = (n?: number) =>
    typeof n === 'number' ? `${n.toLocaleString('vi-VN')} đ` : '0 đ';

// ===== Validate rules =====
const PHONE_RE = /^\d{10}$/;           // đúng 10 chữ số
const NAME_NO_DIGIT_RE = /^[^\d]+$/;   // không chứa số
const MIN_NAME_LEN = 10;               // tối thiểu 10 ký tự
const MAX_NOTE_LEN = 200;              // ghi chú tối đa 200 ký tự

const TakeawayOrder: React.FC = () => {
  // ===== FORM STATE =====
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ===== Load giỏ từ localStorage =====
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
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) loadFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ===== Tính subtotal =====
  useEffect(() => {
    setSubTotal(items.reduce((s, it) => s + (it.unitPrice ?? 0) * (it.quantity ?? 0), 0));
  }, [items]);

  const handleClearItems = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  // cập nhật 1 item + đồng bộ localStorage
  const updateItemField = (idx: number, patch: Partial<OrderItem>) => {
    setItems(prev => {
      const next = [...prev];
      const merged = { ...next[idx], ...patch };

      // Chuẩn hoá quantity nếu có
      if (patch.quantity != null) {
        const q = Number(patch.quantity);
        merged.quantity = Number.isFinite(q) && q >= 1 ? Math.floor(q) : 1;
      }
      // Cắt ghi chú món nếu quá dài
      if (typeof patch.notes === 'string') {
        merged.notes = patch.notes.slice(0, MAX_NOTE_LEN);
      }

      next[idx] = merged;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ===== Validate form =====
  const validateForm = (): string[] => {
    const errs: string[] = [];
    const nameTrim = customerName.trim();
    const phoneTrim = phone.trim();

    if (!nameTrim) {
      errs.push('Vui lòng nhập tên khách hàng.');
    } else if (!NAME_NO_DIGIT_RE.test(nameTrim)) {
      errs.push('Tên khách hàng không được chứa số.');
    } else if (nameTrim.length < MIN_NAME_LEN) {
      errs.push(`Tên khách hàng phải có ít nhất ${MIN_NAME_LEN} ký tự.`);
    }

    if (!PHONE_RE.test(phoneTrim)) {
      errs.push('Số điện thoại phải gồm đúng 10 chữ số.');
    }

    if (items.length === 0) {
      errs.push('Bạn chưa chọn món — bấm “+ Chọn món”.');
    }

    items.forEach((it, idx) => {
      if (!Number.isInteger(it.quantity) || it.quantity < 1) {
        errs.push(`Món #${idx + 1} (“${it.name ?? 'Không tên'}”) có SL không hợp lệ.`);
      }
      if (typeof it.notes === 'string' && it.notes.length > MAX_NOTE_LEN) {
        errs.push(`Ghi chú của món #${idx + 1} vượt quá ${MAX_NOTE_LEN} ký tự.`);
      }
    });

    if (orderNotes.length > MAX_NOTE_LEN) {
      errs.push(`Ghi chú đơn hàng vượt quá ${MAX_NOTE_LEN} ký tự.`);
    }

    return errs;
  };

  // ===== Submit =====
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Chuẩn hoá trước khi validate
    const nameTrim = customerName.trim();
    const phoneTrim = phone.trim();
    if (nameTrim !== customerName) setCustomerName(nameTrim);
    if (phoneTrim !== phone) setPhone(phoneTrim);

    const errs = validateForm();
    if (errs.length) {
      alert(errs.join('\n'));
      return;
    }

    const mapped = items
        .map(it => {
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
      alert('Các món đã chọn thiếu mã món/combo. Vui lòng chọn lại từ menu.');
      return;
    }

    const payload = {
      customerName: nameTrim,
      phone: phoneTrim,
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

      alert('Tạo đơn mang đi thành công');

      // Lấy orderId (nếu có) để Chef biết đơn mới
      const orderId = (res?.data && (res.data.orderId ?? res.data.id)) as number | undefined;
      if (orderId) {
        // Báo Chef tự reload + highlight đơn mới
        sessionStorage.setItem(
            'chef_force_reload',
            JSON.stringify({ orderId, ts: Date.now() })
        );
      }

      // 1) Clear giỏ + reset form
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
      setCustomerName('');
      setPhone('');
      setOrderNotes('');

      // 2) Refresh lại đúng trang hiện tại (không rời trang, không mở tab mới)
      window.location.reload();
      return;
    } catch (err) {
      console.error(err);
      alert('Tạo đơn thất bại');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn Mang Đi</h1>
            <p className="text-gray-600">
              Trang tạo đơn mang đi cho khách hàng của lễ tân
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
                      onChange={e => {
                        // Chặn số trong tên
                        const v = e.target.value.replace(/\d+/g, '');
                        setCustomerName(v);
                      }}
                      required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Không chứa số, tối thiểu {MIN_NAME_LEN} ký tự.
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Số điện thoại</label>
                  <input
                      type="tel"
                      inputMode="numeric"
                      pattern="\d{10}"
                      maxLength={10}
                      className="w-full border rounded px-3 py-2"
                      value={phone}
                      onChange={e => {
                        // Chỉ cho phép số, tối đa 10
                        const onlyDigits = e.target.value.replace(/\D+/g, '').slice(0, 10);
                        setPhone(onlyDigits);
                      }}
                      required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Yêu cầu đúng 10 chữ số.
                  </div>
                </div>
              </div>

              {/* Món đã chọn */}
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
                                    onChange={e =>
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
                                    onChange={e =>
                                        updateItemField(i, { notes: e.target.value.slice(0, MAX_NOTE_LEN) })
                                    }
                                    placeholder="Ghi chú"
                                />
                                <div className="text-[10px] text-gray-500 mt-0.5">
                                  Tối đa {MAX_NOTE_LEN} ký tự
                                </div>
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
                    onChange={e => setOrderNotes(e.target.value.slice(0, MAX_NOTE_LEN))}
                />
                <div className="text-xs text-gray-500 mt-1">Tối đa {MAX_NOTE_LEN} ký tự</div>
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
