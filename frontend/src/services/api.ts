import axios from 'axios';
import {
  User, Station, Section, Asset, MaintenanceTask,
  TrainMovement, Block, OptimizationRun, Conflict,
  Approval, AuditLog, DashboardAnalytics, BeforeAfterAnalytics
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('patri_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('patri_token');
      localStorage.removeItem('patri_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: (username: string, password: string) =>
    apiClient.post('/auth/login', { username, password }),
  getMe: () => apiClient.get<User>('/auth/me'),
  getPresets: () => apiClient.get('/auth/presets'),

  // Network Topology & Map
  getStations: () => apiClient.get<Station[]>('/stations'),
  getSections: () => apiClient.get<Section[]>('/sections'),
  getSectionDetail: (id: number) => apiClient.get(`/sections/${id}`),
  getAssets: (params?: any) => apiClient.get<Asset[]>('/assets', { params }),

  // Maintenance CRUD
  getMaintenanceTasks: (params?: any) => apiClient.get('/maintenance', { params }),
  getMaintenanceTask: (id: number) => apiClient.get(`/maintenance/${id}`),
  createMaintenanceTask: (data: any) => apiClient.post<MaintenanceTask>('/maintenance', data),
  updateMaintenanceTask: (id: number, data: any) => apiClient.put(`/maintenance/${id}`, data),
  deleteMaintenanceTask: (id: number) => apiClient.delete(`/maintenance/${id}`),
  getMaintenanceStats: () => apiClient.get('/maintenance/stats'),

  // Trains & Movements
  getTrains: (params?: any) => apiClient.get('/trains', { params }),
  getTrainMovements: (params?: any) => apiClient.get<TrainMovement[]>('/trains/movements', { params }),
  getFreightForecasts: (params?: any) => apiClient.get('/trains/freight-forecasts', { params }),

  // Resources
  getCrews: (params?: any) => apiClient.get('/crews', { params }),
  getEquipment: (params?: any) => apiClient.get('/equipment', { params }),

  // Optimization & Block Planner
  runOptimization: (data: {
    horizon: string;
    mode: string;
    department_ids?: number[];
    section_ids?: number[];
    priority_threshold?: number;
  }) => apiClient.post<OptimizationRun>('/optimization/run', data),
  getOptimizationRuns: () => apiClient.get<OptimizationRun[]>('/optimization/runs'),
  getOptimizationRun: (id: number) => apiClient.get<OptimizationRun>(`/optimization/runs/${id}`),
  getGanttSchedule: (id: number) => apiClient.get(`/optimization/runs/${id}/gantt`),
  validateManualMove: (runId: number, data: { task_id: number; new_start_time: string; new_end_time: string }) =>
    apiClient.post(`/optimization/runs/${runId}/validate-move`, data),

  // Conflicts
  getConflicts: (params?: any) => apiClient.get<Conflict[]>('/conflicts', { params }),
  resolveConflict: (id: number, data: { action: string; resolution_notes?: string }) =>
    apiClient.post(`/conflicts/${id}/resolve`, data),

  // What-If Simulator
  simulateScenario: (data: any) => apiClient.post('/simulator/simulate', data),

  // Analytics
  getDashboardAnalytics: () => apiClient.get<DashboardAnalytics>('/analytics/dashboard'),
  getBeforeAfterAnalytics: () => apiClient.get<BeforeAfterAnalytics>('/analytics/before-after'),

  // Approvals
  getApprovals: (params?: any) => apiClient.get<Approval[]>('/approvals', { params }),
  submitApproval: (data: { optimization_run_id: number; status: string; comments?: string; plan_version?: string }) =>
    apiClient.post('/approvals', data),

  // Audit Logs
  getAuditLogs: (params?: any) => apiClient.get<AuditLog[]>('/audit/logs', { params }),

  // AI Explanations & Assistant
  explainSchedule: (data: { run_id?: number; task_id?: number; query?: string }) =>
    apiClient.post('/ai/explain-schedule', data),
  chatAI: (message: string, context_run_id?: number) =>
    apiClient.post('/ai/chat', { message, context_run_id }),
};
