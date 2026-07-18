import json
from collections import Counter

from tqdm import tqdm

from pipeline import process_text_call


def main(input_jsonl="data/text_calls.jsonl", sample=10):
    for index, line in enumerate(tqdm(open(input_jsonl, "r", encoding="utf-8"))):
        if index >= sample:
            break
        call = json.loads(line)
        process_text_call(call["call_id"], call["text"])

    topics, emotions, urgencies = Counter(), Counter(), Counter()
    for line in open("artifacts/pipeline_bundle.jsonl", "r", encoding="utf-8"):
        row = json.loads(line)
        topics[row["topic"]["topic"]] += 1
        emotions[row["emotion"]["now"]] += 1
        urgencies[row["urgency"]["urgency"]] += 1

    print("Topics:", topics.most_common(5))
    print("Emotions:", emotions.most_common(5))
    print("Urgency:", urgencies.most_common(5))


if __name__ == "__main__":
    main()
