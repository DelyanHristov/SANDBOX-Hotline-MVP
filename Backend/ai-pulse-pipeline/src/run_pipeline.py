import argparse
import json
import os
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


def clear_outputs():
    for path in [OUT_ASR_CHUNKS, OUT_REDACTED, OUT_TOPIC, OUT_EMOTION, OUT_URGENCY, OUT_BUNDLE]:
        if os.path.exists(path):
            os.remove(path)
    Path("artifacts").mkdir(parents=True, exist_ok=True)


def read_jsonl(path):
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio_jsonl", help="JSONL with {'call_id','audio_path'} per line")
    parser.add_argument("--text_jsonl", help="JSONL with {'call_id','text'} per line")
    parser.add_argument("--clear", action="store_true", help="Clear artifacts/* first")
    args = parser.parse_args()

    if args.clear:
        clear_outputs()

    if args.audio_jsonl:
        for row in read_jsonl(args.audio_jsonl):
            process_audio_call(row["call_id"], row["audio_path"])

    if args.text_jsonl:
        for row in read_jsonl(args.text_jsonl):
            process_text_call(row["call_id"], row["text"])

    print("Done. See artifacts/*.jsonl")


if __name__ == "__main__":
    main()
