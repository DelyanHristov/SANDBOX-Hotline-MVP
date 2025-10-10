# -*- coding: utf-8 -*-
import json
from jiwer import wer
from tqdm import tqdm
from asr_diar import transcribe
from config import ASR_MODEL_SIZE

def normalize(s):
    import re
    s = s.lower()
    s = re.sub(r"[^\w\s\u0600-\u06FF]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def main(input_jsonl="data/audio_calls.jsonl"):
    refs, hyps = [], []
    with open(input_jsonl, "r", encoding="utf-8") as f:
        for ln in tqdm(f):
            ex = json.loads(ln)
            ref = normalize(ex.get("ref",""))
            hyp = normalize(transcribe(ex["audio_path"], lang="ar", model_size=ASR_MODEL_SIZE)["text"])
            refs.append(ref); hyps.append(hyp)
    print("WER:", wer(refs, hyps))

if __name__ == "__main__":
    main()
