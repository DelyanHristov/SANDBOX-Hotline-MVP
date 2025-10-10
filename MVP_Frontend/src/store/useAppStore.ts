import { create } from "zustand";
import type {
  AlertSeriesLookup,
  DashboardData,
  GlobalFilters,
  HeatmapData,
  InteractionRecord,
  SpikeAlert,
  TimeRangeKey,
  VolumeTrendSeries
} from "../types";
import type { Language } from "../i18n/types";

const DEFAULT_FILTERS: GlobalFilters = {
  timeRange: "last_60",
  region: "All",
  channel: "All",
  topic: "All",
  urgency: "All",
  dialect: "All"
};

type AlertKey = `${string}|${string}`;

const buildAlertKey = (alert: SpikeAlert): AlertKey =>
  `${alert.region}|${alert.topic}`;

type AppState = {
  filters: GlobalFilters;
  setFilter: <Key extends keyof GlobalFilters>(
    key: Key,
    value: GlobalFilters[Key]
  ) => void;
  resetFilters: () => void;
  filtersCollapsed: boolean;
  toggleFiltersCollapsed: () => void;
  interactions: InteractionRecord[];
  setInteractions: (interactions: InteractionRecord[]) => void;
  alerts: SpikeAlert[];
  setAlerts: (alerts: SpikeAlert[]) => void;
  heatmap: HeatmapData | null;
  setHeatmap: (heatmap: HeatmapData | null) => void;
  alertSeries: AlertSeriesLookup;
  setAlertSeries: (lookup: AlertSeriesLookup) => void;
  leadershipSummary: string[];
  setLeadershipSummary: (summary: string[]) => void;
  volumeTrendSeries: VolumeTrendSeries | null;
  setVolumeTrendSeries: (series: VolumeTrendSeries | null) => void;
  updatedAt: string | null;
  updateAlertStatus: (key: AlertKey, status: SpikeAlert["status"]) => void;
  selectedInteractionId: string | null;
  setSelectedInteractionId: (callId: string | null) => void;
  selectedAlertKey: AlertKey | null;
  setSelectedAlertKey: (key: AlertKey | null) => void;
  setTimeRange: (range: TimeRangeKey) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  loadData: () => Promise<void>;
};

const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("ncmh-language");
    if (stored === "ar" || stored === "en") {
      return stored;
    }
  }
  return "en";
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`);
  if (!response.ok) {
    throw new Error(`Failed to load dashboard data (${response.status})`);
  }
  return response.json() as Promise<DashboardData>;
};

export const useAppStore = create<AppState>((set, get) => ({
  filters: { ...DEFAULT_FILTERS },
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value
      }
    })),
  resetFilters: () =>
    set(() => ({
      filters: { ...DEFAULT_FILTERS }
    })),
  filtersCollapsed: false,
  toggleFiltersCollapsed: () =>
    set((state) => ({ filtersCollapsed: !state.filtersCollapsed })),
  interactions: [],
  setInteractions: (interactions) => set(() => ({ interactions })),
  alerts: [],
  setAlerts: (alerts) => set(() => ({ alerts })),
  heatmap: null,
  setHeatmap: (heatmap) => set(() => ({ heatmap })),
  alertSeries: {},
  setAlertSeries: (lookup) => set(() => ({ alertSeries: lookup })),
  leadershipSummary: [],
  setLeadershipSummary: (summary) => set(() => ({ leadershipSummary: summary })),
  volumeTrendSeries: null,
  setVolumeTrendSeries: (series) => set(() => ({ volumeTrendSeries: series })),
  updatedAt: null,
  updateAlertStatus: (key, status) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        buildAlertKey(alert) === key ? { ...alert, status } : alert
      )
    })),
  selectedInteractionId: null,
  setSelectedInteractionId: (callId) => set(() => ({ selectedInteractionId: callId })),
  selectedAlertKey: null,
  setSelectedAlertKey: (key) => set(() => ({ selectedAlertKey: key })),
  setTimeRange: (range) =>
    set((state) => ({
      filters: {
        ...state.filters,
        timeRange: range
      }
    })),
  language: getInitialLanguage(),
  setLanguage: (language) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ncmh-language", language);
    }
    set(() => ({ language }));
  },
  isLoading: false,
  error: null,
  hasHydrated: false,
  loadData: async () => {
    if (get().isLoading) {
      return;
    }
    set(() => ({ isLoading: true, error: null }));
    try {
      const payload = await fetchDashboardData();
      set(() => ({
        interactions: payload.interactions,
        alerts: payload.alerts,
        heatmap: payload.heatmap,
        alertSeries: payload.alertSeries,
        leadershipSummary: payload.reports.leadershipSummary,
        volumeTrendSeries: payload.reports.volumeTrendSeries,
        updatedAt: payload.updatedAt,
        isLoading: false,
        hasHydrated: true
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load dashboard data";
      set(() => ({ error: message, isLoading: false }));
    }
  }
}));

export { buildAlertKey, DEFAULT_FILTERS };
