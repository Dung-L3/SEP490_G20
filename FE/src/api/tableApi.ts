import type { Table } from '../types/Table';

// Simple fallback API for table management
const tableApi = {
  getAll: async (): Promise<any[]> => {
    try {
      console.log('Fetching tables from /api/waiter/tables?status=OCCUPIED');
      
      const response = await fetch('/api/waiter/tables?status=OCCUPIED', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched tables data:', data);
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in tableApi.getAll:', error);
      
      // Return fallback data if API fails
      return [
        {
          tableId: 1,
          tableName: 'Bàn 1',
          status: 'OCCUPIED',
          capacity: 4,
          type: 'individual'
        },
        {
          tableId: 2, 
          tableName: 'Bàn 2',
          status: 'OCCUPIED',
          capacity: 6,
          type: 'individual'
        }
      ];
    }
  }
};

export default tableApi;