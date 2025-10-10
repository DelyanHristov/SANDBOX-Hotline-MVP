import { useAppStore } from "../store/useAppStore";

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }
  const language = useAppStore.getState().language;
  const locale = language === "ar" ? "ar-SA" : "en-US";
  return new Intl.DateTimeFormat(locale, DATE_FORMAT_OPTIONS).format(date);
};

export const formatDelta = (deltaPct: number): string =>
  `${deltaPct > 0 ? "+" : ""}${deltaPct}%`;

export const formatConfidence = (confidence: number): string =>
  `${Math.round(confidence * 100)}%`;

export const truncateText = (text: string, limit = 80): string =>
  text.length > limit ? `${text.slice(0, limit)}...` : text;
