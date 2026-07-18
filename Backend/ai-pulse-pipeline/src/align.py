from typing import Dict, List


def overlap(start_a, end_a, start_b, end_b) -> float:
    return max(0.0, min(end_a, end_b) - max(start_a, start_b))


def align_segments(asr_segments: List[Dict], diar_segments: List[Dict]) -> List[Dict]:
    """Assign a speaker to each ASR segment by overlap with the diarization output.

    Returns a list of chunks shaped as {t0, t1, speaker, text}.
    """
    chunks = []
    for segment in asr_segments:
        start, end = segment["start"], segment["end"]
        best_speaker, best_overlap = "unknown", 0.0
        for turn in diar_segments:
            current = overlap(start, end, turn["start"], turn["end"])
            if current > best_overlap:
                best_overlap = current
                best_speaker = turn.get("speaker_role", "unknown")
        chunks.append({"t0": start, "t1": end, "speaker": best_speaker, "text": segment["text"]})
    return chunks
