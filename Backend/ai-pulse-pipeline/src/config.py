# Providers and toggles
ASR_MODEL_SIZE = "medium"       # use "large-v3" on GPU, "medium" on CPU
USE_OPENAI_FOR_SUMMARY = True   # False falls back to the local HF mT5 model
USE_OPENAI_FOR_CLASSIFY = True  # False falls back to HF zero-shot classification

# Topic taxonomy (Arabic labels)
TOPIC_LABELS_AR = [
    "العلاقات الأسرية",
    "الضغط الدراسي/العملي",
    "التنمر/التحرش",
    "مشكلات مالية",
    "فقد/حزن",
    "تعاطي مواد",
    "صحة نفسية عامة",
    "صحة جسدية/إحالة",
    "العنف/السلامة",
    "أخرى",
]

EMOTION_LABELS_AR = ["حزن", "قلق", "خوف", "غضب", "أمل", "ارتياح", "محايد"]

# Urgency scoring: recall-first so we rarely miss a P1.
URGENCY_THRESHOLDS = dict(P1=0.70, P2=0.40)
URGENT_KEYWORDS = [
    "انتحار", "أنتحر", "إيذاء نفسي", "أؤذي نفسي", "قتل", "أقتل", "تهديد", "خطر",
    "اعتداء", "اغتصاب", "دم", "حريق", "طوارئ", "فورا", "الآن", "مساعدة حالا", "خطة أمان",
]

# Summary length bounds (in words)
SUMMARY_MIN = 20
SUMMARY_MAX = 70

# Output files (one row per call in the bundle)
OUT_ASR_CHUNKS = "artifacts/asr_chunks.jsonl"
OUT_REDACTED = "artifacts/redacted_interactions.jsonl"
OUT_TOPIC = "artifacts/topic_intent.jsonl"
OUT_EMOTION = "artifacts/emotion_distress.jsonl"
OUT_URGENCY = "artifacts/urgency.jsonl"
OUT_BUNDLE = "artifacts/pipeline_bundle.jsonl"
