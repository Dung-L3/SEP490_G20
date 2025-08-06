import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { mergedTableApi, type MergedTable } from '../api/mergedTableApi';

interface Table {
  tableId: number;
  tableName: string;
  status: string;
  tableType?: string;
  areaId?: number;
}

interface TableForOrder {
  id: number;
  name: string;
  status: string;
  type: 'individual' | 'merged';
  groupId?: number;
}

interface TableSelectorProps {
  onTableSelect: (table: TableForOrder) => void;
  selectedTableId?: number;
}

export interface TableSelectorRef {
  refresh: () => void;
}

const TableSelector = forwardRef<TableSelectorRef, TableSelectorProps>(({ onTableSelect, selectedTableId }, ref) => {
  const [tables, setTables] = useState<TableForOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const response = await mergedTableApi.getTablesForOrder();
        
        const processedTables: TableForOrder[] = response.map((item: any) => {
          // Kiểm tra xem đây là merged table hay individual table
          if (item.groupId !== undefined) {
            // Đây là merged table
            const mergedTable = item as MergedTable;
            return {
              id: mergedTable.groupId,
              name: mergedTable.mergedTableName,
              status: mergedTable.status,
              type: 'merged',
              groupId: mergedTable.groupId
            };
          } else {
            // Đây là individual table
            const individualTable = item as Table;
            return {
              id: individualTable.tableId,
              name: individualTable.tableName,
              status: individualTable.status,
              type: 'individual'
            };
          }
        });

        setTables(processedTables);
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError('Failed to load tables');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading tables...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {tables.map((table) => (
        <button
          key={`${table.type}-${table.id}`}
          onClick={() => onTableSelect(table)}
          className={`
            p-4 rounded-lg border-2 transition-all duration-200
            ${selectedTableId === table.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${table.status === 'Available' ? 'bg-green-50' : 
              table.status === 'Occupied' ? 'bg-red-50' : 
              table.status === 'MERGED' ? 'bg-purple-50' : 'bg-gray-50'
            }
          `}
        >
          <div className="text-sm font-medium">{table.name}</div>
          <div className="text-xs text-gray-500 mt-1">
            {table.type === 'merged' ? 'Bàn ghép' : 'Bàn đơn'}
          </div>
          <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block
            ${table.status === 'Available' ? 'bg-green-200 text-green-800' :
              table.status === 'Occupied' ? 'bg-red-200 text-red-800' :
              table.status === 'MERGED' ? 'bg-purple-200 text-purple-800' :
              'bg-gray-200 text-gray-800'
            }`}>
            {table.status}
          </div>
        </button>
      ))}
    </div>
  );
};

export default TableSelector;