# MVP Frontend

React + TypeScript dashboard that now consumes live data produced by the AI pipeline backend. The mock dataset has been removed; the UI hydrates itself from the FastAPI endpoint that reads `artifacts/pipeline_bundle.jsonl`.

## Prerequisites

- Node.js 18+ for the frontend.
- Python 3.11+ with the backend dependencies installed (`pip install -r Backend/ai-pulse-pipeline/requirements.txt`).
- Generated pipeline outputs in `Backend/artifacts/pipeline_bundle.jsonl` (run `python -m src.run_pipeline` inside `Backend/ai-pulse-pipeline`).

## Backend API

From the repository root:

```bash
uvicorn Backend.api.main:app --reload --port 8000
```

The FastAPI app exposes `GET /api/dashboard` returning:

- `interactions`: redacted interactions adapted to the frontend contract.
- `alerts` and `alertSeries`: spike alerts + sparkline data derived from recent timestamps.
- `heatmap`: region/topic matrix.
- `reports`: leadership summary bullets and topic volume trends.
- `updatedAt`: ISO timestamp of the latest interaction.

## Frontend

1. Configure the API base URL (optional when using the default `http://127.0.0.1:8000`):

   ```bash
   echo 'VITE_API_BASE_URL=http://127.0.0.1:8000' > .env.local
   ```

2. Install dependencies and run:

   ```bash
   npm install
   npm run dev
   ```

3. Run tests:

   ```bash
   npm run test
   ```

The UI displays loading and retry states while fetching, and all analytics (heatmap, alerts, reports) are computed from the backend payload.
