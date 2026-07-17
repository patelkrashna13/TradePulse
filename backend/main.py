from fastapi import FastAPI
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
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(ALPHA_VANTAGE_URL)
        response.raise_for_status()
        payload = response.json()

    chart_data = {"label": "Monthly", "labels": [], "values": []}
    
    if "data" in payload:
        commodities = payload["data"]
        if isinstance(commodities, dict):
            labels = []
            values = []
            for key, value in commodities.items():
                labels.append(key)
                if isinstance(value, dict) and "value" in value:
                    try:
                        values.append(float(value["value"]))
                    except:
                        values.append(0)
                elif isinstance(value, (int, float)):
                    values.append(float(value))
                else:
                    values.append(0)
            chart_data["labels"] = labels[:12]
            chart_data["values"] = values[:12]

    users_data = []
    brokers = [
        {"name": "Zerodha (DU000004)", "positions": "1", "available": "₹ 1.54 Cr", "deployed": "3", "active": "1", "status": "Active"},
        {"name": "Angel One (MNBN1026)", "positions": "2", "available": "₹ 2.50 K", "deployed": "2", "active": "2", "status": "Active"},
        {"name": "Finvasia (FA189009)", "positions": "0", "available": "₹ 50.02 K", "deployed": "0", "active": "0", "status": "Pending"},
    ]
    
    for idx, broker in enumerate(brokers):
        value = "₹ 0.00"
        if len(chart_data["values"]) > idx:
            num_value = chart_data["values"][idx]
            value = f"₹ {num_value:.2f} K"
        
        users_data.append({
            "broker": broker["name"],
            "positions": broker["positions"],
            "available": broker["available"],
            "deployed": broker["deployed"],
            "active": broker["active"],
            "status": broker["status"],
            "pnl": value
        })
    
    analytics = None
    if chart_data["values"]:
        values = chart_data["values"]
        last_value = values[-1] if values else 0
        prev_value = values[-2] if len(values) > 1 else last_value
        pct_change = ((last_value - prev_value) / prev_value) if prev_value != 0 else 0
        analytics = {
            "last": f"₹ {last_value:.2f} K",
            "pct_change": pct_change
        }

    return {
        "data": chart_data,
        "users": users_data,
        "analytics": analytics
    }
