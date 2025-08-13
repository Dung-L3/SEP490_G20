interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
}

interface Workshift {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  location: string;
  requiredStaff: number;
  assignedEmployees: Employee[];
  department: string;
  repeatPattern: 'daily' | 'weekly' | 'none';
}

interface CreateWorkshiftDto {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  location: string;
  requiredStaff: number;
  department: string;
  repeatPattern: 'daily' | 'weekly' | 'none';
}

const API_URL = '/api/v1/workshifts';

export const workshiftApi = {
  getAll: async (): Promise<Workshift[]> => {
    const response = await fetch(`${API_URL}/getAll`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Không thể lấy danh sách ca làm việc: ${response.status}`);
    }

    return await response.json();
  },

  create: async (workshift: CreateWorkshiftDto): Promise<Workshift> => {
    const response = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(workshift)
    });

    if (!response.ok) {
      throw new Error(`Không thể tạo ca làm việc: ${response.status}`);
    }

    return await response.json();
  },

  update: async (id: number, workshift: Workshift): Promise<Workshift> => {
    const response = await fetch(`${API_URL}/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(workshift)
    });

    if (!response.ok) {
      throw new Error(`Không thể cập nhật ca làm việc: ${response.status}`);
    }

    return await response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Không thể xóa ca làm việc: ${response.status}`);
    }
  },
};
