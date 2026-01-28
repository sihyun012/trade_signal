#!/usr/bin/env python3
"""
S&P 500 (^GSPC) 일별 종가를 yfinance로 받아서 정적 JSON 파일로 저장.
출력 예:
[
  {"date": "2016-01-04", "close": 2012.66},
  ...
]

사용:
  python tools/build_sp500_close_json.py --start 2016-01-01 --out data/sp500_close.json
"""

import argparse
import json
import os
from datetime import datetime, timedelta

import yfinance as yf


def fetch_sp500_close(start: str, end: str | None):
    # yfinance는 end가 "exclusive"처럼 동작하는 경우가 있어 하루 버퍼를 줌
    start_dt = datetime.strptime(start, "%Y-%m-%d")
    if end:
        end_dt = datetime.strptime(end, "%Y-%m-%d")
    else:
        end_dt = datetime.utcnow()

    end_dt_plus = end_dt + timedelta(days=1)

    df = yf.download(
        "^GSPC",
        start=start_dt.strftime("%Y-%m-%d"),
        end=end_dt_plus.strftime("%Y-%m-%d"),
        progress=False,
        auto_adjust=False,
        actions=False,
        threads=True,
    )

    if df is None or df.empty:
        raise RuntimeError("yfinance에서 ^GSPC 데이터를 못 가져왔습니다. 네트워크/차단/티커 확인 필요.")

    # 컬럼이 MultiIndex로 오는 경우 방어
    if hasattr(df.columns, "levels") and len(getattr(df.columns, "levels", [])) > 1:
        # 예: ('Close', '^GSPC') 형태일 수 있음 → Close만 뽑기
        if ("Close", "^GSPC") in df.columns:
            close_series = df[("Close", "^GSPC")]
        else:
            close_series = df["Close"]
    else:
        close_series = df["Close"]

    close_series = close_series.dropna()

    out = []
    for idx, val in close_series.items():
        # idx가 Timestamp일 수 있음
        date_str = idx.strftime("%Y-%m-%d")
        out.append({"date": date_str, "close": round(float(val), 2)})

    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", default="2016-01-01", help="YYYY-MM-DD")
    ap.add_argument("--end", default=None, help="YYYY-MM-DD (기본: 오늘)")
    ap.add_argument("--out", default="data/sp500_close.json", help="출력 경로")
    args = ap.parse_args()

    data = fetch_sp500_close(args.start, args.end)

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"OK: {args.out} ({len(data)} rows) 생성 완료")


if __name__ == "__main__":
    main()
