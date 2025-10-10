# -*- coding: utf-8 -*-
import json
from collections import Counter
from tqdm import tqdm
from pipeline import process_text_call

def main(input_jsonl="data/text_calls.jsonl", sample=10):
    c_topics, c_emotions, c_urg = Counter(), Counter(), Counter()
    i = 0
    with open(input_jsonl, "r", encoding="utf-8") as f:
        for ln in tqdm(f):
            ex = json.loads(ln)
            process_text_call(ex["call_id"], ex["text"])
            i += 1
            if i >= sample: break
    # Read aggregates from artifacts/bundle to summarize
    for ln in open("artifacts/pipeline_bundle.jsonl","r",encoding="utf-8"):
        row = json.loads(ln)
        c_topics[row["topic"]["topic"]] += 1
        c_emotions[row["emotion"]["now"]] += 1
        c_urg[row["urgency"]["urgency"]] += 1
    print("Topics:", c_topics.most_common(5))
    print("Emotions:", c_emotions.most_common(5))
    print("Urgency:", c_urg.most_common(5))

if __name__ == "__main__":
    main()
