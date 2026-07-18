"""Dialect, topic, emotion and urgency classification.

Prefers Hugging Face zero-shot pipelines (or OpenAI when enabled). When neither
transformers nor network downloads are available, keyword-based fallbacks keep the
pipeline working end to end.
"""
import os
from typing import Any, Dict, List, Optional, Tuple

try:
    from transformers import pipeline
except ImportError:
    pipeline = None

from dotenv import load_dotenv

from .config import (
    EMOTION_LABELS_AR,
    TOPIC_LABELS_AR,
    URGENT_KEYWORDS,
    URGENCY_THRESHOLDS,
    USE_OPENAI_FOR_CLASSIFY,
)

load_dotenv()


# --- Hugging Face zero-shot -------------------------------------------------
_zero_shot: Any = None
_zero_shot_error: Optional[Exception] = None


def get_zero_shot():
    """Lazily load the zero-shot classification pipeline."""
    global _zero_shot, _zero_shot_error
    if _zero_shot_error is not None:
        raise RuntimeError(str(_zero_shot_error))
    if _zero_shot is None:
        if pipeline is None:
            _zero_shot_error = RuntimeError("transformers is not installed.")
            raise RuntimeError("transformers is not installed.")
        try:
            _zero_shot = pipeline("zero-shot-classification", model="joeddav/xlm-roberta-large-xnli")
        except Exception as error:
            _zero_shot_error = error
            raise RuntimeError(f"zero-shot pipeline unavailable: {error}") from error
    return _zero_shot


def zero_shot_rank(text: str, labels: List[str], hypothesis: str, multi: bool = True) -> List[Tuple[str, float]]:
    classifier = get_zero_shot()
    result = classifier(text, labels, multi_label=multi, hypothesis_template=hypothesis)
    return list(zip(result["labels"], [float(score) for score in result["scores"]]))


# --- OpenAI (optional) ------------------------------------------------------
_openai_client: Any = None


def get_openai_client():
    global _openai_client
    if _openai_client is None:
        from openai import OpenAI

        _openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    return _openai_client


def openai_classify(text: str, labels: List[str], instruction: str) -> List[Tuple[str, float]]:
    """Few-shot classification via OpenAI. Returns a list of (label, score)."""
    client = get_openai_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    prompt = (
        f"{instruction}\nLabels: {', '.join(labels)}\nText:\n{text}\n"
        "Return JSON with probabilities per label summing to 1."
    )
    messages = [
        {"role": "system", "content": "You are a precise Arabic text classifier."},
        {"role": "user", "content": prompt},
    ]
    response = client.chat.completions.create(model=model, messages=messages, temperature=0)

    import json
    import re

    content = response.choices[0].message.content
    match = re.search(r"\{.*\}", content, re.S)
    if not match:
        uniform = 1.0 / len(labels)
        return [(label, uniform) for label in labels]
    scores = json.loads(match.group(0))
    return [(label, float(scores.get(label, 0.0))) for label in labels]


# --- Keyword fallbacks ------------------------------------------------------
DIALECT_KEYWORDS: Dict[str, List[str]] = {
    "خليجي": ["هلا", "شلونك", "يعطيك العافية", "وايد"],
    "مصري": ["يعني", "ماشي", "كويس", "إزاي", "مش"],
    "شامي": ["شو", "كتير", "لسا", "هلأ", "منيح"],
    "فصحى": ["لماذا", "هذا الوضع", "أرغب"],
    "مغربي": ["واش", "بزاف", "دابا", "شنو"],
    "سعودي": ["وش", "مره", "توه"],
    "يمني": ["عاد", "ليش", "مابش"],
    "عراقي": ["شكو", "ماكو", "هسه"],
    "تونسي": ["برشا", "توا", "شنوة"],
    "جزائري": ["كاين", "زوين", "شوية"],
    "ليبي": ["خلاص", "حنّا", "وايد"],
    "سوداني": ["غايتو", "حسي", "ساي"],
}

TOPIC_KEYWORDS: Dict[str, List[str]] = {
    "العلاقات الأسرية": ["زوج", "زوجة", "أمي", "أبوي", "أختي", "أخي", "طلاق"],
    "الضغط الدراسي/العملي": ["دراسة", "امتحان", "جامعة", "مدرسة", "شغل", "عمل", "مدير"],
    "التنمر/التحرش": ["تحرش", "يتنمر", "سخرية", "اهانة", "ابتزاز"],
    "مشكلات مالية": ["دين", "قرض", "راتب", "فلوس", "مصاريف", "إيجار"],
    "فقد/حزن": ["وفاة", "مات", "رحل", "فقدت", "حزن"],
    "تعاطي مواد": ["مخدرات", "يشرب", "كحول", "إدمان", "سيجارة"],
    "صحة نفسية عامة": ["قلق", "اكتئاب", "معالج", "جلسة", "علاج نفسي"],
    "صحة جسدية/إحالة": ["طبيب", "مستشفى", "ألم", "تشخيص"],
    "العنف/السلامة": ["ضرب", "تعنيف", "سلاح", "تهديد", "شرطة"],
    "أخرى": [],
}

EMOTION_KEYWORDS: Dict[str, List[str]] = {
    "حزن": ["حزين", "دموع", "يبكي", "فقد"],
    "قلق": ["قلق", "متوتر", "أفكر", "أوسوس"],
    "خوف": ["خايف", "خوف", "مرعوب"],
    "غضب": ["غاضب", "معصب", "مقهور", "زعلان"],
    "أمل": ["متفائل", "أمل", "إن شاء الله", "بإذن"],
    "ارتياح": ["مرتاح", "اطمأن", "تحسنت"],
    "محايد": [],
}


def keyword_rank(
    text: str,
    labels: List[str],
    keywords: Dict[str, List[str]],
    default_label: Optional[str] = None,
) -> List[Tuple[str, float]]:
    lowered = text.lower()
    raw_scores = []
    for label in labels:
        hits = sum(1 for word in keywords.get(label, []) if word.lower() in lowered)
        raw_scores.append((label, float(hits)))
    total = sum(score for _, score in raw_scores)
    if total == 0.0:
        if default_label and default_label in labels and len(labels) > 1:
            return [
                (label, 0.7 if label == default_label else 0.3 / (len(labels) - 1))
                for label, _ in raw_scores
            ]
        weight = 1.0 / len(labels) if labels else 0.0
        return [(label, weight) for label, _ in raw_scores]
    return [(label, score / total) for label, score in raw_scores]


def sort_by_score(ranked: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
    return sorted(ranked, key=lambda item: item[1], reverse=True)


# --- Public tasks -----------------------------------------------------------
def dialect_id(text: str) -> Dict[str, Any]:
    labels = [
        "خليجي",
        "مصري",
        "شامي",
        "فصحى",
        "مغربي",
        "سعودي",
        "يمني",
        "عراقي",
        "تونسي",
        "جزائري",
        "ليبي",
        "سوداني",
    ]
    if USE_OPENAI_FOR_CLASSIFY:
        ranked = openai_classify(text, labels, "صنّف اللهجة العربية للنص بدقة.")
    else:
        try:
            ranked = zero_shot_rank(text, labels, "اللهجة الرئيسية في هذا النص هي {}.", multi=False)
        except RuntimeError:
            ranked = keyword_rank(text, labels, DIALECT_KEYWORDS, default_label="فصحى")
    ranked = sort_by_score(list(ranked))
    top_label, top_score = ranked[0]
    return {"dialect": top_label, "score": float(top_score), "distribution": ranked}


def topic_intent(text: str) -> Dict[str, Any]:
    if USE_OPENAI_FOR_CLASSIFY:
        ranked = openai_classify(text, TOPIC_LABELS_AR, "صنّف موضوع النص في واحدة أو أكثر من الفئات التالية.")
    else:
        try:
            ranked = zero_shot_rank(text, TOPIC_LABELS_AR, "هذا النص يتحدث عن {}.", multi=True)
        except RuntimeError:
            ranked = keyword_rank(text, TOPIC_LABELS_AR, TOPIC_KEYWORDS, default_label="أخرى")
    ranked = sort_by_score(list(ranked))
    top_label, top_score = ranked[0]
    return {"topic": top_label, "subtopic": "", "confidence": float(top_score), "distribution": ranked}


def fallback_emotion(text: str) -> List[Tuple[str, float]]:
    return sort_by_score(keyword_rank(text, EMOTION_LABELS_AR, EMOTION_KEYWORDS, default_label="محايد"))


def emotion_distress(text: str) -> Dict[str, Any]:
    if USE_OPENAI_FOR_CLASSIFY:
        ranked = sort_by_score(list(openai_classify(text, EMOTION_LABELS_AR, "استخرج المشاعر السائدة بدقة عالية.")))
    else:
        try:
            ranked = sort_by_score(list(zero_shot_rank(text, EMOTION_LABELS_AR, "المشاعر الرئيسية في هذا النص هي {}.", multi=True)))
        except RuntimeError:
            ranked = fallback_emotion(text)

    top_emotion = ranked[0][0]

    # For longer transcripts, compare the first and second half to spot a trend.
    trend = "ثابت"
    words = text.split()
    if len(words) >= 40:
        try:
            midpoint = len(words) // 2
            negative_emotions = {"حزن", "قلق", "خوف", "غضب"}

            def negativity(tokens: List[str]) -> float:
                half = " ".join(tokens)
                label, score = sort_by_score(list(
                    zero_shot_rank(half, EMOTION_LABELS_AR, "المشاعر الرئيسية في هذا النص هي {}.", multi=True)
                ))[0]
                return score if label in negative_emotions else 1 - score

            delta = negativity(words[midpoint:]) - negativity(words[:midpoint])
            trend = "صاعد" if delta > 0.10 else ("هابط" if delta < -0.10 else "ثابت")
        except RuntimeError:
            trend = "ثابت"
    return {"emotion_now": top_emotion, "trend": trend, "distribution": ranked}


def urgency(text: str, top_topic: str) -> Dict[str, Any]:
    keyword_hits = [word for word in URGENT_KEYWORDS if word in text]
    keyword_score = 0.9 if keyword_hits else 0.0

    if USE_OPENAI_FOR_CLASSIFY:
        ranked = sort_by_score(list(openai_classify(text, ["عاجل", "غير عاجل"], "قيّم إلحاحية الحالة بدقة (عاجل/غير عاجل).")))
        label, score = ranked[0]
        model_score = score if label == "عاجل" else 1 - score
        source = "openai"
    else:
        try:
            ranked = zero_shot_rank(text, ["عاجل", "غير عاجل"], "هذا الموقف هو {}.", multi=False)
            label, score = ranked[0]
            model_score = float(score) if label == "عاجل" else 1 - float(score)
            source = "model"
        except RuntimeError:
            model_score = 0.65 if keyword_hits else 0.25
            source = "keywords" if keyword_hits else "fallback"

    score = max(keyword_score, model_score)
    if score >= URGENCY_THRESHOLDS["P1"]:
        level = "P1"
    elif score >= URGENCY_THRESHOLDS["P2"]:
        level = "P2"
    else:
        level = "P3"

    reason = "keywords:" + ",".join(keyword_hits) if keyword_hits else source
    # Nudge safety-critical topics up to P1 when they sit just below the threshold.
    if top_topic in ["العنف/السلامة", "التنمر/التحرش"] and level == "P2" and score > URGENCY_THRESHOLDS["P1"] - 0.05:
        level = "P1"
        reason += "|topic_bump"

    return {"urgency": level, "score": float(score), "reason": reason}
