# Vercel Serverless: /api/stock?ticker=AAPL&from=YYYY-MM-DD&to=YYYY-MM-DD
# 주가 API만 Vercel에서 돌릴 때 사용. requirements.txt 의 yfinance 사용.

import json
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

try:
    import yfinance as yf
except ImportError:
    yf = None


def fetch_stock_history(ticker: str, from_: str, to_: str) -> tuple[dict, int]:
    """(body_dict, status_code) 반환."""
    if not yf:
        return {"error": "yfinance not installed", "data": []}, 500
    if not ticker or not ticker.strip():
        return {"error": "ticker required", "data": []}, 400

    default_end = datetime.utcnow().strftime("%Y-%m-%d")
    default_start = (datetime.utcnow() - timedelta(days=365 * 2)).strftime("%Y-%m-%d")
    from_ = (from_ or "").strip() or default_start
    to_ = (to_ or "").strip() or default_end

    try:
        start_dt = datetime.strptime(from_, "%Y-%m-%d")
        end_dt = datetime.strptime(to_, "%Y-%m-%d") + timedelta(days=1)
    except ValueError:
        return {"error": "invalid from/to (use YYYY-MM-DD)", "data": []}, 400

    sym = str(ticker).upper()
    df = yf.download(
        sym,
        start=start_dt.strftime("%Y-%m-%d"),
        end=end_dt.strftime("%Y-%m-%d"),
        progress=False,
        auto_adjust=False,
        actions=False,
        threads=True,
    )

    if df is None or df.empty:
        return {"ticker": sym, "data": []}, 200

    if hasattr(df.columns, "levels") and len(getattr(df.columns, "levels", [])) > 1:
        if ("Close", sym) in df.columns:
            close_series = df[("Close", sym)]
        else:
            close_series = df["Close"].iloc[:, 0] if df["Close"].ndim > 1 else df["Close"]
    else:
        close_series = df["Close"]

    close_series = close_series.dropna()
    out = [{"date": idx.strftime("%Y-%m-%d"), "close": round(float(v), 2)} for idx, v in close_series.items()]
    return {"ticker": sym, "data": out}, 200


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        ticker = (qs.get("ticker") or [""])[0]
        from_ = (qs.get("from") or [""])[0]
        to_ = (qs.get("to") or [""])[0]

        body, status = fetch_stock_history(ticker, from_, to_)
        raw = json.dumps(body).encode("utf-8")

        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(raw)
