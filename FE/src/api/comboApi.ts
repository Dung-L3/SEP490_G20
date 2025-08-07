export interface ComboDTO {
  id: number;
  comboName: string;
  description: string;
  price: number;
  comboItems: ComboItemDTO[];
  status: boolean;
}

export interface ComboItemDTO {
  dishId: number;
  quantity: number;
  dishName?: string;
  dishPrice?: number;
}

export interface CreateComboRequest {
  comboName: string;
  description: string;
  price: number;
  comboItems: ComboItemDTO[];
}

export interface UpdateComboRequest {
  comboName: string;
  description: string;
  price: number;
  comboItems: ComboItemDTO[];
  status: boolean;
}

const API_URL = '/api/combos';

export const comboApi = {
  getAllCombos: async (): Promise<ComboDTO[]> => {
    try {
      const response = await fetch(`${API_URL}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching combos:', error);
      throw error;
    }
  },

  getComboById: async (comboId: number): Promise<ComboDTO> => {
    try {
      const response = await fetch(`${API_URL}/${comboId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching combo ${comboId}:`, error);
      throw error;
    }
  },

  createCombo: async (combo: CreateComboRequest): Promise<ComboDTO> => {
    try {
      // Validate required fields
      if (!combo.comboName?.trim()) {
        throw new Error('Combo name is required');
      }

      if (!combo.comboItems?.length) {
        throw new Error('Combo must have at least one item');
      }

      const requestBody = {
        comboName: combo.comboName.trim(),
        price: combo.price,
        description: combo.description?.trim() || '',
        comboItems: combo.comboItems.map(item => ({
          dishId: item.dishId,
          quantity: item.quantity
        }))
      };

      console.log('Creating combo with request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating combo:', error);
      throw error;
    }
  },

  updateCombo: async (comboId: number, combo: UpdateComboRequest): Promise<ComboDTO> => {
    try {
      const queryParams = new URLSearchParams({ name: combo.comboName }).toString();
      const response = await fetch(`${API_URL}/${comboId}?${queryParams}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comboName: combo.comboName,
          price: combo.price,
          description: combo.description,
          comboItems: combo.comboItems || [],
          status: combo.status
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating combo ${comboId}:`, error);
      throw error;
    }
  },

  deleteCombo: async (comboId: number, comboName: string): Promise<void> => {
    try {
      console.log('Deleting combo with ID:', comboId, 'name:', comboName);
      
      const queryParams = new URLSearchParams({ name: comboName }).toString();
      const response = await fetch(`${API_URL}/${comboId}?${queryParams}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete error response:', errorData);
        if (response.status === 404) {
          throw new Error('Combo không tồn tại hoặc đã bị xóa');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Không có quyền xóa combo này');
        }
        throw new Error(errorData || `Không thể xóa combo. Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting combo ${comboId}:`, error);
      throw error;
    }
  },

  searchCombosByName: async (name: string): Promise<ComboDTO[]> => {
    try {
      const queryParams = new URLSearchParams({ name }).toString();
      const response = await fetch(`${API_URL}/search?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching combos:', error);
      throw error;
    }
  },
};
