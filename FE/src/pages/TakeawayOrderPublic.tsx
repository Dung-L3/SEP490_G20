// src/pages/TakeawayOrderPublic.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { createTakeawayOrder } from '../api/publicTakeawayApi';
import type { CreateTakeawayOrderRequest } from '../api/publicTakeawayApi';

type TakeawayItem = {
    kind: 'dish' | 'combo';
    dishId?: number | null;
    comboId?: number | null;
    name?: string;
    quantity: number;
    unitPrice?: number;
    notes?: string;
};

const STORAGE_KEY = 'takeaway_selection';
const INFO_KEY = 'takeaway_info';

const formatVnd = (n?: number) =>
    typeof n === 'number' ? `${n.toLocaleString('vi-VN')} đ` : '0 đ';

// ==== VALIDATION RULES ====
const PHONE_RE = /^\d{10}$/;          // 10 chữ số
const MAX_NOTE_LEN = 100;             // tối đa 100 ký tự cho địa chỉ (notes)

// === helper: ép kiểu an toàn số nguyên dương
const toPosInt = (v: any, def = 1) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
};

// === helper: ép số (hoặc null) từ string/number
const toNumOrNull = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

// === Chuẩn hoá 1 item lấy từ localStorage để đảm bảo hỗ trợ combo
function normalizeSelectionItem(raw: any): TakeawayItem | null {
    if (!raw || typeof raw !== 'object') return null;

    // Một số menu cũ dùng 'type' thay vì 'kind'
    const kind: 'dish' | 'combo' =
        raw.kind === 'combo' || raw.type === 'combo'
            ? 'combo'
            : 'dish';

    // Ép id về number|null (tránh trường hợp là string)
    const dishId = toNumOrNull(raw.dishId);
    const comboId = toNumOrNull(raw.comboId);

    // Nếu là combo nhưng không có comboId (hoặc ngược lại) thì cố đoán theo id nào tồn tại
    const finalKind: 'dish' | 'combo' =
        comboId != null ? 'combo' : dishId != null ? 'dish' : kind;

    const quantity = toPosInt(raw.quantity, 1);
    const unitPrice = Number.isFinite(Number(raw.unitPrice)) ? Number(raw.unitPrice) : undefined;

    const nameFromId =
        finalKind === 'combo'
            ? (comboId != null ? `Combo #${comboId}` : 'Combo')
            : (dishId != null ? `Món #${dishId}` : 'Món');

    return {
        kind: finalKind,
        dishId: finalKind === 'dish' ? dishId : null,
        comboId: finalKind === 'combo' ? comboId : null,
        name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : nameFromId,
        quantity,
        unitPrice,
        notes: typeof raw.notes === 'string' ? raw.notes : undefined,
    };
}

const TakeawayOrderPublic: React.FC = () => {
    const [customerName, setCustomerName] = useState(''); // FREE: không bắt buộc
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');               // dùng notes (payload giữ nguyên)
    const [items, setItems] = useState<TakeawayItem[]>([]);
    const [subTotal, setSubTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const location = useLocation();

    // Đọc món từ localStorage do /menu lưu + CHUẨN HOÁ (support combo)
    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            setItems([]);
            return;
        }
        try {
            const arr = JSON.parse(raw);
            const normalized = Array.isArray(arr)
                ? arr.map(normalizeSelectionItem).filter(Boolean) as TakeawayItem[]
                : [];
            setItems(normalized);
        } catch {
            setItems([]);
        }
    }, [location.key]); // reload khi quay lại từ trang menu

    // Tính tổng tiền
    useEffect(() => {
        const sum = items.reduce(
            (acc, it) => acc + (it.unitPrice ?? 0) * (it.quantity ?? 0),
            0
        );
        setSubTotal(sum);
    }, [items]);

    // Cập nhật 1 item và đồng bộ về localStorage
    const updateItemField = (idx: number, patch: Partial<TakeawayItem>) => {
        setItems((prev) => {
            const next = [...prev];
            const merged = { ...next[idx], ...patch };

            if (patch.quantity != null) {
                merged.quantity = toPosInt(patch.quantity, 1);
            }
            if (typeof patch.notes === 'string' && patch.notes.length > MAX_NOTE_LEN) {
                merged.notes = patch.notes.slice(0, MAX_NOTE_LEN);
            }

            next[idx] = merged;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const handleClearItems = () => {
        localStorage.removeItem(STORAGE_KEY);
        setItems([]);
    };

    // ===== Validate trước khi submit =====
    const validateForm = (): string[] => {
        const errs: string[] = [];

        // Tên khách: ở yêu cầu trước bạn muốn bắt buộc tên — giữ nguyên như code bạn gửi
        const nameTrim = customerName.trim();
        if (!nameTrim) {
            errs.push('Vui lòng nhập tên khách hàng.');
        }

        if (!PHONE_RE.test(phone.trim())) {
            errs.push('Số điện thoại phải gồm đúng 10 chữ số.');
        }

        const notesTrim = notes.trim();
        if (!notesTrim) {
            errs.push('Vui lòng nhập địa chỉ đơn hàng.');
        } else if (notesTrim.length > MAX_NOTE_LEN) {
            errs.push(`Địa chỉ đơn hàng vượt quá ${MAX_NOTE_LEN} ký tự.`);
        }

        if (items.length === 0) {
            errs.push('Bạn chưa chọn món — bấm “+ Chọn món”.');
        }

        items.forEach((it, idx) => {
            if (!Number.isInteger(it.quantity) || it.quantity < 1) {
                errs.push(`Món #${idx + 1} (“${it.name ?? 'Không tên'}”) có SL không hợp lệ.`);
            }
            // ghi chú từng món dùng cùng MAX_NOTE_LEN cho đơn giản
            if (typeof it.notes === 'string' && it.notes.length > MAX_NOTE_LEN) {
                errs.push(`Ghi chú của món #${idx + 1} vượt quá ${MAX_NOTE_LEN} ký tự.`);
            }
            // BỔ SUNG: kiểm tra id tuỳ theo kind (đảm bảo combo được submit)
            if (it.kind === 'dish' && typeof it.dishId !== 'number') {
                errs.push(`Món #${idx + 1} thiếu dishId hợp lệ.`);
            }
            if (it.kind === 'combo' && typeof it.comboId !== 'number') {
                errs.push(`Món #${idx + 1} là combo nhưng thiếu comboId hợp lệ.`);
            }
        });

        return errs;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedName = customerName.trim();
        const trimmedPhone = phone.trim();
        const trimmedNotes = notes.trim();
        if (trimmedName !== customerName) setCustomerName(trimmedName);
        if (trimmedPhone !== phone) setPhone(trimmedPhone);
        if (trimmedNotes !== notes) setNotes(trimmedNotes);

        const errs = validateForm();
        setErrors(errs);
        if (errs.length) return;

        const mapped: CreateTakeawayOrderRequest['items'] = items
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
            setErrors(['Các món đã chọn thiếu mã món/combo. Vui lòng chọn lại từ /menu (cần có dishId/comboId).']);
            return;
        }

        try {
            setLoading(true);
            setErrors([]);

            localStorage.setItem(INFO_KEY, JSON.stringify({ customerName: trimmedName, phone: trimmedPhone }));

            const payload: CreateTakeawayOrderRequest = {
                customerName: trimmedName,
                phone: trimmedPhone,
                notes: trimmedNotes,   // "Địa chỉ đơn hàng"
                items: mapped,
                orderType: 'TAKEAWAY',
                source: 'PUBLIC_TAKEAWAY',
            };

            const resp = await createTakeawayOrder(payload);

            // Chef: reload + highlight
            sessionStorage.setItem(
                'chef_force_reload',
                JSON.stringify({ orderId: resp.orderId, ts: Date.now() })
            );

            alert('Tạo đơn thành công! Bếp sẽ nhận được ngay.');

            // reset giỏ & form
            localStorage.removeItem(STORAGE_KEY);
            setItems([]);
            setNotes('');
            setSubTotal(0);
            setCustomerName('');
            setPhone('');
            setErrors([]);

            window.location.reload();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Tạo đơn thất bại';
            setErrors([msg]);
        } finally {
            setLoading(false);
        }
    };

    // tạo URL quay lại đúng trang hiện tại sau khi chọn món
    const returnTo = encodeURIComponent('/takeaway-order'); // đổi theo route thực tế của bạn

    return (
        <div className="min-h-screen bg-gray-900">
            <Header />

            <section className="py-20 bg-gray-800 text-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
                        Đơn Mang đi
                    </h2>

                    {/* Error box */}
                    {errors.length > 0 && (
                        <div className="max-w-4xl mx-auto mb-6 bg-red-100 text-red-800 border border-red-400 p-4 rounded-lg">
                            <ul className="list-disc pl-6">
                                {errors.map((er, idx) => (
                                    <li key={idx}>{er}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="max-w-4xl mx-auto bg-gray-700 p-8 rounded-lg shadow-xl space-y-6 relative"
                    >
                        {loading && (
                            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-lg">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
                            </div>
                        )}

                        {/* Thông tin khách */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-lg font-medium">Tên khách hàng</label>
                                <input
                                    type="text"
                                    className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Ví dụ: Anh Nam"
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium">Số điện thoại</label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="\d{10}"
                                    maxLength={10}
                                    className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                                    value={phone}
                                    onChange={(e) => {
                                        const onlyDigits = e.target.value.replace(/\D+/g, '').slice(0, 10);
                                        setPhone(onlyDigits);
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Địa chỉ đơn hàng (UI) — dữ liệu vẫn là notes */}
                        <div>
                            <label className="block text-lg font-medium">Địa chỉ đơn hàng</label>
                            <textarea
                                className="w-full p-3 mt-2 text-lg text-gray-800 rounded-md"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTE_LEN))}
                                placeholder="Số nhà, đường, phường/xã, quận/huyện, thành phố..."
                                required
                            />
                        </div>

                        {/* Món đã chọn */}
                        <div className="bg-gray-600 rounded-lg border border-gray-500">
                            <div className="flex items-center justify-between p-3 border-b border-gray-500">
                                <h3 className="font-semibold">Món đã chọn</h3>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/menu?mode=takeaway&return=${returnTo}`} // THÊM: return để quay lại sau khi chọn
                                        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        + Chọn món
                                    </Link>
                                    {items.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearItems}
                                            className="px-3 py-1 rounded bg-gray-300 text-gray-900 hover:bg-gray-200"
                                        >
                                            Xoá hết
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-3">
                                {items.length === 0 ? (
                                    <div className="text-gray-200">
                                        Chưa có món nào. Bấm “+ Chọn món”.
                                    </div>
                                ) : (
                                    <table className="w-full border-collapse text-white">
                                        <thead>
                                        <tr className="bg-gray-700">
                                            <th className="border border-gray-500 px-2 py-2 text-left">Tên</th>
                                            <th className="border border-gray-500 px-2 py-2">SL</th>
                                            <th className="border border-gray-500 px-2 py-2 text-right">Đơn giá</th>
                                            <th className="border border-gray-500 px-2 py-2 text-right">Tạm tính</th>
                                            <th className="border border-gray-500 px-2 py-2">Ghi chú</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {items.map((it, i) => (
                                            <tr key={i}>
                                                <td className="border border-gray-500 px-2 py-2">
                                                    {it.name ||
                                                        (it.kind === 'dish'
                                                            ? `Món #${it.dishId}`
                                                            : `Combo #${it.comboId}`)}
                                                </td>
                                                <td className="border border-gray-500 px-2 py-2 text-center bg-white">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        className="w-16 border rounded px-2 py-1 text-center text-gray-900 bg-white"
                                                        value={it.quantity}
                                                        onChange={(e) =>
                                                            updateItemField(i, {
                                                                quantity: Math.max(1, Number(e.target.value) || 1),
                                                            })
                                                        }
                                                    />
                                                </td>
                                                <td className="border border-gray-500 px-2 py-2 text-right">
                                                    {formatVnd(it.unitPrice)}
                                                </td>
                                                <td className="border border-gray-500 px-2 py-2 text-right">
                                                    {formatVnd((it.unitPrice ?? 0) * (it.quantity ?? 0))}
                                                </td>
                                                <td className="border border-gray-500 px-2 py-2 bg-white">
                                                    <input
                                                        type="text"
                                                        className="w-full border rounded px-2 py-1 text-sm text-gray-900 bg-white"
                                                        value={it.notes ?? ''}
                                                        onChange={(e) =>
                                                            updateItemField(i, {
                                                                notes: e.target.value.slice(0, MAX_NOTE_LEN),
                                                            })
                                                        }
                                                        placeholder="Ghi chú"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                        <tfoot>
                                        <tr>
                                            <td
                                                className="border border-gray-500 px-2 py-2 text-right font-semibold"
                                                colSpan={3}
                                            >
                                                Tổng
                                            </td>
                                            <td className="border border-gray-500 px-2 py-2 text-right font-semibold">
                                                {formatVnd(subTotal)}
                                            </td>
                                            <td className="border border-gray-500" />
                                        </tr>
                                        </tfoot>
                                    </table>
                                )}
                            </div>
                        </div>

                        <div className="text-right">
                            <button
                                type="submit"
                                disabled={loading || items.length === 0}
                                className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all ${
                                    loading || items.length === 0
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                                }`}
                            >
                                {loading ? 'Đang tạo...' : 'Tạo đơn'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default TakeawayOrderPublic;
