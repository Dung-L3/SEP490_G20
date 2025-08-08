import { Table as ApiTable } from '../types/Table';

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
  return {
    id: apiTable.tableId,
    name: apiTable.tableName,
    x: 0, // These will need to be persisted in the backend
    y: 0, // These will need to be persisted in the backend
    status: apiTable.status,
    capacity: Number(apiTable.tableType.split(' ')[0]) || undefined,
    estimatedTime: apiTable.notes.includes('Khách đến lúc') 
      ? apiTable.notes.split('Khách đến lúc ')[1] 
      : undefined,
    areaId: apiTable.areaId,
    isWindow: apiTable.isWindow,
    notes: apiTable.notes,
    type: apiTable.tableType
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
