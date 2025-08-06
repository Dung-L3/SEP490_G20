const API_URL = '/api/v1/tables';

export interface MergedTable {
  groupId: number;
  mergedTableName: string;
  individualTableNames: string[];
  tableIds: number[];
  status: string;
  createdBy: number;
  createdAt: string;
  notes?: string;
}

export const mergedTableApi = {
  // Merge tables
  mergeTables: async (tableIds: number[], createdBy: number, notes?: string): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          tableIds,
          createdBy,
          notes: notes || 'Merge table operation'
        })
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error merging tables:', error);
      throw error;
    }
  },

  // Get all merged tables
  getAllMergedTables: async (): Promise<MergedTable[]> => {
    try {
      const response = await fetch(`${API_URL}/merged`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching merged tables:', error);
      throw error;
    }
  },

  // Get specific merged table info
  getMergedTableInfo: async (groupId: number): Promise<MergedTable> => {
    try {
      const response = await fetch(`${API_URL}/merged/${groupId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching merged table info:', error);
      throw error;
    }
  },

  // Disband (unmerge) table group
  disbandTableGroup: async (groupId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/group/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
    } catch (error) {
      console.error('Error disbanding table group:', error);
      throw error;
    }
  },
};