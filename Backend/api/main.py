from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = ROOT_DIR / "ai-pulse-pipeline" / "artifacts"
ARTIFACT_BUNDLE = ARTIFACT_DIR / "pipeline_bundle.jsonl"

REGIONS = ["Riyadh", "Eastern", "Makkah", "Madinah"]
AGENTS = ["Agent Layla", "Agent Omar", "Agent Sara", "Agent Tariq"]
SUBTOPICS = [
    "Divorce",
    "Workload",
    "Academic Stress",
    "Acute Episode",
    "Low Mood",
    "Health Anxiety",
    "Shift Work",
    "Team Dynamics",
]

DIALECT_TRANSLATIONS = {
    "فصحى": "Modern Standard Arabic",
    "ليبي": "Libyan Arabic",
    "يمني": "Yemeni Arabic",
    "شامي": "Levantine Arabic",
    "جزائري": "Algerian Arabic",
    "خليجي": "Gulf Arabic",
    "سعودي": "Saudi Arabic",
    "تونسي": "Tunisian Arabic",
    "مغربي": "Moroccan Arabic",
    "سوداني": "Sudanese Arabic",
    "مصري": "Egyptian Arabic",
    "عراقي": "Iraqi Arabic",
}

COLOR_PALETTE = [
    "#4C3AFE",
    "#0EA5E9",
    "#F97316",
    "#22C55E",
    "#E11D48",
    "#8B5CF6",
]

app = FastAPI(
    title="AI Pulse Pipeline API",
    version="0.1.0",
    description="Lightweight API that exposes pipeline artifacts for the frontend MVP.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _read_jsonl(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        legacy_path = ROOT_DIR / "artifacts" / path.name
        if legacy_path.exists():
            path = legacy_path

    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Artifact not found: {path.name}")

    rows: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))

    if not rows:
        raise HTTPException(
            status_code=404,
            detail=(
                "Pipeline bundle is empty. Run the pipeline first "
                "to generate artifacts/pipeline_bundle.jsonl."
            ),
        )

    return rows


def _isoformat(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def _build_interactions(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    base_time = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    total = len(rows)
    interactions: List[Dict[str, Any]] = []
    for idx, row in enumerate(rows):
        call_id = row.get("call_id", f"call-{idx:03d}")
        raw_topic = row.get("topic", {})
        topic_name = raw_topic.get("topic") or "غير مصنف"
        subtopic = SUBTOPICS[idx % len(SUBTOPICS)]
        topic_confidence = float(raw_topic.get("confidence") or 0.0)

        raw_emotion = row.get("emotion", {})
        emotion_now = raw_emotion.get("now") or ""
        emotion_trend = raw_emotion.get("trend") or ""

        raw_urgency = row.get("urgency", {})
        urgency_level = raw_urgency.get("urgency") or "P3"
        raw_reason = raw_urgency.get("reason") or ""
        urgency_reason = _map_urgency_reason(urgency_level, raw_reason)

        raw_redacted = row.get("redacted") or {"call_id": call_id, "turns": [], "redaction_log": []}
        dialect_raw = (row.get("dialect") or {}).get("dialect") or "غير محدد"
        dialect_value = DIALECT_TRANSLATIONS.get(dialect_raw, dialect_raw)
        timestamp = base_time - timedelta(minutes=15 * (total - idx - 1))
        channel = "Call" if row.get("asr_chunks") else "Chat"
        region = REGIONS[idx % len(REGIONS)]
        agent = AGENTS[idx % len(AGENTS)]

        interactions.append(
            {
                "call_id": call_id,
                "redacted": raw_redacted,
                "topic": {
                    "call_id": call_id,
                    "topic": topic_name,
                    "subtopic": subtopic,
                    "confidence": topic_confidence,
                },
                "emotion": {
                    "call_id": call_id,
                    "emotion_now": emotion_now,
                    "trend": emotion_trend,
                    "evidence": "",
                },
                "urgency": {
                    "call_id": call_id,
                    "urgency": urgency_level,
                    "reason": urgency_reason,
                },
                "metadata": {
                    "call_id": call_id,
                    "timestamp": _isoformat(timestamp),
                    "channel": channel,
                    "region": region,
                    "dialect": dialect_value,
                    "agent": agent,
                },
            }
        )
    return interactions


def _map_urgency_reason(level: str, raw_reason: str) -> str:
    if raw_reason and raw_reason.lower() != "model":
        return raw_reason
    if level == "P1":
        return "Immediate risk cues detected by the model"
    if level == "P2":
        return "Elevated distress cues present"
    return "Routine support request"


def _parse_timestamp(timestamp: str) -> datetime:
    return datetime.fromisoformat(timestamp.replace("Z", "+00:00"))


def _build_time_buckets(
    interactions: Iterable[Dict[str, Any]],
    bucket_minutes: int = 60,
    bucket_count: int = 5,
) -> Tuple[List[Tuple[datetime, datetime]], datetime]:
    timestamps = [_parse_timestamp(item["metadata"]["timestamp"]) for item in interactions]
    if not timestamps:
        now = datetime.now(timezone.utc)
        return [], now
    latest = max(timestamps)
    buckets: List[Tuple[datetime, datetime]] = []
    for idx in range(bucket_count):
        end = latest - timedelta(minutes=bucket_minutes * (bucket_count - idx - 1))
        start = end - timedelta(minutes=bucket_minutes)
        buckets.append((start, end))
    return buckets, latest


def _filter_interactions_by_window(
    interactions: Iterable[Dict[str, Any]],
    start: datetime,
    end: datetime,
) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    for item in interactions:
        ts = _parse_timestamp(item["metadata"]["timestamp"])
        if start < ts <= end:
            items.append(item)
    return items


def _build_heatmap(interactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    regions = sorted({item["metadata"]["region"] for item in interactions})
    topics = sorted({item["topic"]["topic"] for item in interactions})
    if not regions or not topics:
        return {"regions": [], "topics": [], "counts": []}

    region_index = {region: idx for idx, region in enumerate(regions)}
    topic_index = {topic: idx for idx, topic in enumerate(topics)}
    counts = [[0 for _ in topics] for _ in regions]

    for item in interactions:
        r_idx = region_index[item["metadata"]["region"]]
        t_idx = topic_index[item["topic"]["topic"]]
        counts[r_idx][t_idx] += 1

    return {"regions": regions, "topics": topics, "counts": counts}


def _build_alerts(
    interactions: List[Dict[str, Any]],
    buckets: List[Tuple[datetime, datetime]],
) -> Tuple[List[Dict[str, Any]], Dict[str, List[Dict[str, Any]]]]:
    alerts: List[Dict[str, Any]] = []
    series_lookup: Dict[str, List[Dict[str, Any]]] = {}
    if not buckets:
        return alerts, series_lookup

    grouped: Dict[Tuple[str, str], List[Dict[str, Any]]] = defaultdict(list)
    for item in interactions:
        key = (item["metadata"]["region"], item["topic"]["topic"])
        grouped[key].append(item)

    for (region, topic), items in grouped.items():
        series: List[Dict[str, Any]] = []
        for start, end in buckets:
            within = _filter_interactions_by_window(items, start, end)
            series.append({"ts": _isoformat(end), "volume": len(within)})

        series_lookup[f"{region}|{topic}"] = series
        if not series:
            continue

        latest_volume = series[-1]["volume"]
        previous_volume = series[-2]["volume"] if len(series) > 1 else 0

        if latest_volume == 0 and previous_volume == 0:
            continue

        if previous_volume == 0:
            delta_pct = 100
        else:
            delta_pct = int(round(((latest_volume - previous_volume) / previous_volume) * 100))
        delta_pct = max(delta_pct, 0)

        alerts.append(
            {
                "region": region,
                "topic": topic,
                "delta_pct": delta_pct,
                "window_min": int((buckets[-1][1] - buckets[-1][0]).total_seconds() // 60),
                "ts": series[-1]["ts"],
                "status": "new" if latest_volume > 0 else "resolved",
            }
        )

    alerts.sort(key=lambda alert: alert["delta_pct"], reverse=True)
    return alerts, series_lookup


def _build_volume_trends(
    interactions: List[Dict[str, Any]],
    buckets: List[Tuple[datetime, datetime]],
) -> Dict[str, Any]:
    if not buckets:
        return {"labels": [], "series": [], "p1Rates": []}

    labels = [end.strftime("%H:%M") for _, end in buckets]
    topic_counts: Dict[str, List[int]] = defaultdict(lambda: [0] * len(buckets))
    p1_counts = [0] * len(buckets)
    total_counts = [0] * len(buckets)

    for idx, (start, end) in enumerate(buckets):
        window_items = _filter_interactions_by_window(interactions, start, end)
        for item in window_items:
            topic_counts[item["topic"]["topic"]][idx] += 1
            total_counts[idx] += 1
            if item["urgency"]["urgency"] == "P1":
                p1_counts[idx] += 1

    top_topics = sorted(
        topic_counts.items(),
        key=lambda entry: sum(entry[1]),
        reverse=True,
    )[:3]

    series = []
    for color_index, (topic, values) in enumerate(top_topics):
        color = COLOR_PALETTE[color_index % len(COLOR_PALETTE)]
        series.append({"name": topic, "color": color, "values": values})

    if not series:
        series = [{"name": "All Topics", "color": COLOR_PALETTE[0], "values": total_counts}]

    p1_rates: List[float] = []
    for p1, total in zip(p1_counts, total_counts):
        rate = round(p1 / total, 2) if total else 0.0
        p1_rates.append(rate)

    return {"labels": labels, "series": series, "p1Rates": p1_rates}


def _build_leadership_summary(
    interactions: List[Dict[str, Any]],
    latest: datetime,
    window_minutes: int,
) -> List[str]:
    if not interactions:
        return ["No interactions available yet. Run the pipeline to populate data."]

    window_start = latest - timedelta(minutes=window_minutes)
    recent = _filter_interactions_by_window(interactions, window_start, latest)
    regions = sorted({item["metadata"]["region"] for item in interactions})
    topics = sorted({item["topic"]["topic"] for item in interactions})
    p1_total = sum(1 for item in interactions if item["urgency"]["urgency"] == "P1")
    p1_rate = round((p1_total / len(interactions)) * 100, 1) if interactions else 0.0
    top_topic = max(
        topics,
        key=lambda topic: sum(1 for item in interactions if item["topic"]["topic"] == topic),
        default=None,
    )

    summary: List[str] = []
    summary.append(f"{len(recent)} interactions in the last {window_minutes} minutes")
    if top_topic:
        summary.append(f"Top topic: {top_topic}")
    summary.append(f"P1 share across all interactions: {p1_rate}%")
    summary.append(f"Coverage across regions: {len(regions)} active region(s)")
    return summary


@app.get("/api/dashboard")
def get_dashboard() -> Dict[str, Any]:
    rows = _read_jsonl(ARTIFACT_BUNDLE)
    interactions = _build_interactions(rows)
    heatmap = _build_heatmap(interactions)
    buckets, latest = _build_time_buckets(interactions, bucket_minutes=60, bucket_count=5)
    alerts, alert_series = _build_alerts(interactions, buckets)
    volume_trends = _build_volume_trends(interactions, buckets)
    leadership_summary = _build_leadership_summary(interactions, latest, 60)
    return {
        "interactions": interactions,
        "alerts": alerts,
        "alertSeries": alert_series,
        "heatmap": heatmap,
        "reports": {
            "leadershipSummary": leadership_summary,
            "volumeTrendSeries": volume_trends,
        },
        "updatedAt": _isoformat(latest),
    }
