import type { GlobalFilters, InteractionRecord, TimeRangeKey } from "../types";

const MINUTES_LOOKBACK: Record<Exclude<TimeRangeKey, "today">, number> = {
  last_60: 60,
  last_24h: 24 * 60,
  last_7d: 7 * 24 * 60
};

const isWithinTimeRange = (
  timestamp: string,
  range: TimeRangeKey,
  referenceDate = new Date()
): boolean => {
  const tsDate = new Date(timestamp);

  if (Number.isNaN(tsDate.getTime())) {
    return false;
  }

  if (range === "today") {
    return (
      tsDate.getUTCFullYear() === referenceDate.getUTCFullYear() &&
      tsDate.getUTCMonth() === referenceDate.getUTCMonth() &&
      tsDate.getUTCDate() === referenceDate.getUTCDate()
    );
  }

  const threshold = new Date(
    referenceDate.getTime() - MINUTES_LOOKBACK[range] * 60 * 1000
  );
  return tsDate >= threshold;
};

export const filterInteractions = (
  interactions: InteractionRecord[],
  filters: GlobalFilters,
  referenceDate = new Date()
): InteractionRecord[] =>
  interactions.filter((interaction) => {
    const {
      metadata,
      topic: topicOutput,
      urgency: urgencyOutput
    } = interaction;

    if (!isWithinTimeRange(metadata.timestamp, filters.timeRange, referenceDate)) {
      return false;
    }

    if (filters.region !== "All" && metadata.region !== filters.region) {
      return false;
    }

    if (filters.channel !== "All" && metadata.channel !== filters.channel) {
      return false;
    }

    if (filters.topic !== "All" && topicOutput.topic !== filters.topic) {
      return false;
    }

    if (filters.urgency !== "All" && urgencyOutput.urgency !== filters.urgency) {
      return false;
    }

    if (filters.dialect !== "All" && metadata.dialect !== filters.dialect) {
      return false;
    }

    return true;
  });
