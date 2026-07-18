"""Arabic summarization with graceful fallbacks when OpenAI/transformers are absent."""
import os
import re
from typing import Any, Optional

try:
    from transformers import pipeline
except ImportError:
    pipeline = None

from dotenv import load_dotenv

from .config import SUMMARY_MAX, SUMMARY_MIN, USE_OPENAI_FOR_SUMMARY

load_dotenv()

_summarizer: Any = None
_summarizer_error: Optional[Exception] = None


def get_summarizer():
    global _summarizer, _summarizer_error
    if _summarizer_error is not None:
        raise RuntimeError(str(_summarizer_error))
    if _summarizer is None:
        if pipeline is None:
            _summarizer_error = RuntimeError("transformers is not installed.")
            raise RuntimeError("transformers is not installed.")
        try:
            _summarizer = pipeline("summarization", model="csebuetnlp/mT5_multilingual_XLSum")
        except Exception as error:
            _summarizer_error = error
            raise RuntimeError(f"HF summarizer unavailable: {error}") from error
    return _summarizer


def fallback_summary(text: str) -> str:
    # Take the first sentence or two and trim to the target length.
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
        system_prompt = "أنت مساعد يكتب ملخصات عربية موجزة، داعمة، وخالية من أي تشخيصات."
        user_prompt = (
            f"لخص النص التالي في {SUMMARY_MIN}-{SUMMARY_MAX} كلمة، بلغة حساسة وغير تشخيصية، "
            "ودون أي معلومات تعريفية:\n\n"
            f"{text}"
        )
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            pass  # fall through to HF/heuristic

    try:
        summarizer = get_summarizer()
        output = summarizer("summarize: " + text, min_length=SUMMARY_MIN, max_length=SUMMARY_MAX, truncation=True)
        return output[0]["summary_text"]
    except Exception:
        return fallback_summary(text)
