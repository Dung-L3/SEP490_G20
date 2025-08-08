import type { Table as ApiTable } from '../types/Table';

export interface UiTable {
  id: number;
  name: string;
  x: number;
  y: number;
  status: string;
  capacity?: number;
  estimatedTime?: string;
  areaId: number;
  isWindow: boolean;
  notes: string;
  type: string;
}

export const mapApiTableToUiTable = (apiTable: ApiTable): UiTable => {
  try {
    // Safe null checks để tránh lỗi
    const notes = apiTable?.notes || '';
    const tableType = apiTable?.tableType || '';
    
    return {
      id: apiTable?.tableId || 0,
      name: apiTable?.tableName || '',
      x: 0, // These will need to be persisted in the backend
      y: 0, // These will need to be persisted in the backend
      status: apiTable?.status || 'Available',
      capacity: tableType && typeof tableType === 'string' && tableType.split && tableType.split(' ')[0] 
        ? (Number(tableType.split(' ')[0]) || undefined) 
        : undefined,
      estimatedTime: notes && typeof notes === 'string' && notes.includes && notes.includes('Khách đến lúc') 
        ? notes.split('Khách đến lúc ')[1] 
        : undefined,
      areaId: apiTable?.areaId || 0,
      isWindow: apiTable?.isWindow || false,
      notes: notes,
      type: tableType
    };
  } catch (error) {
    console.error('Error mapping API table to UI table:', error, apiTable);
    // Return fallback table object
    return {
      id: apiTable?.tableId || 0,
      name: 'Error Table',
      x: 0,
      y: 0,
      status: 'Available',
      capacity: undefined,
      estimatedTime: undefined,
      areaId: 0,
      isWindow: false,
      notes: '',
      type: ''
    };
  }
};

export const mapUiTableToApiTable = (uiTable: UiTable): Omit<ApiTable, 'tableId'> => {
  return {
    tableName: uiTable.name,
    areaId: uiTable.areaId,
    tableType: uiTable.type,
    status: uiTable.status,
    isWindow: uiTable.isWindow,
    notes: uiTable.notes,
    createdAt: new Date().toISOString(),
    orders: []
  };
};