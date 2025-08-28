// src/pages/CustomerList.tsx
import React from 'react';
import TaskbarReceptionist from '../../components/TaskbarReceptionist'; // đổi path nếu khác
import axiosClient from '../../api/axiosClient';

type Customer = {
  customerId: number;
  fullName: string;
  phone: string;
  loyatyPoints: number,
  memberSince: string; // yyyy-MM-dd
};

// format dd/MM/yyyy, an toàn với chuỗi yyyy-MM-dd
const formatMemberSince = (s?: string) => {
  if (!s) return '—';
  // tránh lệch múi giờ
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return s;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function CustomerList() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r bg-white">
        <div className="sticky top-0">
          <TaskbarReceptionist />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        <CustomerListContent />
      </main>
    </div>
  );
}

function CustomerListContent() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Chỉ cho nhập chữ số
  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    setSearch(onlyDigits);
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axiosClient.get<Customer[]>('/users/getAllCustomers', {
          withCredentials: true,
        });
        if (!mounted) return;

        // Map đúng trường theo API mới
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map((c: any) => ({
          customerId: c.customerId,
          fullName: c.fullName,
          phone: c.phone,
          loyatyPoints: c.loyatyPoints,
          memberSince: c.memberSince, // yyyy-MM-dd
        })) as Customer[];

        setCustomers(mapped);
      } catch (err: any) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message || err?.message || 'Không thể tải danh sách khách hàng'
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    if (!search) return customers;
    return customers.filter((c) => (c.phone ?? '').includes(search));
  }, [customers, search]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-600">Lỗi: {error}</div>;

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Danh sách khách hàng</h1>

      {/* Search theo số điện thoại */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="phoneSearch">
          Tìm theo số điện thoại
        </label>
        <input
          id="phoneSearch"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Nhập số điện thoại..."
          value={search}
          onChange={onChangeSearch}
          className="w-full md:w-96 border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Họ tên</th>
              <th className="px-4 py-2">Số điện thoại</th>
                <th className="px-4 py-2">Loyaty Points</th>
              <th className="px-4 py-2">MemberSince</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={3}>
                  Không có khách hàng phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.customerId} className="border-t">
                  <td className="px-4 py-2">{c.fullName}</td>
                  <td className="px-4 py-2">{c.phone}</td>
                  <td className="px-4 py-2">{c.loyatyPoints}</td>
                  <td className="px-4 py-2">{formatMemberSince(c.memberSince)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
