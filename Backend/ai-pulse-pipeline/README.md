# NCMH Pulse – AI Pipeline MVP (file-based)

Implements Steps **1–4e** of your architecture:
ASR → Diarization → Normalize → PII → Dialect → Topic → Emotion → Urgency → Summary.  
Outputs JSONL files in `artifacts/` conforming to your schemas. No DB, no frontend.  [oai_citation:1‡NCMH_Pulse_CheatSheet_and_Schemas[30].docx](sediment://file_000000002cd061f7b40d1cddd6fbf015)

## 0) Setup
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.sample .env   # or create .env and set HUGGINGFACE_TOKEN and (optionally) OPENAI_API_KEY

1) Get non-synthetic data

# Audio (Common Voice ar) – creates data/audio_calls.jsonl
python scripts/prepare_common_voice_ar.py

# Text (XL-Sum ar) – creates data/text_calls.jsonl
python scripts/prepare_xlsum_ar.py

2) Run the pipeline

# Audio path (ASR+diar+full pipeline)
python -m src.run_pipeline --clear --audio_jsonl data/audio_calls.jsonl

# Text path (chat-like)
python -m src.run_pipeline --clear --text_jsonl data/text_calls.jsonl

3) (Optional) Evaluate

# WER on audio sample
python scripts/quick_eval_asr.py

# Text sanity checks (distribution only)
python scripts/quick_eval_text.py
```

Outputs (JSONL)
	•	artifacts/asr_chunks.jsonl          # ASR Output (chunk): call_id, t0, t1, speaker, text
	•	artifacts/redacted_interactions.jsonl# Redacted Interaction (turns[], redaction_log[])
	•	artifacts/topic_intent.jsonl         # Topic/Intent Output
	•	artifacts/emotion_distress.jsonl     # Emotion/Distress Output
	•	artifacts/urgency.jsonl              # Urgency Output
	•	artifacts/pipeline_bundle.jsonl      # One row per call with all fields

Notes
	•	Set USE_OPENAI_FOR_SUMMARY=True (src/config.py) to use OpenAI gpt-4o-mini for summaries.
	•	Set USE_OPENAI_FOR_CLASSIFY=True to classify with OpenAI instead of HF zero-shot.
	•	This MVP avoids storing raw PII by design; the PII scrubber runs before outputs are written.

---

## How this matches your spec

- **Exact stages & schemas** are implemented (1→4e); outputs mirror your shapes so you can plug this into Steps 5–7 later without rewrites.  [oai_citation:2‡NCMH_Pulse_CheatSheet_and_Schemas[30].docx](sediment://file_000000002cd061f7b40d1cddd6fbf015)  
- **Privacy by design**: we **normalize → redact** before any downstream inference outputs are written to disk (only redacted text appears).  
- **API keys supported**:  
  - **Hugging Face** token for diarization downloads,  
  - **OpenAI** key for optional better summaries/classification.  
- **Non‑synthetic datasets** are provided (download scripts included) to test the pipeline end‑to‑end.

---

### Run this now (quick start)

```bash
source .venv/bin/activate
python scripts/prepare_common_voice_ar.py      # audio sample list
python -m src.run_pipeline --clear --audio_jsonl data/audio_calls.jsonl

python scripts/prepare_xlsum_ar.py             # text sample list
python -m src.run_pipeline --clear --text_jsonl data/text_calls.jsonl
```

You’ll find per‑call JSON bundles in artifacts/pipeline_bundle.jsonl that contain:
	•	ASR chunks (with speaker from diarization),
	•	Redacted turns,
	•	Dialect/Topic/Emotion,
	•	Urgency (P1/P2/P3) with reason,
	•	Non‑clinical Arabic summary.

If you want me to add dialect‑specific model routing or a proper evaluation for emotion/topic using SemEval/SANAD labels (micro/macro‑F1), I can extend the code with loaders for those corpora next.
