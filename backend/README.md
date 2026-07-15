# TradeX Backend

Run locally from the backend folder:

```powershell
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Endpoints:
- GET /health
- GET /api/commodities
