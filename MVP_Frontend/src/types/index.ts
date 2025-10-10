export type AsrChunk = {
  call_id: string;
  chunk_id: string;
  spk: "caller" | "agent";
  t0: number;
  t1: number;
  text: string;
  confidence: number;
};

export type RedactedTurn = {
  spk: "caller" | "agent";
  t0: number;
  t1: number;
  text: string;
};

export type RedactedInteraction = {
  call_id: string;
  turns: RedactedTurn[];
  redaction_log: string[];
};

export type TopicIntentOutput = {
  call_id: string;
  topic: string;
  subtopic: string;
  confidence: number;
};

export type EmotionDistressOutput = {
  call_id: string;
  emotion_now: string;
  trend: string;
  evidence?: string;
};

export type UrgencyOutput = {
  call_id: string;
  urgency: "P1" | "P2" | "P3";
  reason: string;
};

export type SpikeAlert = {
  region: string;
  topic: string;
  delta_pct: number;
  window_min: number;
  ts: string;
  status: "new" | "acknowledged" | "resolved";
};

export type InteractionContract = {
  call_id: string;
  redacted: RedactedInteraction;
  topic: TopicIntentOutput;
  emotion: EmotionDistressOutput;
  urgency: UrgencyOutput;
};

export type InteractionMetadata = {
  call_id: string;
  timestamp: string;
  channel: "Call" | "Chat" | "SMS";
  region: string;
  dialect: string;
  agent: string;
};

export type InteractionRecord = InteractionContract & {
  metadata: InteractionMetadata;
};

export type HeatmapData = {
  regions: string[];
  topics: string[];
  counts: number[][];
};

export type AlertSeriesLookup = Record<string, { ts: string; volume: number }[]>;

export type VolumeTrendSeries = {
  labels: string[];
  series: Array<{
    name: string;
    color: string;
    values: number[];
  }>;
  p1Rates: number[];
};

export type DashboardData = {
  interactions: InteractionRecord[];
  alerts: SpikeAlert[];
  alertSeries: AlertSeriesLookup;
  heatmap: HeatmapData;
  reports: {
    leadershipSummary: string[];
    volumeTrendSeries: VolumeTrendSeries;
  };
  updatedAt: string;
};

export type TimeRangeKey = "last_60" | "today" | "last_24h" | "last_7d";

export type GlobalFilters = {
  timeRange: TimeRangeKey;
  region: string;
  channel: string;
  topic: string;
  urgency: "All" | "P1" | "P2" | "P3";
  dialect: string;
};
