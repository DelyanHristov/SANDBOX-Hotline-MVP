import { useI18n } from "./index";

type Dictionary = Record<string, { en: string; ar: string }>;

const TOPIC_DICT: Dictionary = {
  "Family Issues": { en: "Family Issues", ar: "مشكلات أسرية" },
  "Work Stress": { en: "Work Stress", ar: "ضغوط العمل" },
  "General Anxiety": { en: "General Anxiety", ar: "قلق عام" },
  "Panic Attacks": { en: "Panic Attacks", ar: "نوبات هلع" },
  "Depression": { en: "Depression", ar: "اكتئاب" },
  "Suicidal Ideation": { en: "Suicidal Ideation", ar: "أفكار انتحارية" }
};

const SUBTOPIC_DICT: Dictionary = {
  Divorce: { en: "Divorce", ar: "طلاق" },
  "Marital Conflict": { en: "Marital Conflict", ar: "خلاف زوجي" },
  "Workload": { en: "Workload", ar: "عبء العمل" },
  "Academic Stress": { en: "Academic Stress", ar: "ضغط دراسي" },
  "Acute Episode": { en: "Acute Episode", ar: "نوبة حادة" },
  "Low Mood": { en: "Low Mood", ar: "مزاج منخفض" },
  "Night Episodes": { en: "Night Episodes", ar: "نوبات ليلية" },
  "Health Anxiety": { en: "Health Anxiety", ar: "قلق صحي" },
  "Shift Work": { en: "Shift Work", ar: "نظام المناوبات" },
  "Postpartum": { en: "Postpartum", ar: "ما بعد الولادة" },
  "Financial Stress": { en: "Financial Stress", ar: "ضغط مالي" },
  "Ideation Severity": { en: "Ideation Severity", ar: "حدة الأفكار الانتحارية" },
  "Recovery Check-in": { en: "Recovery Check-in", ar: "متابعة التعافي" },
  "Team Dynamics": { en: "Team Dynamics", ar: "ديناميكيات الفريق" }
};

const REGION_DICT: Dictionary = {
  Riyadh: { en: "Riyadh", ar: "الرياض" },
  Eastern: { en: "Eastern", ar: "المنطقة الشرقية" },
  Makkah: { en: "Makkah", ar: "مكة" },
  Madinah: { en: "Madinah", ar: "المدينة" }
};

const CHANNEL_DICT: Dictionary = {
  Call: { en: "Call", ar: "مكالمة" },
  Chat: { en: "Chat", ar: "دردشة" },
  SMS: { en: "SMS", ar: "رسالة نصية" }
};

const DIALECT_DICT: Dictionary = {
  "Gulf Arabic": { en: "Gulf Arabic", ar: "لهجة خليجية" },
  Eastern: { en: "Eastern", ar: "لهجة شرقية" },
  Hijazi: { en: "Hijazi", ar: "لهجة حجازية" },
  "Modern Standard Arabic": { en: "Modern Standard Arabic", ar: "العربية الفصحى الحديثة" },
  "Libyan Arabic": { en: "Libyan Arabic", ar: "لهجة ليبية" },
  "Yemeni Arabic": { en: "Yemeni Arabic", ar: "لهجة يمنية" },
  "Levantine Arabic": { en: "Levantine Arabic", ar: "لهجة شامية" },
  "Algerian Arabic": { en: "Algerian Arabic", ar: "لهجة جزائرية" },
  "Saudi Arabic": { en: "Saudi Arabic", ar: "لهجة سعودية" },
  "Tunisian Arabic": { en: "Tunisian Arabic", ar: "لهجة تونسية" },
  "Moroccan Arabic": { en: "Moroccan Arabic", ar: "لهجة مغربية" },
  "Sudanese Arabic": { en: "Sudanese Arabic", ar: "لهجة سودانية" },
  "Egyptian Arabic": { en: "Egyptian Arabic", ar: "لهجة مصرية" },
  "Iraqi Arabic": { en: "Iraqi Arabic", ar: "لهجة عراقية" }
};

const EMOTION_DICT: Dictionary = {
  "قلق": { en: "Anxious", ar: "قلق" },
  "هادئ": { en: "Calm", ar: "هادئ" },
  "حزين": { en: "Sad", ar: "حزين" },
  "غاضب": { en: "Angry", ar: "غاضب" },
  "محبط": { en: "Frustrated", ar: "محبط" },
  "Anxious": { en: "Anxious", ar: "قلق" },
  "Calm": { en: "Calm", ar: "هادئ" },
  "Sad": { en: "Sad", ar: "حزين" },
  "Angry": { en: "Angry", ar: "غاضب" },
  "Frustrated": { en: "Frustrated", ar: "محبط" }
};

const TREND_DICT: Dictionary = {
  "صاعد": { en: "Rising", ar: "صاعد" },
  "هابط": { en: "Falling", ar: "هابط" },
  "ثابت": { en: "Steady", ar: "مستقر" },
  Rising: { en: "Rising", ar: "صاعد" },
  Falling: { en: "Falling", ar: "هابط" },
  Steady: { en: "Steady", ar: "مستقر" }
};

const URGENCY_REASON_DICT: Dictionary = {
  "Immediate risk cues detected by the model": {
    en: "Immediate risk cues detected by the model",
    ar: "مؤشرات خطر فوري اكتشفها النموذج"
  },
  "Elevated distress cues present": {
    en: "Elevated distress cues present",
    ar: "وجود مؤشرات ضيق مرتفعة"
  },
  "Routine support request": {
    en: "Routine support request",
    ar: "طلب دعم اعتيادي"
  },
  "Direct mention of self-harm intent": {
    en: "Direct mention of self-harm intent",
    ar: "ذكر مباشر لنوايا إيذاء الذات"
  },
  "No immediate risk; requesting guidance": {
    en: "No immediate risk; requesting guidance",
    ar: "لا يوجد خطر فوري؛ يطلب إرشاداً"
  },
  "Emotional distress but no immediate danger": {
    en: "Emotional distress but no immediate danger",
    ar: "ضيق عاطفي دون خطر عاجل"
  },
  "Mild anxiety; manageable with coaching": {
    en: "Mild anxiety; manageable with coaching",
    ar: "قلق بسيط؛ قابل للإدارة بالتوجيه"
  },
  "Active panic symptoms requiring close monitoring": {
    en: "Active panic symptoms requiring close monitoring",
    ar: "أعراض هلع نشطة تتطلب مراقبة لصيقة"
  },
  "Persistent low mood; monitor for escalation": {
    en: "Persistent low mood; monitor for escalation",
    ar: "مزاج منخفض مستمر؛ يحتاج لمراقبة التصاعد"
  },
  "Recurrent panic episodes disrupting breathing at night": {
    en: "Recurrent panic episodes disrupting breathing at night",
    ar: "نوبات هلع متكررة تعيق التنفس ليلاً"
  },
  "Health fears escalating when caller is isolated": {
    en: "Health fears escalating when caller is isolated",
    ar: "مخاوف صحية تتصاعد عند العزلة"
  },
  "Burnout signals affecting job performance": {
    en: "Burnout signals affecting job performance",
    ar: "علامات احتراق وظيفي تؤثر على الأداء"
  },
  "Postpartum depressive symptoms without current support": {
    en: "Postpartum depressive symptoms without current support",
    ar: "أعراض اكتئاب ما بعد الولادة دون دعم حالي"
  },
  "Escalating conflict driven by financial strain": {
    en: "Escalating conflict driven by financial strain",
    ar: "تصاعد النزاع بسبب الضغوط المالية"
  },
  "Active suicidal ideation disclosed without safety plan": {
    en: "Active suicidal ideation disclosed without safety plan",
    ar: "أفكار انتحارية نشطة دون خطة أمان"
  },
  "Post-episode follow-up with stabilised mood": {
    en: "Post-episode follow-up with stabilised mood",
    ar: "متابعة ما بعد النوبة مع استقرار المزاج"
  },
  "Ongoing workplace tension affecting morale": {
    en: "Ongoing workplace tension affecting morale",
    ar: "توتر مستمر في العمل يؤثر على المعنويات"
  }
};

const SUMMARY_DICT: Record<string, { en: string; ar: string }> = {
  "45% spike in anxiety-related calls in Riyadh in the last 60 minutes": {
    en: "45% spike in anxiety-related calls in Riyadh in the last 60 minutes",
    ar: "ارتفاع بنسبة 45٪ في المكالمات المرتبطة بالقلق في الرياض خلال آخر 60 دقيقة"
  },
  "Most common topic: Family Issues (Divorce)": {
    en: "Most common topic: Family Issues (Divorce)",
    ar: "الموضوع الأكثر تكراراً: مشكلات أسرية (طلاق)"
  },
  "Slight decrease in P1 vs yesterday; panic attacks rising in Makkah": {
    en: "Slight decrease in P1 vs yesterday; panic attacks rising in Makkah",
    ar: "انخفاض طفيف في حالات P1 مقارنة بالأمس؛ نوبات الهلع في ارتفاع بمكة"
  },
  "Workload concerns emerging in Eastern region night shifts": {
    en: "Workload concerns emerging in Eastern region night shifts",
    ar: "مخاوف عبء العمل تظهر في نوبات الليل بالمنطقة الشرقية"
  },
  "Recommendation: reinforce Riyadh teams and refresh panic-attack guidance": {
    en: "Recommendation: reinforce Riyadh teams and refresh panic-attack guidance",
    ar: "توصية: تعزيز فرق الرياض وتحديث إرشادات التعامل مع نوبات الهلع"
  }
};

const SERIES_LABELS: Dictionary = {
  "General Anxiety": { en: "General Anxiety", ar: "قلق عام" },
  "Family Issues": { en: "Family Issues", ar: "مشكلات أسرية" },
  "P1 Rate": { en: "P1 Rate", ar: "نسبة P1" },
  "Panic Attacks": { en: "Panic Attacks", ar: "نوبات هلع" }
};

const SPEAKER_DICT: Dictionary = {
  caller: { en: "Caller", ar: "المتصل" },
  agent: { en: "Agent", ar: "المستجيب" }
};

const mapValue = (dict: Dictionary, language: "en" | "ar", value: string) => {
  const entry = dict[value];
  if (entry) {
    return entry[language];
  }
  for (const translations of Object.values(dict)) {
    if (translations.en === value || translations.ar === value) {
      return translations[language];
    }
  }
  return value;
};

export const useDomainFormatters = () => {
  const { language } = useI18n();

  return {
    formatTopic: (value: string) => mapValue(TOPIC_DICT, language, value),
    formatSubtopic: (value: string) => mapValue(SUBTOPIC_DICT, language, value),
    formatRegion: (value: string) => mapValue(REGION_DICT, language, value),
    formatChannel: (value: string) => mapValue(CHANNEL_DICT, language, value),
    formatDialect: (value: string) => mapValue(DIALECT_DICT, language, value),
    formatEmotion: (value: string) => mapValue(EMOTION_DICT, language, value),
    formatTrend: (value: string | null | undefined) =>
      value ? mapValue(TREND_DICT, language, value) : null,
    formatUrgencyReason: (value: string) =>
      mapValue(URGENCY_REASON_DICT, language, value),
    formatSummary: (value: string) =>
      SUMMARY_DICT[value]?.[language] ?? value,
    formatSeriesLabel: (value: string) =>
      mapValue(SERIES_LABELS, language, value),
    formatSpeaker: (value: string) => mapValue(SPEAKER_DICT, language, value)
  } as const;
};
