# -*- coding: utf-8 -*-
import re
from typing import Tuple, List, Dict

_PATTERNS = [
    (re.compile(r"(https?://\S+|www\.\S+)"), "URL"),
    (re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"), "EMAIL"),
    (re.compile(r"\b(?:\+?\d[\d \-]{7,}\d)\b"), "PHONE"),
    (re.compile(r"[\u0660-\u0669]{8,}"), "NUM"),
    (re.compile(r"\b\d{8,}\b"), "NUM"),
    (re.compile(r"\b\d{4}[- ]?\d{4}[- ]?\d{4,}\b"), "ID"),
]

def redact_pii(text: str) -> Tuple[str, List[Dict]]:
    log: List[Dict] = []
    out = text
    for pat, typ in _PATTERNS:
        def _repl(m):
            log.append({"type": typ, "original": m.group(0), "replacement": f"[{typ}]"})
            return f"[{typ}]"
        out = pat.sub(_repl, out)
    return out, log
