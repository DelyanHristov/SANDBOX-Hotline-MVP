# -*- coding: utf-8 -*-
"""
Arabic summarisation with graceful fallbacks when transformers/OpenAI are absent.
"""
import os
import re
from typing import Any, Optional

try:
    from transformers import pipeline  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    pipeline = None  # type: ignore

from dotenv import load_dotenv

from .config import SUMMARY_MAX, SUMMARY_MIN, USE_OPENAI_FOR_SUMMARY

load_dotenv()

_SUM: Any = None
_SUM_ERROR: Optional[Exception] = None


def _hf_sum():
    global _SUM, _SUM_ERROR
    if _SUM_ERROR is not None:
        raise RuntimeError(str(_SUM_ERROR))
    if _SUM is None:
        if pipeline is None:
            _SUM_ERROR = RuntimeError("transformers is not installed.")
            raise RuntimeError("transformers is not installed.")
        try:
            _SUM = pipeline("summarization", model="csebuetnlp/mT5_multilingual_XLSum")
        except Exception as err:  # pragma: no cover - depends on external download
            _SUM_ERROR = err
            raise RuntimeError(f"HF summarizer unavailable: {err}") from err
    return _SUM


def _fallback_summary(text: str) -> str:
    # Use first one or two sentences; trim/pad to fit target length envelope.
    sentences = re.split(r"(?<=[\.!\؟])\s+", text)
    summary = " ".join(sentences[:2]) if len(sentences) > 1 else sentences[0]
    words = summary.split()
    if len(words) > SUMMARY_MAX:
        summary = " ".join(words[:SUMMARY_MAX])
    elif len(words) < SUMMARY_MIN and len(text.split()) >= SUMMARY_MIN:
        summary = " ".join(text.split()[:SUMMARY_MIN])
    return summary.strip()


def summarize_ar(text: str) -> str:
    if not text or len(text.split()) < 12:
        return text

    if USE_OPENAI_FOR_SUMMARY and os.getenv("OPENAI_API_KEY"):
        from openai import OpenAI

        client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        sys_prompt = "أنت مساعد يكتب ملخصات عربية موجزة، داعمة، وخالية من أي تشخيصات."
        user_prompt = (
            f"لخص النص التالي في {SUMMARY_MIN}-{SUMMARY_MAX} كلمة، بلغة حساسة وغير تشخيصية، "
            "ودون أي معلومات تعريفية:\n\n"
            f"{text}"
        )
        try:
            result = client.chat.completions.create(
                model=model,
                messages=[{"role": "system", "content": sys_prompt}, {"role": "user", "content": user_prompt}],
                temperature=0,
            )
            return result.choices[0].message.content.strip()
        except Exception:
            # Fall back to HF/heuristic if OpenAI call fails for any reason.
            pass

    try:
        summarizer = _hf_sum()
        inp = "summarize: " + text
        out = summarizer(inp, min_length=SUMMARY_MIN, max_length=SUMMARY_MAX, truncation=True)
        return out[0]["summary_text"]
    except Exception:
        return _fallback_summary(text)
