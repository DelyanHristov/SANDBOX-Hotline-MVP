import { useAppStore } from "../store/useAppStore";

export const EMOTION_MAP: Record<string, { en: string; ar: string }> = {
  "هادئ": { en: "Calm", ar: "هادئ" },
  "حزين": { en: "Sad", ar: "حزين" },
  "غاضب": { en: "Angry", ar: "غاضب" },
  "محبط": { en: "Frustrated", ar: "محبط" },
  "قلق": { en: "Anxious", ar: "قلق" },
  Calm: { en: "Calm", ar: "هادئ" },
  Sad: { en: "Sad", ar: "حزين" },
  Angry: { en: "Angry", ar: "غاضب" },
  Frustrated: { en: "Frustrated", ar: "محبط" },
  Anxious: { en: "Anxious", ar: "قلق" }
};

export const TREND_MAP: Record<string, { en: string; ar: string }> = {
  "صاعد": { en: "Rising", ar: "صاعد" },
  "هابط": { en: "Falling", ar: "هابط" },
  "ثابت": { en: "Steady", ar: "مستقر" },
  Rising: { en: "Rising", ar: "صاعد" },
  Falling: { en: "Falling", ar: "هابط" },
  Steady: { en: "Steady", ar: "مستقر" }
};

const getLanguage = () => useAppStore.getState().language;

export const mapEmotion = (value: string): string => {
  const language = getLanguage();
  const entry = EMOTION_MAP[value];
  return entry ? entry[language] : value;
};

export const mapTrend = (value: string): string => {
  const language = getLanguage();
  const entry = TREND_MAP[value];
  return entry ? entry[language] : value;
};
