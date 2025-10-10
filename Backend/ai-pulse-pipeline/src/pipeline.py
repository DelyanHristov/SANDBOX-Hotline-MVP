# -*- coding: utf-8 -*-
import json
from typing import Dict, Any, List

from .config import (
    TOPIC_LABELS_AR,
    EMOTION_LABELS_AR,
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

def _write_jsonl(path: str, rows: List[Dict[str, Any]]):
    with open(path, "a", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

def process_audio_call(call_id: str, audio_path: str):
    # 1) ASR + diarization + align -> ASR Output (chunk)
    asr = transcribe(audio_path, lang="ar", model_size=ASR_MODEL_SIZE)
    diar = diarize(audio_path)
    chunks = align_segments(asr["segments"], diar)

    asr_chunks = [{"call_id": call_id, "t0": c["t0"], "t1": c["t1"], "speaker": c["speaker"], "text": c["text"]} for c in chunks]
    _write_jsonl(OUT_ASR_CHUNKS, asr_chunks)

    # 2) Normalize + 3) PII scrub -> Redacted Interaction
    turns = []
    red_logs_all = []
    for c in asr_chunks:
        norm = normalize_arabic(c["text"])
        red, log = redact_pii(norm)
        turns.append({"spk": c["speaker"] if c["speaker"]!="unknown" else "caller", "t0": c["t0"], "t1": c["t1"], "text": red})
        red_logs_all.extend(log)
    redacted = {"call_id": call_id, "turns": turns, "redaction_log": red_logs_all}
    _write_jsonl(OUT_REDACTED, [redacted])

    # 4a) Dialect (on concatenated redacted text)
    txt = " ".join(t["text"] for t in turns)
    dialect = dialect_id(txt)

    # 4b) Topic / Intent
    top = topic_intent(txt)
    _write_jsonl(OUT_TOPIC, [{"call_id": call_id, "topic": top["topic"], "subtopic":"", "confidence": top["confidence"]}])

    # 4c) Emotion / Distress
    emo = emotion_distress(txt)
    _write_jsonl(OUT_EMOTION, [{"call_id": call_id, "emotion_now": emo["emotion_now"], "trend": emo["trend"], "evidence": ""}])

    # 4d) Urgency (P1–P3)
    urg = urgency(txt, top["topic"])
    _write_jsonl(OUT_URGENCY, [{"call_id": call_id, "urgency": urg["urgency"], "reason": urg["reason"]}])

    # 4e) Non-clinical summary
    summary = summarize_ar(txt)

    # Bundle everything (one row per call)
    bundle = {
        "call_id": call_id,
        "asr_chunks": asr_chunks,
        "redacted": redacted,
        "dialect": dialect,
        "topic": {"topic": top["topic"], "confidence": top["confidence"]},
        "emotion": {"now": emo["emotion_now"], "trend": emo["trend"]},
        "urgency": urg,
        "summary": summary
    }
    _write_jsonl(OUT_BUNDLE, [bundle])

def process_text_call(call_id: str, text: str):
    # Simulates chat/SMS path (skip ASR/diar)
    norm = normalize_arabic(text)
    red, log = redact_pii(norm)
    redacted = {"call_id": call_id, "turns": [{"spk":"caller","t0":0.0,"t1":0.0,"text": red}], "redaction_log": log}
    _write_jsonl(OUT_REDACTED, [redacted])

    dialect = dialect_id(red)
    top = topic_intent(red)
    emo = emotion_distress(red)
    urg = urgency(red, top["topic"])
    summary = summarize_ar(red)

    _write_jsonl(OUT_TOPIC, [{"call_id": call_id, "topic": top["topic"], "subtopic":"", "confidence": top["confidence"]}])
    _write_jsonl(OUT_EMOTION, [{"call_id": call_id, "emotion_now": emo["emotion_now"], "trend": emo["trend"], "evidence": ""}])
    _write_jsonl(OUT_URGENCY, [{"call_id": call_id, "urgency": urg["urgency"], "reason": urg["reason"]}])

    bundle = {"call_id": call_id, "asr_chunks": [], "redacted": redacted, "dialect": dialect,
              "topic": {"topic": top["topic"], "confidence": top["confidence"]},
              "emotion": {"now": emo["emotion_now"], "trend": emo["trend"]},
              "urgency": urg, "summary": summary}
    _write_jsonl(OUT_BUNDLE, [bundle])
