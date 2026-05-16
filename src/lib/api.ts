import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // Use internal Next.js API routes
})

export const VendorsAPI = {
  getAll: () => api.get('/vendors'),
  getById: (id: string) => api.get(`/vendors/${id}`),
  create: (data: any) => api.post('/vendors', data),
  updateCommission: (id: string, percentage: number) => api.patch('/vendors', { id, percentage }),
}

export const ProductsAPI = {
  getAll: () => api.get('/products'),
}

export const DealsAPI = {
  getAll: () => api.get('/deals'),
  create: (data: any) => api.post('/deals', data),
  updateStage: (id: string, stage: string, changedBy: string, note?: string) => 
    api.patch(`/deals/${id}`, { stage, changedBy, note }),
}

export const CommissionsAPI = {
  getAll: () => api.get('/commissions'),
}

export const ClientsAPI = {
  getAll: () => api.get('/clients'),
  create: (data: any) => api.post('/clients', data),
}

export const StatsAPI = {
  getOverview: () => api.get('/stats'),
}
