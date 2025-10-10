# -*- coding: utf-8 -*-

# === Providers / toggles ===
ASR_MODEL_SIZE = "medium"      # "large-v3" if you have GPU; otherwise "medium"
USE_OPENAI_FOR_SUMMARY = False # True to use OpenAI (needs OPENAI_API_KEY), else HF mT5
USE_OPENAI_FOR_CLASSIFY = False# True -> OpenAI few-shot classification; else HF zero-shot

# === Taxonomy (aligned with your file) ===
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
    "أخرى"
]

EMOTION_LABELS_AR = ["حزن", "قلق", "خوف", "غضب", "أمل", "ارتياح", "محايد"]

# Urgency thresholds (recall-first for P1)
URGENCY_THRESHOLDS = dict(P1=0.70, P2=0.40)
URGENT_KEYWORDS = [
    "انتحار","أنتحر","إيذاء نفسي","أؤذي نفسي","قتل","أقتل","تهديد","خطر",
    "اعتداء","اغتصاب","دم","حريق","طوارئ","فورا","الآن","مساعدة حالا","خطة أمان"
]

# Summaries
SUMMARY_MIN = 20
SUMMARY_MAX = 70

# JSON output paths
OUT_ASR_CHUNKS = "artifacts/asr_chunks.jsonl"
OUT_REDACTED = "artifacts/redacted_interactions.jsonl"
OUT_TOPIC = "artifacts/topic_intent.jsonl"
OUT_EMOTION = "artifacts/emotion_distress.jsonl"
OUT_URGENCY = "artifacts/urgency.jsonl"
OUT_BUNDLE = "artifacts/pipeline_bundle.jsonl"  # everything for each call
