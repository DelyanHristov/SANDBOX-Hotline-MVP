# -*- coding: utf-8 -*-
"""
ASR + diarization helpers.

When heavyweight dependencies are unavailable (offline dev), the helpers raise a
RuntimeError with a clear message so callers can skip the audio path.
"""
import os
from typing import Dict, List

try:
    from faster_whisper import WhisperModel  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    WhisperModel = None  # type: ignore

try:
    from pyannote.audio import Pipeline as DiarPipeline  # type: ignore
    from pyannote.core import SlidingWindowFeature  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    DiarPipeline = None  # type: ignore
    SlidingWindowFeature = None  # type: ignore

import soundfile as sf  # type: ignore
import torch

from dotenv import load_dotenv

load_dotenv()

_HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

_asr_model_cache: Dict[str, "WhisperModel"] = {}  # type: ignore[name-defined]
_diar_pipeline = None


def _get_asr(model_size: str = "medium"):
    if WhisperModel is None:
        raise RuntimeError(
            "faster-whisper is not installed. Install it or skip the audio pipeline."
        )
    key = model_size
    if key not in _asr_model_cache:
        _asr_model_cache[key] = WhisperModel(model_size, device="cpu", compute_type="int8")
    return _asr_model_cache[key]


def _get_diar():
    global _diar_pipeline
    if DiarPipeline is None:
        raise RuntimeError(
            "pyannote.audio is not installed. Install it or skip diarization/audio testing."
        )
    if _diar_pipeline is None:
        if not _HF_TOKEN:
            raise RuntimeError(
                "HUGGINGFACE_TOKEN required for pyannote diarization or use mock dataset."
            )
        _diar_pipeline = DiarPipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            token=_HF_TOKEN,
        )
    return _diar_pipeline


def transcribe(audio_path: str, lang: str = "ar", model_size: str = "medium") -> Dict:
    asr = _get_asr(model_size)
    segments, _ = asr.transcribe(audio_path, task="transcribe", language=lang)
    text, segs = [], []
    for seg in segments:
        chunk_text = seg.text.strip()
        segs.append({"start": float(seg.start), "end": float(seg.end), "text": chunk_text})
        if chunk_text:
            text.append(chunk_text)
    return {"text": " ".join(text), "segments": segs}


def diarize(audio_path: str) -> List[Dict]:
    diar = _get_diar()
    audio, sample_rate = sf.read(audio_path)
    if audio.ndim == 1:
        audio = audio[None, ...]
    else:
        audio = audio.T
    waveform = torch.from_numpy(audio).float()
    diarization = diar({"waveform": waveform, "sample_rate": sample_rate})
    annotation = diarization.speaker_diarization

    out: List[Dict] = []
    for segment, _, speaker in annotation.itertracks(yield_label=True):
        out.append(
            {
                "start": float(segment.start),
                "end": float(segment.end),
                "speaker": speaker,
            }
        )

    speakers = sorted({entry["speaker"] for entry in out})
    role_map = {spk: ("caller" if idx == 0 else "agent") for idx, spk in enumerate(speakers)}
    for entry in out:
        entry["speaker_role"] = role_map[entry["speaker"]]
    return out
