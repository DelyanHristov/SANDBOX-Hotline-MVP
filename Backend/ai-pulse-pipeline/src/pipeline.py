import json
from typing import Any, Dict, List

from .config import (
    OUT_ASR_CHUNKS,
    OUT_REDACTED,
    OUT_TOPIC,
    OUT_EMOTION,
    OUT_URGENCY,
    OUT_BUNDLE,
    ASR_MODEL_SIZE,
)
from .asr_diar import transcribe, diarize
from .align import align_segments
from .normalize import normalize_arabic
from .pii import redact_pii
from .classify import dialect_id, topic_intent, emotion_distress, urgency
from .summarize import summarize_ar


def append_jsonl(path: str, rows: List[Dict[str, Any]]):
    with open(path, "a", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def process_audio_call(call_id: str, audio_path: str):
    # Transcribe, diarize, then align words to the speaker who said them.
    transcript = transcribe(audio_path, lang="ar", model_size=ASR_MODEL_SIZE)
    speaker_turns = diarize(audio_path)
    aligned = align_segments(transcript["segments"], speaker_turns)

    chunks = [
        {"call_id": call_id, "t0": c["t0"], "t1": c["t1"], "speaker": c["speaker"], "text": c["text"]}
        for c in aligned
    ]
    append_jsonl(OUT_ASR_CHUNKS, chunks)

    # Normalize and scrub PII before anything is written downstream.
    turns = []
    redaction_log = []
    for chunk in chunks:
        normalized = normalize_arabic(chunk["text"])
        redacted_text, log = redact_pii(normalized)
        speaker = chunk["speaker"] if chunk["speaker"] != "unknown" else "caller"
        turns.append({"spk": speaker, "t0": chunk["t0"], "t1": chunk["t1"], "text": redacted_text})
        redaction_log.extend(log)
    redacted = {"call_id": call_id, "turns": turns, "redaction_log": redaction_log}
    append_jsonl(OUT_REDACTED, [redacted])

    full_text = " ".join(turn["text"] for turn in turns)
    dialect = dialect_id(full_text)

    topic = topic_intent(full_text)
    append_jsonl(OUT_TOPIC, [{"call_id": call_id, "topic": topic["topic"], "subtopic": "", "confidence": topic["confidence"]}])

    emotion = emotion_distress(full_text)
    append_jsonl(OUT_EMOTION, [{"call_id": call_id, "emotion_now": emotion["emotion_now"], "trend": emotion["trend"], "evidence": ""}])

    urgency_result = urgency(full_text, topic["topic"])
    append_jsonl(OUT_URGENCY, [{"call_id": call_id, "urgency": urgency_result["urgency"], "reason": urgency_result["reason"]}])

    summary = summarize_ar(full_text)

    bundle = {
        "call_id": call_id,
        "asr_chunks": chunks,
        "redacted": redacted,
        "dialect": dialect,
        "topic": {"topic": topic["topic"], "confidence": topic["confidence"]},
        "emotion": {"now": emotion["emotion_now"], "trend": emotion["trend"]},
        "urgency": urgency_result,
        "summary": summary,
    }
    append_jsonl(OUT_BUNDLE, [bundle])


def process_text_call(call_id: str, text: str):
    # Chat/SMS path: no audio, so skip ASR and diarization.
    normalized = normalize_arabic(text)
    redacted_text, log = redact_pii(normalized)
    redacted = {
        "call_id": call_id,
        "turns": [{"spk": "caller", "t0": 0.0, "t1": 0.0, "text": redacted_text}],
        "redaction_log": log,
    }
    append_jsonl(OUT_REDACTED, [redacted])

    dialect = dialect_id(redacted_text)
    topic = topic_intent(redacted_text)
    emotion = emotion_distress(redacted_text)
    urgency_result = urgency(redacted_text, topic["topic"])
    summary = summarize_ar(redacted_text)

    append_jsonl(OUT_TOPIC, [{"call_id": call_id, "topic": topic["topic"], "subtopic": "", "confidence": topic["confidence"]}])
    append_jsonl(OUT_EMOTION, [{"call_id": call_id, "emotion_now": emotion["emotion_now"], "trend": emotion["trend"], "evidence": ""}])
    append_jsonl(OUT_URGENCY, [{"call_id": call_id, "urgency": urgency_result["urgency"], "reason": urgency_result["reason"]}])

    bundle = {
        "call_id": call_id,
        "asr_chunks": [],
        "redacted": redacted,
        "dialect": dialect,
        "topic": {"topic": topic["topic"], "confidence": topic["confidence"]},
        "emotion": {"now": emotion["emotion_now"], "trend": emotion["trend"]},
        "urgency": urgency_result,
        "summary": summary,
    }
    append_jsonl(OUT_BUNDLE, [bundle])
