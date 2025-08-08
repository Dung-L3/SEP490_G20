export interface Table {
  tableId: number;
  tableName: string;
  areaId: number;
  tableType: string;
  status: string;
  isWindow: boolean;
  notes: string;
  createdAt: string;
  orders: Order[];
}

export interface Order {
  orderId: number;
  status: string;
}
