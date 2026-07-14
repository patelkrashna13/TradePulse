# TradeX Backend

Run locally from the backend folder:

PowerShell:
```powershell
./run.ps1
```

Linux/macOS:
```bash
chmod +x run.sh
./run.sh
```

If you already created the virtual environment manually, you can also run:
```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Endpoints:
- GET /health
- GET /api/commodities
