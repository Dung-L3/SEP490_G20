

import React, { useEffect, useState } from 'react';
import TableMap from '../../components/TableMap';
import { tableApi } from '../../api/tableApi';
import { type UiTable, mapApiTableToUiTable } from '../../utils/tableMapping';

const TableView = () => {
  const [tables, setTables] = useState<UiTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await tableApi.getAll();
        const uiTables = data.map(mapApiTableToUiTable);
        setTables(uiTables);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách bàn');
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  if (loading) return <div>Đang tải dữ liệu bàn...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1>Table View (Waiter)</h1>
      <TableMap tables={tables} />
    </div>
  );
};

export default TableView;
