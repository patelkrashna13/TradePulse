from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import Any

app = FastAPI(title="TradeX API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query?function=ALL_COMMODITIES&interval=monthly&apikey=demo"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/commodities")
async def get_commodities() -> dict[str, Any]:
    params = {
        "function": "ALL_COMMODITIES",
        "interval": "monthly",
        "apikey": "demo",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(ALPHA_VANTAGE_URL, params=params)
        response.raise_for_status()
        payload = response.json()

    if "data" in payload:
        return {"data": payload["data"]}

    if "error" in payload:
        raise HTTPException(status_code=502, detail=payload["error"])

    return {"data": payload}
