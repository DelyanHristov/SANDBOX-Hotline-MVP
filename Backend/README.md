# Verdiola

Pipeline that ingests audio or text conversations, performs diarisation, PII scrubbing, topic/emotion/urgency classification and summarisation, and writes the results to `artifacts/*.jsonl`.

## API bridge

To drive the React dashboard directly from the pipeline outputs, a lightweight FastAPI service is available at `Backend/api/main.py`.

```bash
# Inside Backend/
pip install -r ai-pulse-pipeline/requirements.txt
uvicorn api.main:app --reload --port 8000
```

The `GET /api/dashboard` endpoint reads `artifacts/pipeline_bundle.jsonl`, adapts it to the frontend schema (adding metadata such as timestamps, regions, agents), and returns the analytics bundle (interactions, alerts, heatmap, leadership summary, volume trends).
