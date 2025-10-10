# -*- coding: utf-8 -*-
"""
Prepare a small Arabic text dataset for the pipeline.

Attempts to download XLSum; if that fails (e.g. no network), falls back to a
curated mock set of 5–10 prompts that exercise the pipeline.
"""
import argparse
import json
from pathlib import Path
from typing import Iterable, List, Dict

try:
    from tqdm import tqdm  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    def tqdm(it: Iterable, **_: Dict):  # type: ignore
        return it


MOCK_TEXTS = [
    "يا جماعة أنا تعبانة نفسياً من ضغط الشغل وكل يوم مديرتي تنتقدني رغم إني أحاول.",
    "أخي صار له أسبوع يتكلم عن إنه ما عاد يتحمل، خايفة يكون عنده نية يؤذي نفسه.",
    "تعبت من المصاريف والإيجار ارتفع عليّ ومهددين بالطرد، ما عندي أحد يساعدني.",
    "من يوم وفاة أمي وأنا حاسس بفراغ كبير وببكي كل ليلة وما بعرف كيف أكمل.",
    "في الجامعة بيتنمروا عليّ لأن لهجتي مختلفة، صرت ما أحب أروح المحاضرات.",
    "زوجي صار يعصب بسرعة ومرات يدفعني بقوة، خايفة على أولادي وما بعرف لمين أروح.",
    "حسيت بألم قوي بالصدر والدكتور قال لازم أراجع طوارئ وأنا خايف وما معي أحد.",
    "أنا محتار إذا أكمل العلاج النفسي ولا أوقف لأنه مكلف بس حسيت بتحسن بسيط.",
    "صاحبي يشرب كثير كل ليلة وبعدها يسوق السيارة، خايف عليه يصير حادث.",
    "أواجه توتر قبل الاختبارات وما أنام كويس وأفكر أترك التخصص.",
]


def _write_rows(rows: Iterable[Dict[str, str]], out_path: Path) -> int:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with out_path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
            count += 1
    return count


def _download_xlsum(n: int, split: str) -> List[Dict[str, str]]:
    from datasets import load_dataset  # local import to allow fallback

    ds = load_dataset("csebuetnlp/xlsum", "arabic", split=split)
    rows: List[Dict[str, str]] = []
    for idx, example in enumerate(tqdm(ds, desc=f"XLSum {split}")):
        rows.append({"call_id": f"XLSUM_{split}_{idx:04d}", "text": example["text"]})
        if idx + 1 >= n:
            break
    return rows


def _mock_rows(n: int) -> List[Dict[str, str]]:
    # Cycle through predefined prompts until the requested count is met.
    rows: List[Dict[str, str]] = []
    pool = MOCK_TEXTS or ["نص قصير للاختبار."]
    for idx in range(n):
        text = pool[idx % len(pool)]
        rows.append({"call_id": f"MOCK_{idx:04d}", "text": text})
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=20, help="Number of items to export.")
    parser.add_argument("--split", default="test", help="XLSum split to read from.")
    parser.add_argument("--mock", action="store_true", help="Force using the mock dataset.")
    args = parser.parse_args()

    out_path = Path("data/text_calls.jsonl")
    rows: List[Dict[str, str]]

    try:
        if args.mock:
            raise RuntimeError("Mock dataset requested explicitly.")
        rows = _download_xlsum(args.n, args.split)
        source = f"XLSum ({len(rows)} items)"
    except Exception as err:  # network/offline fallback
        rows = _mock_rows(min(args.n, len(MOCK_TEXTS)))
        source = f"mock fallback ({len(rows)} items) – reason: {err}"

    count = _write_rows(rows, out_path)
    print(f"Wrote {count} items to {out_path} from {source}.")


if __name__ == "__main__":
    main()
