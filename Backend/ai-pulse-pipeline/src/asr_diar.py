"""Speech-to-text and speaker diarization helpers.

The heavy dependencies (faster-whisper, pyannote) are optional. When they are
missing we raise a clear RuntimeError so callers can skip the audio path during
offline/text-only runs.
"""
import os
from typing import Dict, List

try:
    from faster_whisper import WhisperModel
except ImportError:
    WhisperModel = None

try:
    from pyannote.audio import Pipeline as DiarizationPipeline
except ImportError:
    DiarizationPipeline = None

import soundfile as sf
import torch
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

_asr_models: Dict[str, "WhisperModel"] = {}
_diarizer = None


def load_asr_model(model_size: str = "medium"):
    if WhisperModel is None:
        raise RuntimeError("faster-whisper is not installed. Install it or skip the audio pipeline.")
    if model_size not in _asr_models:
        _asr_models[model_size] = WhisperModel(model_size, device="cpu", compute_type="int8")
    return _asr_models[model_size]


def load_diarizer():
    global _diarizer
    if DiarizationPipeline is None:
        raise RuntimeError("pyannote.audio is not installed. Install it or skip diarization.")
    if _diarizer is None:
        if not HF_TOKEN:
            raise RuntimeError("HUGGINGFACE_TOKEN required for pyannote diarization.")
        _diarizer = DiarizationPipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            token=HF_TOKEN,
        )
    return _diarizer


def transcribe(audio_path: str, lang: str = "ar", model_size: str = "medium") -> Dict:
    model = load_asr_model(model_size)
    segments, _ = model.transcribe(audio_path, task="transcribe", language=lang)
    texts, results = [], []
    for segment in segments:
        text = segment.text.strip()
        results.append({"start": float(segment.start), "end": float(segment.end), "text": text})
        if text:
            texts.append(text)
    return {"text": " ".join(texts), "segments": results}


def diarize(audio_path: str) -> List[Dict]:
    diarizer = load_diarizer()
    audio, sample_rate = sf.read(audio_path)
    if audio.ndim == 1:
        audio = audio[None, ...]
    else:
        audio = audio.T
    waveform = torch.from_numpy(audio).float()
    diarization = diarizer({"waveform": waveform, "sample_rate": sample_rate})
    annotation = diarization.speaker_diarization

    turns: List[Dict] = []
    for segment, _, speaker in annotation.itertracks(yield_label=True):
        turns.append({"start": float(segment.start), "end": float(segment.end), "speaker": speaker})

    # First speaker heard is assumed to be the caller, the rest are agents.
    speakers = sorted({turn["speaker"] for turn in turns})
    roles = {speaker: ("caller" if idx == 0 else "agent") for idx, speaker in enumerate(speakers)}
    for turn in turns:
        turn["speaker_role"] = roles[turn["speaker"]]
    return turns
