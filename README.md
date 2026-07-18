# Pulse — Arabic Support-Line Analytics

> Built as a hackathon MVP.

Pulse turns Arabic helpline conversations (audio calls or chat/SMS) into an
operations dashboard. Recordings and messages flow through an AI pipeline that
transcribes, redacts personal data, and classifies each interaction by topic,
emotion, and urgency. A FastAPI service serves the results to a React dashboard
where a team can watch volume, spikes, and P1 cases in near real time.

Everything is privacy-first: text is normalized and scrubbed of PII **before**
any classification output is written to disk, so raw identifiers never leave the
pipeline.

## Repository layout

```
.
├── MVP_Frontend/            React + TypeScript dashboard (Vite, Tailwind, Zustand)
└── Backend/
    ├── api/                 FastAPI service — GET /api/dashboard
    └── ai-pulse-pipeline/   The AI pipeline (ASR, redaction, classification)
        ├── src/             Pipeline stages
        ├── scripts/         Dataset prep + quick evaluation
        └── artifacts/       Generated JSONL output (git-ignored)
```

## How the pipeline works

Each call runs through these stages (see `Backend/ai-pulse-pipeline/src/`):

1. **Transcribe & diarize** (`asr_diar.py`) — faster-whisper for speech-to-text,
   pyannote for speaker turns. Chat/SMS skips this step.
2. **Align** (`align.py`) — attach a speaker to each transcript segment.
3. **Normalize** (`normalize.py`) — clean up Arabic diacritics and letter variants.
4. **Redact PII** (`pii.py`) — strip phone numbers, emails, URLs, and IDs.
5. **Classify** (`classify.py`) — dialect, topic/intent, emotion + trend, and an
   urgency level (P1/P2/P3).
6. **Summarize** (`summarize.py`) — a short, non-clinical Arabic summary.

Results are written to `artifacts/pipeline_bundle.jsonl` (one row per call), which
the API adapts into the dashboard payload.

Classification and summarization run on Hugging Face models by default, or on
OpenAI when `USE_OPENAI_FOR_CLASSIFY` / `USE_OPENAI_FOR_SUMMARY` are enabled in
`src/config.py`. If a model or network is unavailable, keyword-based fallbacks
keep the pipeline running end to end.

## Quick start

### 1. Backend pipeline

```bash
cd Backend/ai-pulse-pipeline
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.sample .env            # set HUGGINGFACE_TOKEN, optionally OPENAI_API_KEY

# Prepare sample data
python scripts/prepare_xlsum_ar.py            # Arabic text -> data/text_calls.jsonl
python scripts/prepare_common_voice_ar.py     # Arabic audio -> data/audio_calls.jsonl

# Run the pipeline
python -m src.run_pipeline --clear --text_jsonl data/text_calls.jsonl
python -m src.run_pipeline --audio_jsonl data/audio_calls.jsonl
```

### 2. API

```bash
cd Backend
uvicorn api.main:app --reload --port 8000
# GET http://127.0.0.1:8000/api/dashboard
```

### 3. Frontend

```bash
cd MVP_Frontend
npm install
echo 'VITE_API_BASE_URL=http://127.0.0.1:8000' > .env.local   # optional, this is the default
npm run dev
```

## Environment variables

| Variable            | Where            | Purpose                                        |
| ------------------- | ---------------- | ---------------------------------------------- |
| `HUGGINGFACE_TOKEN` | Backend `.env`   | Download the pyannote diarization model        |
| `OPENAI_API_KEY`    | Backend `.env`   | Optional — OpenAI summaries/classification      |
| `OPENAI_MODEL`      | Backend `.env`   | Optional — defaults to `gpt-4o-mini`           |
| `VITE_API_BASE_URL` | Frontend `.env`  | API base URL (defaults to `http://127.0.0.1:8000`) |

## Datasets

Sample data is downloaded on demand, not committed:

- **Audio** — Mozilla Common Voice (Arabic), a small `test` split.
- **Text** — XLSum (Arabic), with a curated mock set as an offline fallback.
