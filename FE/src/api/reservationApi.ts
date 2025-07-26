

interface Reservation {
  id?: number;
  customerName: string;
  phone: string;
  email: string;
  reservationAt: string;
  tableId?: number | null;
  notes: string;
}

const API_URL = '/api/v1/reservations';

export const reservationApi = {
  create: async (reservation: Reservation): Promise<Reservation> => {
    try {
      // Log the request for debugging
      console.log('Creating reservation with data:', reservation);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(reservation)
      });

      if (!response.ok) {
        // Try to get more detailed error message from response
        const errorData = await response.text();
        console.error('Server error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const result = await response.json();
      console.log('Created reservation:', result);
      return result;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error; // Throw the original error for better debugging
    }
  },

  getAll: async (): Promise<Reservation[]> => {
    try {
      const response = await fetch(`${API_URL}/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Reservation> => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching reservation ${id}:`, error);
      throw error;
    }
  }
};
