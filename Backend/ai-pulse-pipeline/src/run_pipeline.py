# -*- coding: utf-8 -*-
import argparse, json, os
from pathlib import Path

from .pipeline import process_audio_call, process_text_call
from .config import (
    OUT_ASR_CHUNKS,
    OUT_REDACTED,
    OUT_TOPIC,
    OUT_EMOTION,
    OUT_URGENCY,
    OUT_BUNDLE,
)

def _clear_outputs():
    for p in [OUT_ASR_CHUNKS, OUT_REDACTED, OUT_TOPIC, OUT_EMOTION, OUT_URGENCY, OUT_BUNDLE]:
        if os.path.exists(p):
            os.remove(p)
    Path("artifacts").mkdir(parents=True, exist_ok=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio_jsonl", help="JSONL with {'call_id','audio_path'} per line")
    ap.add_argument("--text_jsonl", help="JSONL with {'call_id','text'} per line")
    ap.add_argument("--clear", action="store_true", help="Clear artifacts/* first")
    args = ap.parse_args()

    if args.clear:
        _clear_outputs()

    def _iter_lines(p):
        with open(p, "r", encoding="utf-8") as f:
            for ln in f:
                if ln.strip():
                    yield json.loads(ln)

    if args.audio_jsonl:
        for row in _iter_lines(args.audio_jsonl):
            process_audio_call(row["call_id"], row["audio_path"])

    if args.text_jsonl:
        for row in _iter_lines(args.text_jsonl):
            process_text_call(row["call_id"], row["text"])

    print("Done. See artifacts/*.jsonl")

if __name__ == "__main__":
    main()
