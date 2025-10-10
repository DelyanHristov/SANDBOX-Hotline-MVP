import type { InteractionRecord, SpikeAlert } from "../types";
import { mapEmotion, mapTrend } from "./mappers";

export const getTotalInteractions = (
  interactions: InteractionRecord[]
): number => interactions.length;

export const getP1Percentage = (
  interactions: InteractionRecord[]
): number => {
  if (!interactions.length) {
    return 0;
  }
  const p1Count = interactions.filter(
    (interaction) => interaction.urgency.urgency === "P1"
  ).length;
  return Math.round((p1Count / interactions.length) * 100);
};

export const getUrgencyPercentage = (
  interactions: InteractionRecord[],
  urgency: "P1" | "P2" | "P3"
): number => {
  if (!interactions.length) {
    return 0;
  }
  const matches = interactions.filter(
    (interaction) => interaction.urgency.urgency === urgency
  ).length;
  return Math.round((matches / interactions.length) * 100);
};

export type TopEmotionSummary = {
  original: string | null;
  emotion: string | null;
  trend: string | null;
};

export const getTopEmotion = (
  interactions: InteractionRecord[]
): TopEmotionSummary => {
  if (!interactions.length) {
    return { original: null, emotion: null, trend: null };
  }

  const counts = interactions.reduce<Record<string, number>>((acc, item) => {
    acc[item.emotion.emotion_now] = (acc[item.emotion.emotion_now] ?? 0) + 1;
    return acc;
  }, {});

  const [topEmotion] =
    Object.entries(counts).sort(([, a], [, b]) => b - a)?.[0] ?? [];

  if (!topEmotion) {
    return { original: null, emotion: null, trend: null };
  }

  const exemplar = interactions.find(
    (interaction) => interaction.emotion.emotion_now === topEmotion
  );

  return {
    original: topEmotion,
    emotion: mapEmotion(topEmotion),
    trend: mapTrend(exemplar?.emotion.trend ?? "")
  };
};

export const getTopTopic = (
  interactions: InteractionRecord[]
): string | null => {
  if (!interactions.length) {
    return null;
  }

  const counts = interactions.reduce<Record<string, number>>((acc, item) => {
    acc[item.topic.topic] = (acc[item.topic.topic] ?? 0) + 1;
    return acc;
  }, {});

  const [topic] =
    Object.entries(counts).sort(([, a], [, b]) => b - a)?.[0] ?? [];

  return topic ?? null;
};

export const groupByUrgency = (
  interactions: InteractionRecord[]
): Record<"P1" | "P2" | "P3", InteractionRecord[]> => ({
  P1: interactions.filter((item) => item.urgency.urgency === "P1"),
  P2: interactions.filter((item) => item.urgency.urgency === "P2"),
  P3: interactions.filter((item) => item.urgency.urgency === "P3")
});

export const getSeverityLabel = (deltaPct: number): string => {
  if (deltaPct >= 40) {
    return "Very high";
  }
  if (deltaPct >= 20) {
    return "High";
  }
  return "Moderate";
};

export const getAlertStatusLabel = (status: SpikeAlert["status"]): string => {
  switch (status) {
    case "new":
      return "New";
    case "acknowledged":
      return "Acknowledged";
    case "resolved":
      return "Resolved";
    default:
      return status;
  }
};

export const getUniqueRegions = (
  interactions: InteractionRecord[]
): string[] => {
  const set = new Set<string>();
  interactions.forEach((item) => set.add(item.metadata.region));
  return Array.from(set).sort();
};

export const getUniqueChannels = (
  interactions: InteractionRecord[]
): string[] => {
  const set = new Set<string>();
  interactions.forEach((item) => set.add(item.metadata.channel));
  return Array.from(set).sort();
};

export const getUniqueDialects = (
  interactions: InteractionRecord[]
): string[] => {
  const set = new Set<string>();
  interactions.forEach((item) => set.add(item.metadata.dialect));
  return Array.from(set).sort();
};

export const getUniqueTopics = (
  interactions: InteractionRecord[]
): string[] => {
  const set = new Set<string>();
  interactions.forEach((item) => set.add(item.topic.topic));
  return Array.from(set).sort();
};

export const getLatestTimestamp = (
  interactions: InteractionRecord[]
): Date | null => {
  if (!interactions.length) {
    return null;
  }
  const latest = interactions.reduce<number>((acc, interaction) => {
    const value = new Date(interaction.metadata.timestamp).getTime();
    return Number.isNaN(value) ? acc : Math.max(acc, value);
  }, Number.NEGATIVE_INFINITY);
  return Number.isFinite(latest) ? new Date(latest) : null;
};
