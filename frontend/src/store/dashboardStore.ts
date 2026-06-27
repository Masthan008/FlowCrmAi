import { create } from 'zustand';
import { api } from '../services/api';

export interface KPIData {
  totalLeads: number;
  activeContacts: number;
  totalCompanies: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  revenueThisMonth: number;
  pendingTasks: number;
}

export interface ChartPoint {
  label: string;
  revenue: number;
  leads: number;
  deals: number;
  conversionRate: number;
}

export interface ActivityItem {
  id: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  action: string;
  module: string;
  timestamp: string;
  details?: any;
}

export interface DashboardTask {
  id: string;
  subject: string;
  priority: string;
  status: string;
  dueDate?: string;
  owner: string;
}

export interface DashboardDeal {
  id: string;
  name: string;
  company: string;
  stage: string;
  value: number;
  owner: string;
  expectedCloseDate?: string;
}

interface DashboardState {
  kpis: KPIData | null;
  charts: ChartPoint[];
  activities: ActivityItem[];
  tasks: DashboardTask[];
  deals: DashboardDeal[];
  loading: boolean;
  error: string | null;
  timeframe: string;

  // Actions
  fetchDashboardData: (timeframe?: string) => Promise<void>;
  fetchCharts: (timeframe: string) => Promise<void>;
  setTimeframe: (timeframe: string) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  kpis: null,
  charts: [],
  activities: [],
  tasks: [],
  deals: [],
  loading: false,
  error: null,
  timeframe: '12m',

  fetchDashboardData: async (timeframe) => {
    const tf = timeframe || get().timeframe;
    set({ loading: true, error: null });
    try {
      // Run API fetches concurrently
      const [
        kpisRes,
        chartsRes,
        activitiesRes,
        tasksRes,
        dealsRes
      ] = await Promise.all([
        api.get('/dashboard/overview'),
        api.get(`/dashboard/charts?timeframe=${tf}`),
        api.get('/dashboard/activities'),
        api.get('/dashboard/tasks'),
        api.get('/dashboard/deals')
      ]);

      set({
        kpis: kpisRes.data.data,
        charts: chartsRes.data.data,
        activities: activitiesRes.data.data,
        tasks: tasksRes.data.data,
        deals: dealsRes.data.data,
        loading: false,
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to fetch executive dashboard datasets.';
      set({ error: msg, loading: false });
    }
  },

  fetchCharts: async (timeframe) => {
    set({ loading: true });
    try {
      const response = await api.get(`/dashboard/charts?timeframe=${timeframe}`);
      set({
        charts: response.data.data,
        timeframe,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: 'Failed to refresh analytics chart data.',
        loading: false,
      });
    }
  },

  setTimeframe: (timeframe) => set({ timeframe }),
}));

export default useDashboardStore;
