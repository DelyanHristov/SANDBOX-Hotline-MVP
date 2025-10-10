export type Language = "en" | "ar";

export type TranslationKey = keyof typeof en;

export const en = {
  appName: "NCMH Pulse",
  appTagline: "Helpline insights & rapid response monitoring",
  nav: {
    dashboard: "Dashboard",
    alerts: "Alerts",
    explorer: "Explorer",
    reports: "Reports",
    settings: "Settings"
  },
  filters: {
    toggle: { show: "Show Filters", hide: "Hide Filters" },
    timeRange: "Time Range",
    region: "Region",
    channel: "Channel",
    topic: "Topic",
    urgency: "Urgency",
    dialect: "Dialect",
    reset: "Reset",
    searchLabel: "Search",
    searchPlaceholder: "Search by ID, topic, or subtopic",
    subtopic: "Subtopic",
    emotion: "Emotion",
    agent: "Agent",
    resultsCount: (count: number) => `Showing ${count} interactions`
  },
  timeRanges: {
    last_60: "Last 60 minutes",
    today: "Today",
    last_24h: "Last 24 hours",
    last_7d: "Last 7 days"
  },
  dashboard: {
    heading: "Live Operations Dashboard",
    subheading: "Real-time helpline analytics and urgent response monitoring",
    totalInteractions: "Total Interactions",
    urgencyCard: {
      defaultLabel: "P1 Today",
      defaultDescription: "Percent of interactions flagged as P1",
      filteredLabel: (urgency: string) => `${urgency} Share`,
      filteredDescription: (urgency: string) => `Percent of interactions meeting ${urgency}`
    },
    topEmotion: "Top Emotion Now",
    topTopic: "Top Topic Now",
    heatmapTitle: "Region × Topic Heatmap",
    heatmapSubtitle: "Click any cell to explore filtered interactions",
    spikeTitle: "Spike Alerts",
    spikeSubtitle: "Sudden increases in topic volume across regions",
    spikeActiveCount: (count: number) => `${count} active`,
    spikeSeverity: "Severity",
    spikeSeverityLevels: {
      veryHigh: "Very high",
      high: "High",
      moderate: "Moderate"
    },
    spikeNoAlerts: "No spike alerts in the selected filters.",
    urgencyQueueTitle: "Urgency Queue",
    urgencyLevels: {
      P1: "Critical",
      P2: "Moderate",
      P3: "Low"
    },
    urgencyEmpty: "No interactions at this urgency level.",
    openInteraction: "Open Interaction"
  },
  alerts: {
    heading: "Alerts Center",
    subheading: "Triage and manage spike alerts across regions and topics",
    table: {
      time: "Time",
      region: "Region",
      topic: "Topic",
      delta: "Δ%",
      window: "Window",
      status: "Status",
      actions: "Actions",
      statusLabels: {
        new: "New",
        acknowledged: "Acknowledged",
        resolved: "Resolved"
      },
      acknowledge: "Acknowledge",
      resolve: "Resolve",
      none: "No alerts in the selected filters."
    },
    detail: {
      spikeHeading: (topic: string) => `${topic} spike`,
      volumeTitle: "Topic volume vs baseline",
      baseline: "Baseline avg",
      current: "Current window",
      spike: "Spike intensity",
      legendActual: "Actual volume",
      legendBaseline: "Baseline avg",
      topEmotions: "Top emotions",
      topSubtopics: "Top subtopics",
      openExplorer: "Open related interactions",
      assignOwner: "Assign owner",
      resolve: "Resolve",
      noAlert: "Select an alert to view details.",
      notEnough: "Not enough interactions in this window.",
      noSubtopic: "No subtopic data.",
      delta: (delta: number, pct: number) =>
        `Δ ${delta >= 0 ? "+" : ""}${Math.round(delta)} (${pct >= 0 ? "+" : ""}${pct}%)`
    }
  },
  explorer: {
    heading: "Interaction Explorer",
    subheading: "Search and review individual interactions safely",
    noResults: "No interactions match the selected filters.",
    redactedTag: "Redacted"
  },
  reports: {
    heading: "Reports & Summaries",
    subheading: "Trends, insights, and AI-generated leadership summaries",
    leadershipTitle: "Leadership Summary",
    leadershipSubtitle: "Key insights for decision makers",
    aiGenerated: "AI Generated",
    noSummaries: "Summaries will appear once data is available.",
    trendsTitle: "Volume Trends",
    trendsSubtitle: "Topic volumes and P1 rate over the last 4 hours",
    chart: {
      legendActual: "Actual volume",
      legendP1: "P1 Rate"
    }
  },
  settings: {
    heading: "Settings",
    subheading: "Configure roles, privacy defaults, thresholds, and taxonomy controls",
    rolesTitle: "Roles",
    rolesSubtitle: "Define access scopes for each persona",
    roles: {
      viewer: {
        name: "Viewer",
        description: "Read-only dashboards and reports"
      },
      analyst: {
        name: "Analyst",
        description: "Explorer access, export controls"
      },
      supervisor: {
        name: "Supervisor",
        description: "Alert management, live monitoring"
      },
      admin: {
        name: "Admin",
        description: "Full configuration & integrations"
      }
    },
    privacyDefaults: {
      label: "Privacy defaults",
      description: "Redacted transcripts are always shown. PII display remains disabled.",
      locked: "Locked"
    },
    thresholds: {
      title: "Thresholds",
      spike: {
        label: "Spike Δ% threshold",
        description: "Currently set to +25% over rolling baseline (mock only)"
      },
      p1Rules: {
        label: "P1 rules",
        description: "Keyword triggers: self-harm intent, imminent danger (mock toggle)"
      }
    },
    taxonomy: {
      title: "Taxonomy",
      subtitle: "Manage topics and subtopics (English; bilingual coming soon)",
      addStub: "Add topic (stub)"
    }
  },
  interactions: {
    card: {
      region: "Region",
      emotion: "Emotion",
      dialect: "Dialect"
    },
    modal: {
      redactedTranscript: "Redacted Transcript",
      piiRemoved: "PII removed:",
      urgencyReason: "Urgency Reason",
      topicConfidence: "Topic Confidence",
      downloadJson: "Download JSON",
      close: "Close",
      prev: "Prev",
      next: "Next"
    }
  },
  common: {
    all: "All",
    urgencyLabels: {
      P1: "P1",
      P2: "P2",
      P3: "P3"
    },
    emotions: {
      baseline: "Baseline avg",
      current: "Current window",
      spike: "Spike intensity"
    },
    languageMenu: "Language",
    languageNames: { en: "English", ar: "العربية" },
    trendLabels: {
      Rising: "Rising",
      Falling: "Falling",
      Steady: "Steady"
    },
    relativeWindow: (minutes: number) => `${minutes} min window`
  }
} as const;

export type Translations = typeof en;

export const ar = {
  appName: "نبض المركز الوطني للصحة النفسية",
  appTagline: "تحليلات مركز الاتصال ودعم الاستجابة السريعة",
  nav: {
    dashboard: "لوحة التحكم",
    alerts: "التنبيهات",
    explorer: "مستكشف التفاعلات",
    reports: "التقارير",
    settings: "الإعدادات"
  },
  filters: {
    toggle: { show: "إظهار المرشحات", hide: "إخفاء المرشحات" },
    timeRange: "النطاق الزمني",
    region: "المنطقة",
    channel: "القناة",
    topic: "الموضوع",
    urgency: "مستوى الأهمية",
    dialect: "اللهجة",
    reset: "إعادة تعيين",
    searchLabel: "بحث",
    searchPlaceholder: "ابحث بالرقم أو الموضوع أو التصنيف الفرعي",
    subtopic: "التصنيف الفرعي",
    emotion: "الحالة الشعورية",
    agent: "المستجيب",
    resultsCount: (count: number) => `عرض ${count} تفاعل`
  },
  timeRanges: {
    last_60: "آخر ٦٠ دقيقة",
    today: "اليوم",
    last_24h: "آخر ٢٤ ساعة",
    last_7d: "آخر ٧ أيام"
  },
  dashboard: {
    heading: "لوحة العمليات المباشرة",
    subheading: "تحليلات مركز الاتصال ومراقبة الاستجابة السريعة",
    totalInteractions: "إجمالي التفاعلات",
    urgencyCard: {
      defaultLabel: "النسبة الحرجة (P1)",
      defaultDescription: "نسبة التفاعلات المصنفة كـ P1",
      filteredLabel: (urgency: string) => `نسبة ${urgency}`,
      filteredDescription: (urgency: string) => `نسبة التفاعلات التي تحقق ${urgency}`
    },
    topEmotion: "الحالة الشعورية الأعلى",
    topTopic: "الموضوع الأكثر تكراراً",
    heatmapTitle: "خريطة الموضوع حسب المنطقة",
    heatmapSubtitle: "انقر على أي خلية لاستكشاف التفاعلات",
    spikeTitle: "التنبيهات الحادة",
    spikeSubtitle: "ارتفاعات مفاجئة في حجم الموضوع عبر المناطق",
    spikeActiveCount: (count: number) => `${count} نشطة`,
    spikeSeverity: "حدة الارتفاع",
    spikeSeverityLevels: {
      veryHigh: "مرتفع جداً",
      high: "مرتفع",
      moderate: "متوسط"
    },
    spikeNoAlerts: "لا توجد تنبيهات ضمن المرشحات الحالية.",
    urgencyQueueTitle: "قائمة الأولويات",
    urgencyLevels: {
      P1: "حرج",
      P2: "متوسط",
      P3: "منخفض"
    },
    urgencyEmpty: "لا توجد تفاعلات بهذا المستوى.",
    openInteraction: "فتح التفاعل"
  },
  alerts: {
    heading: "مركز التنبيهات",
    subheading: "إدارة التنبيهات الحادة ومعالجتها حسب المنطقة والموضوع",
    table: {
      time: "الوقت",
      region: "المنطقة",
      topic: "الموضوع",
      delta: "التغير ٪",
      window: "النافذة",
      status: "الحالة",
      actions: "إجراءات",
      statusLabels: {
        new: "جديد",
        acknowledged: "تمت المتابعة",
        resolved: "مغلق"
      },
      acknowledge: "تأكيد",
      resolve: "إغلاق",
      none: "لا توجد تنبيهات ضمن المرشحات الحالية."
    },
    detail: {
      spikeHeading: (topic: string) => `ارتفاع ${topic}`,
      volumeTitle: "حجم الموضوع مقابل الخط الأساس",
      baseline: "متوسط الخط الأساس",
      current: "حجم النافذة الحالية",
      spike: "حدة الارتفاع",
      legendActual: "الحجم الفعلي",
      legendBaseline: "متوسط الأساس",
      topEmotions: "أبرز الحالات الشعورية",
      topSubtopics: "أبرز التصنيفات الفرعية",
      openExplorer: "عرض التفاعلات المرتبطة",
      assignOwner: "تعيين مسؤول",
      resolve: "إغلاق",
      noAlert: "اختر تنبيهاً لعرض التفاصيل.",
      notEnough: "لا توجد تفاعلات كافية في هذه النافذة.",
      noSubtopic: "لا توجد بيانات تصنيفات فرعية.",
      delta: (delta: number, pct: number) =>
        `التغير ${delta >= 0 ? "+" : ""}${Math.round(delta)} (${pct >= 0 ? "+" : ""}${pct}٪)`
    }
  },
  explorer: {
    heading: "مستكشف التفاعلات",
    subheading: "بحث ومراجعة التفاعلات بشكل آمن",
    noResults: "لا توجد تفاعلات مطابقة للمرشحات.",
    redactedTag: "منقحة"
  },
  reports: {
    heading: "التقارير والملخصات",
    subheading: "رؤى واتجاهات وملخصات قيادية مدعومة بالذكاء الاصطناعي",
    leadershipTitle: "ملخص قيادي",
    leadershipSubtitle: "أهم الرؤى لصانعي القرار",
    aiGenerated: "تم توليده بالذكاء الاصطناعي",
    noSummaries: "سيتم عرض الملخصات عند توفر البيانات.",
    trendsTitle: "اتجاهات الحجم",
    trendsSubtitle: "حجم المواضيع ونسبة P1 خلال آخر ٤ ساعات",
    chart: {
      legendActual: "الحجم الفعلي",
      legendP1: "نسبة P1"
    }
  },
  settings: {
    heading: "الإعدادات",
    subheading: "إدارة الأدوار والخصوصية والحدود والتصنيفات",
    rolesTitle: "الأدوار",
    rolesSubtitle: "تحديد نطاق الوصول لكل شخصية",
    roles: {
      viewer: {
        name: "مشاهد",
        description: "تقارير ولوحات قراءة فقط"
      },
      analyst: {
        name: "محلل",
        description: "الوصول للمستكشف وخيارات التصدير"
      },
      supervisor: {
        name: "مشرف",
        description: "إدارة التنبيهات والمراقبة اللحظية"
      },
      admin: {
        name: "مدير",
        description: "إعدادات متكاملة وتوصيلات"
      }
    },
    privacyDefaults: {
      label: "إعدادات الخصوصية",
      description: "يتم عرض النسخ المنقحة فقط. إخفاء معلومات الهوية دائماً.",
      locked: "مقفل"
    },
    thresholds: {
      title: "الحدود",
      spike: {
        label: "حد التغير للارتفاع",
        description: "محدد حالياً بـ +25٪ فوق المتوسط المتحرك (تجريبي)"
      },
      p1Rules: {
        label: "قواعد P1",
        description: "كلمات مفتاحية: نية إيذاء الذات، خطر وشيك (تجريبي)"
      }
    },
    taxonomy: {
      title: "التصنيف",
      subtitle: "إدارة المواضيع والتصنيفات الفرعية (العربية قريباً)",
      addStub: "إضافة موضوع (قريباً)"
    }
  },
  interactions: {
    card: {
      region: "المنطقة",
      emotion: "الحالة الشعورية",
      dialect: "اللهجة"
    },
    modal: {
      redactedTranscript: "النص المنقح",
      piiRemoved: "تم إخفاء معلومات الهوية:",
      urgencyReason: "سبب مستوى الأهمية",
      topicConfidence: "ثقة الموضوع",
      downloadJson: "تنزيل JSON",
      close: "إغلاق",
      prev: "السابق",
      next: "التالي"
    }
  },
  common: {
    all: "الكل",
    urgencyLabels: {
      P1: "P1",
      P2: "P2",
      P3: "P3"
    },
    emotions: {
      baseline: "متوسط الأساس",
      current: "الحجم الحالي",
      spike: "حدة الارتفاع"
    },
    languageMenu: "اللغة",
    languageNames: { en: "English", ar: "العربية" },
    trendLabels: {
      Rising: "صاعد",
      Falling: "هابط",
      Steady: "مستقر"
    },
    relativeWindow: (minutes: number) => `نافذة ${minutes} دقيقة`
  }
} as unknown as Translations;
