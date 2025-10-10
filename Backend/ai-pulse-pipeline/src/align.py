# -*- coding: utf-8 -*-
from typing import List, Dict

def _overlap(a0, a1, b0, b1):
    return max(0.0, min(a1, b1) - max(a0, b0))

def align_segments(asr_segments: List[Dict], diar_segments: List[Dict]) -> List[Dict]:
    """
    Assign a speaker role to each ASR segment by overlapping with diarization output.
    Returns list of chunks: {t0, t1, speaker, text}
    """
    out = []
    for s in asr_segments:
        t0, t1 = s["start"], s["end"]
        best_role, best_ov = "unknown", 0.0
        for d in diar_segments:
            ov = _overlap(t0, t1, d["start"], d["end"])
            if ov > best_ov:
                best_ov = ov
                best_role = d.get("speaker_role", "unknown")
        out.append({"t0": t0, "t1": t1, "speaker": best_role, "text": s["text"]})
    return out
