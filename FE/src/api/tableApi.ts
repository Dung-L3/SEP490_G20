import { Table } from '../types/Table';

const API_URL = '/api/v1/tables'; // Make sure this matches your backend URL
const API_BASE_URL = '/api/v1';

export const tableApi = {
  getAll: async (): Promise<Table[]> => {
    try {
      const response = await fetch(`${API_URL}/getAll`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw new Error('Failed to fetch tables');
    }
  },

  updateStatus: async (id: number, status: string): Promise<Table> => {
    try {
      console.log('Calling updateStatus API with:', { id, status });
      
      // Construct full URL
      const url = `${API_URL}/${id}/status`;
      console.log('Request URL:', url);
      
      // Prepare request body
      const requestBody = { status };
      console.log('Request body:', requestBody);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Log the raw response
      console.log('Raw response:', response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to update table status: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Successfully updated table status. Response:', result);
      return result;
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Table> => {
    try {
      const response = await fetch(`${API_URL}/getById/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching table ${id}:`, error);
      throw new Error('Failed to fetch table');
    }
  },

  create: async (table: Omit<Table, 'tableId'>): Promise<Table> => {
    try {
      // Log the request for debugging
      console.log('Creating table with data:', table);
      
      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...table,
          tableId: null // Explicitly set to null for creation
        })
      });

      if (!response.ok) {
        // Try to get more detailed error message from response
        const errorData = await response.text();
        console.error('Server error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const result = await response.json();
      console.log('Created table:', result);
      return result;
    } catch (error) {
      console.error('Error creating table:', error);
      throw error; // Throw the original error for better debugging
    }
  },

  update: async (id: number, table: Table): Promise<Table> => {
    try {
      // Log the request for debugging
      console.log('Updating table with data:', { id, table });

      const response = await fetch(`${API_URL}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          tableId: table.tableId,
          tableName: table.tableName,
          areaId: table.areaId,
          tableType: table.tableType,
          status: table.status,
          isWindow: table.isWindow,
          notes: table.notes || '',
          createdAt: table.createdAt || '',
          orders: table.orders || []
        })
      });

      if (!response.ok) {
        // Try to get more detailed error message from response
        const errorData = await response.text();
        console.error('Server error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const result = await response.json();
      console.log('Updated table:', result);
      return result;
    } catch (error) {
      console.error(`Error updating table ${id}:`, error);
      throw error; // Throw the original error for better debugging
    }
  },

  delete: async (id: number, status: string = ''): Promise<void> => {
    try {
      // Log the request for debugging
      console.log('Deleting table with id:', id, 'status:', status);

      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        // Try to get more detailed error message from response
        const errorData = await response.text();
        console.error('Server error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      console.log('Table deleted successfully');
    } catch (error) {
      console.error(`Error deleting table ${id}:`, error);
      throw error; // Throw the original error for better debugging
    }
  },
};