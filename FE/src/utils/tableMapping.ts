import type { Table as ApiTable } from '../types/Table';

export interface UiTable {
  id: number;
  name: string;
  status: string;
  capacity: number;
  areaId: number;
  isWindow?: boolean;
  notes?: string;
}

export const mapApiTableToUiTable = (apiTable: any): UiTable => {
  return {
    id: apiTable.tableId || apiTable.id,
    name: apiTable.tableName || apiTable.name || `Bàn ${apiTable.tableId || apiTable.id}`,
    status: apiTable.status || 'AVAILABLE',
    capacity: 4,
    areaId: apiTable.areaId || 1,
    isWindow: apiTable.isWindow || false,
    notes: apiTable.notes || ''
  };
};

export const mapApiTableToUiTableFixed = (apiTable: any): UiTable => {
  // Enhanced mapping with better status handling
  let displayStatus = apiTable.status || 'AVAILABLE';
  
  // Normalize status values
  if (displayStatus === 'Available' || displayStatus === 'AVAILABLE') {
    displayStatus = 'Available';
  } else if (displayStatus === 'Occupied' || displayStatus === 'OCCUPIED') {
    displayStatus = 'Occupied';
  } else if (displayStatus === 'Reserved' || displayStatus === 'RESERVED') {
    displayStatus = 'Reserved';
  }

  return {
    id: apiTable.tableId || apiTable.id,
    name: apiTable.tableName || apiTable.name || `Bàn ${apiTable.tableId || apiTable.id}`,
    status: displayStatus,
    capacity: apiTable.capacity || 4,
    areaId: apiTable.areaId || 1
  };
};

export const mapUiTableToApiTable = (uiTable: UiTable): Omit<ApiTable, 'tableId'> => {
  return {
    tableName: uiTable.name,
    areaId: uiTable.areaId,
    status: uiTable.status,
    isWindow: uiTable.isWindow || false,
    notes: uiTable.notes || '',
    createdAt: new Date().toISOString(),
    orders: []
  };
};