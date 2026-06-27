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

export interface BusinessOverview {
  leads: number;
  meetings: number;
  calls: number;
  tasks: number;
  revenue: number;
  followups: number;
  closedDeals: number;
  newCustomers: number;
}

export interface PipelineStageOverview {
  stage: string;
  count: number;
  revenue: number;
  conversionRate: number;
  averageDays: number;
}

export interface RevenueAnalytics {
  today: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  yearly: number;
  averageDealValue: number;
  growthPercentage: number;
}

export interface TeamLeaderboardItem {
  name: string;
  avatar: string | null;
  department: string;
  revenue: number;
  closedDeals: number;
  calls: number;
  meetings: number;
  conversionRate: number;
  responseTime: string;
}

export interface GoalsData {
  salesGoal: { current: number; target: number };
  monthlyTarget: { current: number; target: number };
  closedDealsTarget: { current: number; target: number };
  revenueTarget: { current: number; target: number };
}

export interface HealthScore {
  overallScore: number;
  metrics: {
    leadResponse: number;
    pipelineHealth: number;
    taskCompletion: number;
    meetingAttendance: number;
    salesPerformance: number;
  };
}

export interface CalendarPreview {
  todayMeetings: Array<{ id: string; title: string; time: string; desc?: string }>;
  tomorrowMeetings: Array<{ id: string; title: string; time: string }>;
  upcomingCalls: Array<{ id: string; title: string; dueDate?: string; priority: string }>;
}

export interface WidgetConfig {
  hidden: boolean;
  collapsed: boolean;
  pinned: boolean;
}

interface DashboardState {
  // Classic stats
  kpis: KPIData | null;
  charts: ChartPoint[];
  activities: ActivityItem[];
  tasks: DashboardTask[];
  deals: DashboardDeal[];
  timeframe: string;

  // New BI stats
  businessOverview: BusinessOverview | null;
  pipelineData: PipelineStageOverview[];
  revenueAnalytics: RevenueAnalytics | null;
  teamLeaderboard: TeamLeaderboardItem[];
  goals: GoalsData | null;
  healthScore: HealthScore | null;
  calendarPreview: CalendarPreview | null;
  
  // Widget states configuration
  widgetLayout: Record<string, WidgetConfig>;
  globalFilter: string;

  loading: boolean;
  error: string | null;

  // Actions
  fetchDashboardData: (timeframe?: string) => Promise<void>;
  fetchCharts: (timeframe: string) => Promise<void>;
  fetchAdvancedBI: (filter?: string) => Promise<void>;
  setGlobalFilter: (filter: string) => void;
  toggleWidget: (widgetId: string, property: keyof WidgetConfig) => void;
  resetWidgets: () => void;
  setTimeframe: (timeframe: string) => void;
}

const DEFAULT_WIDGETS = {
  businessOverview: { hidden: false, collapsed: false, pinned: false },
  charts: { hidden: false, collapsed: false, pinned: false },
  pipeline: { hidden: false, collapsed: false, pinned: false },
  deals: { hidden: false, collapsed: false, pinned: false },
  activities: { hidden: false, collapsed: false, pinned: false },
  tasks: { hidden: false, collapsed: false, pinned: false },
  team: { hidden: false, collapsed: false, pinned: false },
  revenue: { hidden: false, collapsed: false, pinned: false },
  health: { hidden: false, collapsed: false, pinned: false },
  goals: { hidden: false, collapsed: false, pinned: false },
  calendar: { hidden: false, collapsed: false, pinned: false }
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  kpis: null,
  charts: [],
  activities: [],
  tasks: [],
  deals: [],
  timeframe: '12m',

  businessOverview: null,
  pipelineData: [],
  revenueAnalytics: null,
  teamLeaderboard: [],
  goals: null,
  healthScore: null,
  calendarPreview: null,
  
  widgetLayout: { ...DEFAULT_WIDGETS },
  globalFilter: '30d',

  loading: false,
  error: null,

  fetchDashboardData: async (timeframe) => {
    const tf = timeframe || get().timeframe;
    set({ loading: true, error: null });
    try {
      const filter = get().globalFilter;
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

      // Automatically sync advanced BI statistics too
      get().fetchAdvancedBI(filter);
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

  fetchAdvancedBI: async (filter) => {
    const tf = filter || get().globalFilter;
    try {
      const [
        bizRes,
        pipeRes,
        revRes,
        teamRes,
        goalsRes,
        healthRes,
        calRes
      ] = await Promise.all([
        api.get(`/dashboard/business-overview?timeframe=${tf}`),
        api.get(`/dashboard/pipeline?timeframe=${tf}`),
        api.get('/dashboard/revenue'),
        api.get('/dashboard/team'),
        api.get('/dashboard/goals'),
        api.get('/dashboard/health'),
        api.get('/dashboard/calendar-preview')
      ]);

      set({
        businessOverview: bizRes.data.data,
        pipelineData: pipeRes.data.data,
        revenueAnalytics: revRes.data.data,
        teamLeaderboard: teamRes.data.data,
        goals: goalsRes.data.data,
        healthScore: healthRes.data.data,
        calendarPreview: calRes.data.data,
        globalFilter: tf
      });
    } catch (error) {
      console.warn('Advanced BI datasets synchronization warning:', error);
    }
  },

  setGlobalFilter: (filter) => {
    set({ globalFilter: filter });
    get().fetchAdvancedBI(filter);
  },

  toggleWidget: (widgetId, property) => {
    set((state) => {
      const current = state.widgetLayout[widgetId] || { hidden: false, collapsed: false, pinned: false };
      return {
        widgetLayout: {
          ...state.widgetLayout,
          [widgetId]: {
            ...current,
            [property]: !current[property],
          },
        },
      };
    });
  },

  resetWidgets: () => {
    set({ widgetLayout: { ...DEFAULT_WIDGETS } });
  },

  setTimeframe: (timeframe) => set({ timeframe }),
}));

export default useDashboardStore;
