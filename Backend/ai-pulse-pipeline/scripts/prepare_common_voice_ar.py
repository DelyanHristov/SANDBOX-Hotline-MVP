# -*- coding: utf-8 -*-
import os
import json
from pathlib import Path
from typing import Optional, Iterable

from tqdm import tqdm
import soundfile as sf
from datasets import load_dataset, get_dataset_config_names, Audio
from huggingface_hub.errors import GatedRepoError
from dotenv import load_dotenv

def _iter_causes(exc: BaseException) -> Iterable[BaseException]:
    seen = set()
    cur: Optional[BaseException] = exc
    while cur and cur not in seen:
        seen.add(cur)
        yield cur
        cur = getattr(cur, "__cause__", None)


def _message_chain_has(exc: BaseException, needles: Iterable[str]) -> bool:
    lowered = [needle.lower() for needle in needles]
    for item in _iter_causes(exc):
        text = str(item).lower()
        if any(needle in text for needle in lowered):
            return True
    return False


def _resolve_config(subset: Optional[str]) -> str:
    """
    Common Voice 17 exposes a builder config per language (e.g. 'ar'). The string
    'default' remains valid if you want every language.
    """
    if not subset:
        return "ar"
    subset = subset.strip()
    if subset.lower() in {"default", "all"}:
        return "default"
    return subset


def _load_split(split: str, subset: Optional[str], token: Optional[str]):
    config_name = _resolve_config(subset)
    try:
        return load_dataset(
            "mozilla-foundation/common_voice_17_0",
            config_name,
            split=split,
            token=token,
            trust_remote_code=True,
        )
    except ValueError as err:
        if _message_chain_has(err, ["trust_remote_code"]):
            raise RuntimeError(
                "Common Voice now ships with custom loading code. Rerun with transformers>=2.20 and "
                "ensure the script passes trust_remote_code=True (already enabled in this helper). "
                "If you are calling load_dataset manually, set trust_remote_code=True."
            ) from err
        # Legacy message when an older subset hint is provided.
        configs = []
        try:
            configs = get_dataset_config_names(
                "mozilla-foundation/common_voice_17_0", use_auth_token=token
            )
        except Exception:
            pass
        cfg_hint = (
            f" Available configs: {', '.join(configs)}." if configs else " Available config: default."
        )
        raise RuntimeError(
            "Common Voice builder config mismatch. The dataset now exposes a single "
            "'default' config; provide a language code via COMMON_VOICE_SUBSET or --subset."
            + cfg_hint
        ) from err
    except GatedRepoError as err:
        raise RuntimeError(
            "Access to mozilla-foundation/common_voice_17_0 is gated. Ensure your Hugging Face "
            "token has 'Access to public gated repositories' enabled and you accepted the "
            "Common Voice terms at https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0."
        ) from err
    except FileNotFoundError as err:
        if _message_chain_has(err, ["403", "access to public gated repositories"]):
            raise RuntimeError(
                "Common Voice download returned 403 Forbidden. Most often this means the token "
                "lacks gated-dataset permission. Update the token scopes or visit the dataset "
                "page to enable access."
            ) from err
        raise RuntimeError(
            f"Language config '{config_name}' not found in Common Voice 17. "
            "Double-check the language code (e.g. 'ar')."
        ) from err
    except Exception as err:
        msg = str(err)
        if "403" in msg:
            raise RuntimeError(
                "Common Voice download returned 403 Forbidden. Most often this means the token "
                "lacks gated-dataset permission. Update the token scopes or visit the dataset "
                "page to enable access."
            ) from err
        raise RuntimeError(f"Common Voice download failed: {err}") from err


def main(n=12, split="test", subset="ar"):
    load_dotenv()
    token = os.getenv("HUGGINGFACE_TOKEN") or os.getenv("HUGGINGFACE_HUB_TOKEN")
    if not token:
        raise RuntimeError("No HF token found. Set HUGGINGFACE_HUB_TOKEN or HUGGINGFACE_TOKEN in your env or .env file.")

    subset = os.getenv("COMMON_VOICE_SUBSET", subset)

    dataset = _load_split(split, subset, token)
    dataset = dataset.cast_column("audio", Audio(decode=False))

    wav_dir = Path("data/cv_ar_wav")
    wav_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = Path("data/audio_calls.jsonl")
    manifest = manifest_path.open("w", encoding="utf-8")

    count = 0
    for example in tqdm(dataset, desc=f"Exporting {split} (ar)"):
        audio = example["audio"]
        source_path = audio.get("path") if isinstance(audio, dict) else None
        if not source_path:
            continue
        samples, sample_rate = sf.read(source_path)
        sentence = example.get("sentence") or ""

        call_id = f"CVAR_{split}_{count:04d}"
        wav_path = wav_dir / f"{call_id}.wav"
        sf.write(str(wav_path), samples, sample_rate)

        manifest.write(json.dumps({
            "call_id": call_id,
            "audio_path": str(wav_path),
            "ref": sentence,
        }, ensure_ascii=False) + "\n")

        count += 1
        if count >= n:
            break

    manifest.close()
    print(f"Wrote {count} items to {manifest_path}")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Download a small Common Voice Arabic split for audio pipeline tests.")
    parser.add_argument("--n", type=int, default=12, help="Number of items to export.")
    parser.add_argument("--split", default="test", help="Common Voice split to read (e.g. test, train).")
    parser.add_argument(
        "--subset",
        default="ar",
        help="Language code (builder config) to load. Use 'default' to download all languages.",
    )
    cli_args = parser.parse_args()
    main(n=cli_args.n, split=cli_args.split, subset=cli_args.subset)
