
import React from 'react';
import tables from '../data/tables';
import { useNavigate } from 'react-router-dom';

const WaiterTableList: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">Danh sách bàn</h2>
      <ul className="space-y-2">
        {tables.map(table => (
          <li
            key={table.id}
            className="flex items-center justify-between p-2 border rounded hover:bg-blue-100 cursor-pointer"
            onClick={() => navigate(`/waiter/orders?table=${encodeURIComponent(table.name)}`)}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') navigate(`/waiter/orders?table=${encodeURIComponent(table.name)}`); }}
          >
            <span className="font-semibold">{table.name}</span>
            <span className={
              table.status === 'Trống' ? 'text-green-600' :
              table.status === 'Đã đặt' ? 'text-yellow-600' :
              table.status === 'Đang phục vụ' ? 'text-blue-600' :
              'text-gray-500'
            }>
              {table.status}
            </span>
            {table.estimatedTime && (
              <span className="ml-2 text-xs text-gray-500">({table.estimatedTime})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WaiterTableList;
