import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // Use internal Next.js API routes
})

export const PartnersAPI = {
  getAll: () => api.get('/partners'),
  getById: (id: string) => api.get(`/partners/${id}`),
  create: (data: any) => api.post('/partners', data),
  updateCommission: (id: string, percentage: number) => api.patch('/partners', { id, percentage }),
}

export const ProductsAPI = {
  getAll: () => api.get('/products'),
  create: (data: any) => api.post('/products', data),
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

export const AuthAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  confirm: (data: { email: string; code: string }) => api.post('/auth/confirm', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}
