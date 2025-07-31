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

// Mock data
const today = new Date().toISOString().split('T')[0];

let mockWorkshifts: Workshift[] = [
  {
    id: 1,
    name: 'Ca sáng',
    date: today,
    startTime: '07:00',
    endTime: '15:00',
    status: 'ACTIVE',
    location: 'Tầng 1',
    requiredStaff: 5,
    assignedEmployees: [],
    department: 'service',
    repeatPattern: 'daily'
  },
  {
    id: 2,
    name: 'Ca chiều',
    date: today,
    startTime: '15:00',
    endTime: '23:00',
    status: 'ACTIVE',
    location: 'Tầng 1',
    requiredStaff: 5,
    assignedEmployees: [],
    department: 'service',
    repeatPattern: 'daily'
  },
  {
    id: 3,
    name: 'Ca đêm',
    date: today,
    startTime: '23:00',
    endTime: '07:00',
    status: 'ACTIVE',
    location: 'Tầng 1',
    requiredStaff: 3,
    assignedEmployees: [],
    department: 'service',
    repeatPattern: 'daily'
  }
];

export const workshiftApi = {
  getAll: async (): Promise<Workshift[]> => {
    // Giả lập delay của API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockWorkshifts];
  },

  create: async (workshift: CreateWorkshiftDto): Promise<Workshift> => {
    // Giả lập delay của API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
      const newWorkshift: Workshift = {
      id: Math.max(...mockWorkshifts.map(w => w.id)) + 1,
      name: workshift.name,
      date: workshift.date,
      startTime: workshift.startTime,
      endTime: workshift.endTime,
      status: workshift.status,
      location: workshift.location,
      requiredStaff: workshift.requiredStaff,
      assignedEmployees: [],
      department: workshift.department,
      repeatPattern: workshift.repeatPattern
    };    mockWorkshifts.push(newWorkshift);
    return { ...newWorkshift };
  },

  update: async (id: number, workshift: Workshift): Promise<Workshift> => {
    // Giả lập delay của API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockWorkshifts.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error('Workshift not found');
    }
    
    mockWorkshifts[index] = { ...workshift };
    return { ...mockWorkshifts[index] };
  },

  delete: async (id: number): Promise<void> => {
    // Giả lập delay của API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockWorkshifts.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error('Workshift not found');
    }
    
    mockWorkshifts = mockWorkshifts.filter(w => w.id !== id);
  },
};
