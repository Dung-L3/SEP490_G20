import type { Table as ApiTable } from '../types/Table';

export interface UiTable {
  id: number;
  name: string;
  status: string;
  capacity: number;
  areaId?: number;
  type?: string;
  groupId?: number;
}

export const mapApiTableToUiTable = (apiTable: any): UiTable => {
  return {
    id: apiTable.tableId || apiTable.id,
    name: apiTable.tableName || apiTable.name || `Table ${apiTable.tableId || apiTable.id}`,
    status: apiTable.status || 'AVAILABLE',
    capacity: apiTable.capacity || 4,
    areaId: apiTable.areaId || 1,
    type: apiTable.type || 'individual',
    groupId: apiTable.groupId
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
    areaId: apiTable.areaId || 1,
    type: apiTable.type || 'individual',
    groupId: apiTable.groupId
  };
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