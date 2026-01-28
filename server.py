#!/usr/bin/env python3
"""
정적 파일 + 주가 API 서버.
Yahoo Finance(yfinance)로 종목 히스토리를 가져와 /api/stock/<ticker> 로 JSON 제공.

사용:
  pip install flask yfinance
  python server.py

브라우저: http://localhost:8000
"""

import os
from datetime import datetime, timedelta

from flask import Flask, send_from_directory, request, jsonify

try:
    import yfinance as yf
except ImportError:
    yf = None

app = Flask(__name__, static_folder=".", static_url_path="")
ROOT = os.path.dirname(os.path.abspath(__file__))


def _stock_response(ticker, from_, to_):
    if not yf:
        return jsonify({"error": "yfinance not installed", "data": []}), 500
    from_ = from_ or (datetime.utcnow() - timedelta(days=365 * 2)).strftime("%Y-%m-%d")
    to_ = to_ or datetime.utcnow().strftime("%Y-%m-%d")
    try:
        start_dt = datetime.strptime(from_, "%Y-%m-%d")
        end_dt = datetime.strptime(to_, "%Y-%m-%d") + timedelta(days=1)
    except ValueError:
        return jsonify({"error": "invalid from/to (use YYYY-MM-DD)", "data": []}), 400
    sym = str(ticker).upper()
    df = yf.download(sym, start=start_dt.strftime("%Y-%m-%d"), end=end_dt.strftime("%Y-%m-%d"),
                     progress=False, auto_adjust=False, actions=False, threads=True)
    if df is None or df.empty:
        return jsonify({"ticker": sym, "data": []}), 200
    if hasattr(df.columns, "levels") and len(getattr(df.columns, "levels", [])) > 1:
        close_series = df[("Close", sym)] if ("Close", sym) in df.columns else (df["Close"].iloc[:, 0] if df["Close"].ndim > 1 else df["Close"])
    else:
        close_series = df["Close"]
    close_series = close_series.dropna()
    out = [{"date": idx.strftime("%Y-%m-%d"), "close": round(float(v), 2)} for idx, v in close_series.items()]
    return jsonify({"ticker": sym, "data": out})


@app.route("/api/stock")
def stock_query():
    """쿼리: ?ticker=AAPL&from=...&to=... (Vercel 서버리스와 동일 형식)."""
    ticker = request.args.get("ticker") or ""
    resp, code = _stock_response(ticker, request.args.get("from"), request.args.get("to"))
    return resp, code


@app.route("/api/stock/<ticker>")
def stock_history(ticker):
    """경로 형식: /api/stock/AAPL?from=...&to=..."""
    resp, code = _stock_response(ticker, request.args.get("from"), request.args.get("to"))
    return resp, code


@app.route("/")
def index():
    return send_from_directory(ROOT, "index.html")


@app.route("/<path:path>")
def static_or_index(path):
    if path.startswith("api/"):
        return jsonify({"error": "not found"}), 404
    full = os.path.normpath(os.path.join(ROOT, path))
    if not full.startswith(ROOT):
        return send_from_directory(ROOT, "index.html")
    if os.path.isfile(full):
        return send_from_directory(ROOT, path)
    return send_from_directory(ROOT, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"서버: http://localhost:{port} (주가 API: /api/stock/<ticker>?from=...&to=...)")
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
