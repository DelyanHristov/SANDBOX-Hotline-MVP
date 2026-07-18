import re
from typing import Dict, List, Tuple

REDACTION_PATTERNS = [
    (re.compile(r"(https?://\S+|www\.\S+)"), "URL"),
    (re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"), "EMAIL"),
    (re.compile(r"\b(?:\+?\d[\d \-]{7,}\d)\b"), "PHONE"),
    (re.compile(r"[٠-٩]{8,}"), "NUM"),
    (re.compile(r"\b\d{8,}\b"), "NUM"),
    (re.compile(r"\b\d{4}[- ]?\d{4}[- ]?\d{4,}\b"), "ID"),
]


def redact_pii(text: str) -> Tuple[str, List[Dict]]:
    redaction_log: List[Dict] = []
    redacted = text
    for pattern, label in REDACTION_PATTERNS:
        def replace(match, label=label):
            redaction_log.append(
                {"type": label, "original": match.group(0), "replacement": f"[{label}]"}
            )
            return f"[{label}]"
        redacted = pattern.sub(replace, redacted)
    return redacted, redaction_log
