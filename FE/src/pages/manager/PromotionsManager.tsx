// src/pages/manager/PromotionsManager.tsx
import React, { useEffect, useState, type FC } from 'react';
import TaskbarManager from '../../components/TaskbarManager';

type SpringPage<T> = {
  content: T[];
  number: number;       // current page (0-based)
  size: number;         // page size
  totalElements: number;
  totalPages: number;
};

interface Promotion {
  promoId: number;
  promoCode: string;
  promoName: string;
  description?: string | null;
  discountPercent: number | null;   
  discountAmount: number | null;   
  startDate: string;                
  endDate: string;                  
  usageLimit: number | null;        
  isActive: boolean;
}

interface PromotionPayload {
  promoCode: string;
  promoName: string;
  description?: string | null;
  discountPercent: number;      
  discountAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;           
  isActive: boolean;
}

const emptyPayload: PromotionPayload = {
  promoCode: '',
  promoName: '',
  description: '',
  discountPercent: 0,
  discountAmount: 0,
  startDate: '',
  endDate: '',
  usageLimit: 0,   
  isActive: true,
};

const PromotionsManager: FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paging + sorting
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState<'promoId,desc' | 'promoId,asc' | 'promoCode,asc' | 'promoCode,desc'>('promoId,desc');

  // Data
  const [pageData, setPageData] = useState<SpringPage<Promotion> | null>(null);
  const [filtered, setFiltered] = useState<Promotion[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all'|'active'|'inactive'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [createForm, setCreateForm] = useState<PromotionPayload>({...emptyPayload});
  const [editForm, setEditForm] = useState<PromotionPayload & { promoId: number }>({ ...emptyPayload, promoId: 0 });

  // Lỗi hiển thị đỏ trong modal
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [editErr, setEditErr] = useState<string | null>(null);

  const loadPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/promotions?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(`Tải danh sách mã giảm giá thất bại (${res.status})`);
      const data: SpringPage<Promotion> = await res.json();

      // CHUẨN HÓA: null -> 0 cho 2 trường giảm giá (phục vụ render/filter)
      const normalized = data.content.map(p => ({
        ...p,
        discountPercent: p.discountPercent ?? 0,
        discountAmount: p.discountAmount ?? 0,
      }));

      setPageData({ ...data, content: normalized });
      setFiltered(normalized);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPage(); }, [page, size, sort]);

  // Client-side filter (trên page hiện tại)
  useEffect(() => {
    if (!pageData) return;
    let tmp = [...pageData.content];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      tmp = tmp.filter(p => p.promoCode.toLowerCase().includes(q) || (p.promoName ?? '').toLowerCase().includes(q));
    }
    if (activeFilter !== 'all') {
      const v = activeFilter === 'active';
      tmp = tmp.filter(p => p.isActive === v);
    }
    if (dateFrom) tmp = tmp.filter(p => p.startDate >= dateFrom);
    if (dateTo) tmp = tmp.filter(p => p.startDate <= dateTo);
    setFiltered(tmp);
  }, [search, activeFilter, dateFrom, dateTo, pageData]);

  // NEW: Hàm kiểm tra trùng mã ngay trên trang đang hiển thị
  const codeClashLocal = (code: string, ignoreId?: number) => {
    const c = code.trim().toLowerCase();
    if (!c || !pageData) return false;
    return pageData.content.some(p =>
      p.promoId !== (ignoreId ?? -1) &&
      p.promoCode.trim().toLowerCase() === c
    );
  };

  // CHANGED: nhận thêm ignoreId để dùng cho Edit (cho phép giữ nguyên mã của chính bản ghi)
  const validatePayload = (pl: PromotionPayload, ignoreId?: number): string | null => {
    if (!pl.promoCode.trim()) return 'Vui lòng nhập mã (promoCode).';
    if (!pl.promoName.trim()) return 'Vui lòng nhập tên chương trình.';
    if (!pl.startDate) return 'Vui lòng chọn ngày bắt đầu.';
    if (!pl.endDate) return 'Vui lòng chọn ngày kết thúc.';
    // startDate phải sớm hơn endDate (so sánh chặt)
    if (pl.endDate <= pl.startDate) return 'Ngày kết thúc phải MUỘN HƠN ngày bắt đầu.';
    const pct = Number(pl.discountPercent);
    const amt = Number(pl.discountAmount);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) return 'discountPercent phải trong khoảng [0, 100].';
    if (!Number.isFinite(amt) || amt < 0) return 'discountAmount không được âm.';
    // Ít nhất 1 trong 2 > 0
    if (pct <= 0 && amt <= 0) return 'Cần nhập ÍT NHẤT một trong hai: % hoặc số tiền (> 0).';
    // usageLimit bắt buộc, min 0
    if (!Number.isFinite(pl.usageLimit)) return 'Vui lòng nhập Usage limit (số).';
    if (pl.usageLimit < 0) return 'Usage limit không được âm.';

    // NEW: kiểm tra trùng mã trên trang hiện tại
    if (codeClashLocal(pl.promoCode, ignoreId)) {
      return 'Mã khuyến mãi (promoCode) đã tồn tại ở trang hiện tại. Vui lòng nhập mã khác.';
    }

    return null;
  };

  const openCreate = () => {
    setCreateForm({...emptyPayload});
    setCreateErr(null);
    setIsCreateOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditForm({
      promoId: p.promoId,
      promoCode: p.promoCode,
      promoName: p.promoName,
      description: p.description ?? '',
      discountPercent: (p.discountPercent ?? 0),
      discountAmount: (p.discountAmount ?? 0),
      startDate: p.startDate,
      endDate: p.endDate,
      usageLimit: p.usageLimit ?? 0, 
      isActive: p.isActive,
    });
    setEditErr(null);
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    const msg = validatePayload(createForm);
    if (msg) { setCreateErr(msg); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/promotions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const t = await res.text();
        // NEW: bắt duplicate từ server (ví dụ UNIQUE/409)
        if (res.status === 409 || /duplicate|exists|unique|constraint/i.test(t)) {
          setCreateErr('Mã khuyến mãi (promoCode) đã tồn tại trong hệ thống.');
          return;
        }
        throw new Error(`Tạo mã thất bại: ${res.status} ${t}`);
      }
      setIsCreateOpen(false);
      setPage(0); 
      await loadPage();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const { promoId, ...payload } = editForm;
    const msg = validatePayload(payload, promoId); // CHANGED: truyền promoId để bỏ qua chính nó
    if (msg) { setEditErr(msg); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/promotions/update/${promoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        // NEW: bắt duplicate từ server
        if (res.status === 409 || /duplicate|exists|unique|constraint/i.test(t)) {
          setEditErr('Mã khuyến mãi (promoCode) đã tồn tại trong hệ thống.');
          return;
        }
        throw new Error(`Cập nhật thất bại: ${res.status} ${t}`);
      }
      setIsEditOpen(false);
      await loadPage();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Helpers cho input number (cho phép rỗng -> 0)
  const num = (v: string) => (v === '' ? 0 : Number(v));

  // Render
  if (loading && !pageData) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 sticky top-0"><TaskbarManager/></div>

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Quản lý Mã khuyến mãi</h1>

        {/* Filters + Add */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
          <input
            type="text"
            placeholder="Tìm theo mã / tên…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="px-3 py-2 border rounded w-64"
          />
          <div>
            <label className="block text-sm mb-1">Trạng thái</label>
            <select value={activeFilter} onChange={e=>setActiveFilter(e.target.value as any)} className="px-2 py-1 border rounded">
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Từ ngày (Start)</label>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="px-2 py-1 border rounded"/>
          </div>
          <div>
            <label className="block text-sm mb-1">Đến ngày</label>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="px-2 py-1 border rounded"/>
          </div>

          <div className="ml-auto flex gap-3 items-center">
            <div>
              <label className="block text-sm mb-1">Sắp xếp</label>
              <select value={sort} onChange={e=>setSort(e.target.value as any)} className="px-2 py-1 border rounded">
                <option value="promoId,desc">Mới nhất</option>
                <option value="promoId,asc">Cũ nhất</option>
                <option value="promoCode,asc">Mã ↑</option>
                <option value="promoCode,desc">Mã ↓</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Kích thước trang</label>
              <select value={size} onChange={e=>{ setPage(0); setSize(Number(e.target.value)); }} className="px-2 py-1 border rounded">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Thêm Mã</button>
          </div>
        </div>

        {/* Table (bấm vào hàng để chỉnh) */}
        <div className="bg-white rounded-lg shadow overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm">Mã</th>
                <th className="px-4 py-2 text-left text-sm">Tên</th>
                <th className="px-4 py-2 text-left text-sm">Giảm (%)</th>
                <th className="px-4 py-2 text-left text-sm">Giảm (đ)</th>
                <th className="px-4 py-2 text-left text-sm">Bắt đầu</th>
                <th className="px-4 py-2 text-left text-sm">Kết thúc</th>
                <th className="px-4 py-2 text-left text-sm">Usage còn</th>
                <th className="px-4 py-2 text-left text-sm">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(p => (
                <tr key={p.promoId} onClick={()=>openEdit(p)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-2 text-sm">{p.promoCode}</td>
                  <td className="px-4 py-2 text-sm">{p.promoName}</td>
                  <td className="px-4 py-2 text-sm">{p.discountPercent ?? 0}</td>
                  <td className="px-4 py-2 text-sm">{((p.discountAmount ?? 0)).toLocaleString()} đ</td>
                  <td className="px-4 py-2 text-sm">{p.startDate}</td>
                  <td className="px-4 py-2 text-sm">{p.endDate}</td>
                  <td className="px-4 py-2 text-sm">{p.usageLimit === null ? '∞' : p.usageLimit}</td>
                  <td className="px-4 py-2 text-sm">
                    {p.isActive
                      ? <span className="font-semibold text-green-600">Yes</span>
                      : <span className="font-semibold text-red-600">No</span>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="px-4 py-6 text-sm text-gray-500" colSpan={8}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageData && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Trang {pageData.number + 1}/{pageData.totalPages} • {pageData.totalElements} bản ghi
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={()=>setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ← Trước
              </button>
              <button
                disabled={!pageData || page >= (pageData.totalPages - 1)}
                onClick={()=>setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Sau →
              </button>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[520px]">
              <h2 className="text-lg font-semibold mb-2">Thêm mã khuyến mãi</h2>
              {createErr && <p className="text-red-600 text-sm mb-2">{createErr}</p>}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm">Mã</label>
                    <input
                      value={createForm.promoCode}
                      onChange={e=>{ setCreateForm(s=>({...s, promoCode: e.target.value})); setCreateErr(null); }}
                      onBlur={()=>{ // NEW: báo trùng ngay khi rời ô
                        if (codeClashLocal(createForm.promoCode)) {
                          setCreateErr('Mã khuyến mãi (promoCode) đã tồn tại ở trang hiện tại. Vui lòng nhập mã khác.');
                        }
                      }}
                      className={`w-full border rounded px-2 py-1 ${createErr?.includes('Mã khuyến mãi') ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm">Tên</label>
                    <input
                      value={createForm.promoName}
                      onChange={e=>{ setCreateForm(s=>({...s, promoName: e.target.value})); setCreateErr(null); }}
                      className="w-full border rounded px-2 py-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm">Mô tả</label>
                  <textarea
                    value={createForm.description ?? ''}
                    onChange={e=>{ setCreateForm(s=>({...s, description: e.target.value})); setCreateErr(null); }}
                    className="w-full border rounded px-2 py-1" rows={2}
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm">% giảm (0–100)</label>
                    <input
                      type="number" min={0} max={100} step="0.01" required
                      value={createForm.discountPercent}
                      onChange={e=>{ setCreateForm(s=>({...s, discountPercent: num(e.target.value)})); setCreateErr(null); }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm">Giảm số tiền (đ)</label>
                    <input
                      type="number" min={0} step="1" required
                      value={createForm.discountAmount}
                      onChange={e=>{ setCreateForm(s=>({...s, discountAmount: num(e.target.value)})); setCreateErr(null); }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Lưu ý: Ít nhất một trong hai trường trên phải &gt; 0 (được phép nhập cả hai).
                </p>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm">Bắt đầu</label>
                    <input
                      type="date" value={createForm.startDate} required
                      onChange={e=>{ setCreateForm(s=>({...s, startDate: e.target.value})); setCreateErr(null); }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm">Kết thúc</label>
                    <input
                      type="date" value={createForm.endDate} required
                      onChange={e=>{ setCreateForm(s=>({...s, endDate: e.target.value})); setCreateErr(null); }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                </div>

                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm">Usage limit</label>
                    <input
                      type="number" min={0} step="1" required
                      value={createForm.usageLimit}
                      onChange={e=>{
                        const v = e.target.value === '' ? 0 : Number(e.target.value);
                        setCreateForm(s=>({...s, usageLimit: Math.max(0, isNaN(v) ? 0 : v)}));
                        setCreateErr(null);
                      }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={createForm.isActive}
                      onChange={e=>{ setCreateForm(s=>({...s, isActive: e.target.checked})); setCreateErr(null); }}
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={()=>setIsCreateOpen(false)} className="px-4 py-2 border rounded">Huỷ</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded">Tạo</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[520px]">
              <h2 className="text-lg font-semibold mb-2">Cập nhật mã khuyến mãi</h2>
              {editErr && <p className="text-red-600 text-sm mb-2">{editErr}</p>}

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm">Mã</label>
                    <input
                      value={editForm.promoCode}
                      onChange={e=>{ setEditForm(s=>({...s, promoCode: e.target.value})); setEditErr(null); }}
                      onBlur={()=>{ // NEW: báo trùng ngay khi rời ô
                        if (codeClashLocal(editForm.promoCode, editForm.promoId)) {
                          setEditErr('Mã khuyến mãi (promoCode) đã tồn tại ở trang hiện tại. Vui lòng nhập mã khác.');
                        }
                      }}
                      className={`w-full border rounded px-2 py-1 ${editErr?.includes('Mã khuyến mãi') ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm">Tên</label>
                    <input
                      value={editForm.promoName}
                      onChange={e=>{ setEditForm(s=>({...s, promoName: e.target.value})); setEditErr(null); }}
                      className="w-full border rounded px-2 py-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm">Mô tả</label>
                  <textarea
                    value={editForm.description ?? ''}
                    onChange={e=>{ setEditForm(s=>({...s, description: e.target.value})); setEditErr(null); }}
                    className="w-full border rounded px-2 py-1" rows={2}
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm">% giảm (0–100)</label>
                    <input
                      type="number" min={0} max={100} step="0.01" required
                      value={editForm.discountPercent}
                      onChange={e=>{ setEditForm(s=>({...s, discountPercent: num(e.target.value)})); setEditErr(null); }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm">Giảm số tiền (đ)</label>
                    <input
                      type="number" min={0} step="1" required
                      value={editForm.discountAmount}
                      onChange={e=>{ setEditForm(s=>({...s, discountAmount: num(e.target.value)})); setEditErr(null); }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Lưu ý: Ít nhất một trong hai trường trên phải &gt; 0 (được phép nhập cả hai).
                </p>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm">Bắt đầu</label>
                    <input
                      type="date" value={editForm.startDate} required
                      onChange={e=>{ setEditForm(s=>({...s, startDate: e.target.value})); setEditErr(null); }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm">Kết thúc</label>
                    <input
                      type="date" value={editForm.endDate} required
                      onChange={e=>{ setEditForm(s=>({...s, endDate: e.target.value})); setEditErr(null); }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                </div>

                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm">Usage limit</label>
                    <input
                      type="number" min={0} step="1" required
                      value={editForm.usageLimit}
                      onChange={e=>{
                        const v = e.target.value === '' ? 0 : Number(e.target.value);
                        setEditForm(s=>({...s, usageLimit: Math.max(0, isNaN(v) ? 0 : v)}));
                        setEditErr(null);
                      }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={e=>{ setEditForm(s=>({...s, isActive: e.target.checked})); setEditErr(null); }}
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={()=>setIsEditOpen(false)} className="px-4 py-2 border rounded">Huỷ</button>
                <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PromotionsManager;
