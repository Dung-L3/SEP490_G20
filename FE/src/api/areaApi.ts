import axiosClient from './axiosClient';

export interface Area {
  areaId: number;
  areaName: string;
  description?: string;
}

export interface TableByAreaRequest {
  status: string;
  tableId: number;
  updatedAt: string;
}

export const areaApi = {
  getAllAreas: async (): Promise<Area[]> => {
    const response = await axiosClient.get('/v1/tables/getAllAreas');
    return response.data;
  },

  getTablesAvailableByArea: async (areaName: string): Promise<any[]> => {
    const response = await axiosClient.get(`/v1/tables/getTablesAvailableByArea`, {
      params: {
        areaName: areaName,
        status: "",
        tableId: 0,
        updatedAt: ""
      }
    });
    return response.data;
  }
};
