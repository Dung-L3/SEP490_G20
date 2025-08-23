import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTakeawayOrder } from '../api/publicTakeawayApi.ts';
import type { CreateTakeawayOrderRequest } from '../api/publicTakeawayApi.ts';

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

const TakeawayOrderPublic: React.FC = () => {
    const navigate = useNavigate();

    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<TakeawayItem[]>([]);
    const [subTotal, setSubTotal] = useState(0);
    const [loading, setLoading] = useState(false);


    // Prefill tên/điện thoại nếu đã lưu
    useEffect(() => {
        const infoRaw = localStorage.getItem(INFO_KEY);
        if (infoRaw) {
            try {
                const info = JSON.parse(infoRaw) as { customerName?: string; phone?: string };
                setCustomerName(info.customerName ?? '');
                setPhone(info.phone ?? '');
            } catch {
                // dữ liệu cache hỏng → xoá
                localStorage.removeItem(INFO_KEY);
            }
        }
    }, []);

    // Đọc món từ localStorage do /menu lưu
    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const arr = JSON.parse(raw) as TakeawayItem[];
            setItems(arr);
        } catch {
            setItems([]);
        }
    }, []);

    useEffect(() => {
        const sum = items.reduce(
            (acc, it) => acc + (it.unitPrice ?? 0) * (it.quantity ?? 0),
            0
        );
        setSubTotal(sum);
    }, [items]);

    const handleClearItems = () => {
        localStorage.removeItem(STORAGE_KEY);
        setItems([]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (items.length === 0) {
            alert('Bạn chưa chọn món. Bấm "Chọn món" để thêm.');
            return;
        }

        // Map đúng type gửi BE (bỏ item thiếu id)
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
            alert('Các món đã chọn thiếu mã món/combo. Vui lòng chọn lại từ /menu (cần có dishId/comboId).');
            return;
        }

        setLoading(true);
        try {
            // lưu info cho lần sau
            localStorage.setItem(INFO_KEY, JSON.stringify({ customerName, phone }));

            const payload: CreateTakeawayOrderRequest = {
                customerName,
                phone,
                notes,
                items: mapped,
                orderType: 'TAKEAWAY',        // thêm
                source: 'PUBLIC_TAKEAWAY',    // thêm
            };

            // ⬇️ Nhận response để lấy orderId
            const resp = await createTakeawayOrder(payload);

            // ⬇️ Đặt cờ để /chef tự reload ngay & highlight đơn mới
            sessionStorage.setItem(
                'chef_force_reload',
                JSON.stringify({ orderId: resp.orderId, ts: Date.now() })
            );

            // Xoá giỏ & sang bếp (có thể thêm query để highlight)
            localStorage.removeItem(STORAGE_KEY);
            navigate(`/chef?highlight=${resp.orderId}`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Tạo đơn thất bại';
            alert(message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Đơn Mang đi</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Thông tin khách */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1">Tên khách hàng</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Số điện thoại</label>
                        <input
                            type="tel"
                            className="w-full border rounded px-3 py-2"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Ghi chú đơn hàng */}
                <div>
                    <label className="block mb-1">Ghi chú đơn hàng</label>
                    <textarea
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Món đã chọn */}
                <div className="bg-white border rounded-lg">
                    <div className="flex items-center justify-between p-3 border-b">
                        <h2 className="font-semibold">Món đã chọn</h2>
                        <div className="flex gap-2">
                            <Link to="/menu?mode=takeaway" className="px-3 py-1 rounded bg-blue-600 text-white">
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
                                            {it.name || (it.kind === 'dish' ? `Món #${it.dishId}` : `Combo #${it.comboId}`)}
                                        </td>
                                        <td className="border px-2 py-1 text-center">{it.quantity}</td>
                                        <td className="border px-2 py-1 text-right">{formatVnd(it.unitPrice)}</td>
                                        <td className="border px-2 py-1 text-right">
                                            {formatVnd((it.unitPrice ?? 0) * (it.quantity ?? 0))}
                                        </td>
                                        <td className="border px-2 py-1">{it.notes || '—'}</td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr>
                                    <td className="border px-2 py-2 text-right font-semibold" colSpan={3}>
                                        Tổng
                                    </td>
                                    <td className="border px-2 py-2 text-right font-semibold">{formatVnd(subTotal)}</td>
                                    <td className="border" />
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
                        className="px-6 py-2 rounded bg-green-600 text-white disabled:opacity-50"
                    >
                        {loading ? 'Đang tạo...' : 'Tạo đơn'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TakeawayOrderPublic;