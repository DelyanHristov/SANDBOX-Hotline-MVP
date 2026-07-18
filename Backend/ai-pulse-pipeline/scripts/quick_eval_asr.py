import json
import re

from jiwer import wer
from tqdm import tqdm

from asr_diar import transcribe
from config import ASR_MODEL_SIZE


def normalize(text):
    text = text.lower()
    text = re.sub(r"[^\w\s؀-ۿ]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def main(input_jsonl="data/audio_calls.jsonl"):
    references, hypotheses = [], []
    with open(input_jsonl, "r", encoding="utf-8") as f:
        for line in tqdm(f):
            call = json.loads(line)
            reference = normalize(call.get("ref", ""))
            hypothesis = normalize(transcribe(call["audio_path"], lang="ar", model_size=ASR_MODEL_SIZE)["text"])
            references.append(reference)
            hypotheses.append(hypothesis)
    print("WER:", wer(references, hypotheses))


if __name__ == "__main__":
    main()
