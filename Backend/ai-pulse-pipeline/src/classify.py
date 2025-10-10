# -*- coding: utf-8 -*-
"""
Classification helpers for dialect, topic, emotion, and urgency.

The module prefers Hugging Face zero-shot pipelines. When transformers or network
downloads are unavailable, keyword-based fallbacks keep the pipeline functional.
"""
import os
from typing import Any, Dict, List, Optional, Tuple

try:
    from transformers import pipeline  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    pipeline = None  # type: ignore

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
_ZS: Any = None
_ZS_ERROR: Optional[Exception] = None


def _zs():
    """Lazy-load the zero-shot classification pipeline."""
    global _ZS, _ZS_ERROR
    if _ZS_ERROR is not None:
        raise RuntimeError(str(_ZS_ERROR))
    if _ZS is None:
        if pipeline is None:
            _ZS_ERROR = RuntimeError("transformers is not installed.")
            raise RuntimeError("transformers is not installed.")
        try:
            _ZS = pipeline("zero-shot-classification", model="joeddav/xlm-roberta-large-xnli")
        except Exception as err:  # pragma: no cover - depends on external download
            _ZS_ERROR = err
            raise RuntimeError(f"zero-shot pipeline unavailable: {err}") from err
    return _ZS


def zs_rank(text: str, labels: List[str], hypo: str, multi: bool = True) -> List[Tuple[str, float]]:
    clf = _zs()
    res = clf(text, labels, multi_label=multi, hypothesis_template=hypo)
    return list(zip(res["labels"], [float(score) for score in res["scores"]]))


# --- OpenAI (optional) ------------------------------------------------------
_OAI: Any = None


def _oai():
    global _OAI
    if _OAI is None:
        from openai import OpenAI

        _OAI = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    return _OAI


def oai_classify(text: str, labels: List[str], instruction: str) -> List[Tuple[str, float]]:
    """
    Few-shot classification via OpenAI. Returns list[(label, score)].
    """
    client = _oai()
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
        prob = 1.0 / len(labels)
        return [(lab, prob) for lab in labels]
    payload = json.loads(match.group(0))
    return [(lab, float(payload.get(lab, 0.0))) for lab in labels]


# --- Keyword fallbacks ------------------------------------------------------
_DIALECT_HINTS: Dict[str, List[str]] = {
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

_TOPIC_HINTS: Dict[str, List[str]] = {
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

_EMOTION_HINTS: Dict[str, List[str]] = {
    "حزن": ["حزين", "دموع", "يبكي", "فقد"],
    "قلق": ["قلق", "متوتر", "أفكر", "أوسوس"],
    "خوف": ["خايف", "خوف", "مرعوب"],
    "غضب": ["غاضب", "معصب", "مقهور", "زعلان"],
    "أمل": ["متفائل", "أمل", "إن شاء الله", "بإذن"],
    "ارتياح": ["مرتاح", "اطمأن", "تحسنت"],
    "محايد": [],
}


def _keyword_rank(
    text: str,
    labels: List[str],
    mapping: Dict[str, List[str]],
    default_label: Optional[str] = None,
) -> List[Tuple[str, float]]:
    text_lower = text.lower()
    raw_scores = []
    for label in labels:
        keywords = mapping.get(label, [])
        score = sum(1 for kw in keywords if kw.lower() in text_lower)
        raw_scores.append((label, float(score)))
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


def _sort_rank(ranked: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
    return sorted(ranked, key=lambda item: item[1], reverse=True)


# ---- Public tasks ----------------------------------------------------------
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
        ranked = oai_classify(text, labels, "صنّف اللهجة العربية للنص بدقة.")
    else:
        try:
            ranked = zs_rank(text, labels, "اللهجة الرئيسية في هذا النص هي {}.", multi=False)
        except RuntimeError:
            ranked = _keyword_rank(text, labels, _DIALECT_HINTS, default_label="فصحى")
    ranked = _sort_rank(list(ranked))
    top = ranked[0]
    return {"dialect": top[0], "score": float(top[1]), "distribution": ranked}


def topic_intent(text: str) -> Dict[str, Any]:
    if USE_OPENAI_FOR_CLASSIFY:
        ranked = oai_classify(text, TOPIC_LABELS_AR, "صنّف موضوع النص في واحدة أو أكثر من الفئات التالية.")
    else:
        try:
            ranked = zs_rank(text, TOPIC_LABELS_AR, "هذا النص يتحدث عن {}.", multi=True)
        except RuntimeError:
            ranked = _keyword_rank(text, TOPIC_LABELS_AR, _TOPIC_HINTS, default_label="أخرى")
    ranked = _sort_rank(list(ranked))
    top = ranked[0]
    return {"topic": top[0], "subtopic": "", "confidence": float(top[1]), "distribution": ranked}


def _fallback_emotion(text: str) -> List[Tuple[str, float]]:
    ranked = _keyword_rank(text, EMOTION_LABELS_AR, _EMOTION_HINTS, default_label="محايد")
    return _sort_rank(ranked)


def emotion_distress(text: str) -> Dict[str, Any]:
    if USE_OPENAI_FOR_CLASSIFY:
        ranked = oai_classify(text, EMOTION_LABELS_AR, "استخرج المشاعر السائدة بدقة عالية.")
        ranked = _sort_rank(list(ranked))
    else:
        try:
            ranked = zs_rank(text, EMOTION_LABELS_AR, "المشاعر الرئيسية في هذا النص هي {}.", multi=True)
            ranked = _sort_rank(list(ranked))
        except RuntimeError:
            ranked = _fallback_emotion(text)

    top = ranked[0]
    trend = "ثابت"
    words = text.split()
    if len(words) >= 40:
        try:
            midpoint = len(words) // 2

            def _score(tokens: List[str]) -> float:
                portion = " ".join(tokens)
                res = zs_rank(
                    portion,
                    EMOTION_LABELS_AR,
                    "المشاعر الرئيسية في هذا النص هي {}.",
                    multi=True,
                )
                res = _sort_rank(list(res))[0]
                negative = {"حزن", "قلق", "خوف", "غضب"}
                return res[1] if res[0] in negative else 1 - res[1]

            delta = _score(words[midpoint:]) - _score(words[:midpoint])
            trend = "صاعد" if delta > 0.10 else ("هابط" if delta < -0.10 else "ثابت")
        except RuntimeError:
            trend = "ثابت"
    return {"emotion_now": top[0], "trend": trend, "distribution": ranked}


def urgency(text: str, topic_top: str) -> Dict[str, Any]:
    hits = [keyword for keyword in URGENT_KEYWORDS if keyword in text]
    kw_score = 0.9 if hits else 0.0

    if USE_OPENAI_FOR_CLASSIFY:
        ranked = oai_classify(text, ["عاجل", "غير عاجل"], "قيّم إلحاحية الحالة بدقة (عاجل/غير عاجل).")
        ranked = _sort_rank(list(ranked))
        label, score = ranked[0]
        zs_prob = score if label == "عاجل" else 1 - score
        reason = "openai"
    else:
        try:
            ranked = zs_rank(text, ["عاجل", "غير عاجل"], "هذا الموقف هو {}.", multi=False)
            label, score = ranked[0]
            zs_prob = float(score) if label == "عاجل" else 1 - float(score)
            reason = "model"
        except RuntimeError:
            zs_prob = 0.65 if hits else 0.25
            reason = "keywords" if hits else "fallback"

    score = max(kw_score, zs_prob)
    if score >= URGENCY_THRESHOLDS["P1"]:
        label = "P1"
    elif score >= URGENCY_THRESHOLDS["P2"]:
        label = "P2"
    else:
        label = "P3"

    reason_detail = "keywords:" + ",".join(hits) if hits else reason
    if topic_top in ["العنف/السلامة", "التنمر/التحرش"] and label == "P2" and score > URGENCY_THRESHOLDS["P1"] - 0.05:
        label = "P1"
        reason_detail += "|topic_bump"

    return {"urgency": label, "score": float(score), "reason": reason_detail}
