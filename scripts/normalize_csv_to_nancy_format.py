#!/usr/bin/env python3
"""
Kevin Hern 등 다른 소스 CSV를 Nancy Pelosi 형식에 맞춤.
- 컬럼 순서: year, filing_id, filing_date, owner, asset, ticker, type, transaction_date, notification_date, amount_range, price_trade_date, price_filing_date, pdf_url
- 구분자: 탭
- type: purchase->Buy, sale->Sell, exchange->Exchange
- filing_id: pdf_url에서 추출 (없으면 빈 문자열)
- notification_date: 원본에 없으면 transaction_date 사용
"""
import csv
import re
import sys
from pathlib import Path

def extract_filing_id(pdf_url: str) -> str:
    if not pdf_url:
        return ""
    m = re.search(r"/(\d+)\.pdf", pdf_url)
    return m.group(1) if m else ""

def norm_type(t: str) -> str:
    t = (t or "").strip().lower()
    if t == "purchase" or t == "buy":
        return "Buy"
    if t == "sale" or t == "sell":
        return "Sell"
    if t == "exchange":
        return "Exchange"
    return t if t else ""

def run(input_path: str, output_path: str) -> None:
    input_path = Path(input_path)
    output_path = Path(output_path)
    if not input_path.exists():
        print(f"입력 파일 없음: {input_path}")
        sys.exit(1)

    nancy_headers = [
        "year", "filing_id", "filing_date", "owner", "asset", "ticker", "type",
        "transaction_date", "notification_date", "amount_range",
        "price_trade_date", "price_filing_date", "pdf_url"
    ]

    rows_out = []
    with open(input_path, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        in_headers = reader.fieldnames or []
        for row in reader:
            pdf_url = (row.get("pdf_url") or row.get("URL") or "").strip()
            filing_id = extract_filing_id(pdf_url)
            transaction_date = (row.get("transaction_date") or "").strip()
            notification_date = (row.get("notification_date") or transaction_date or "").strip()
            raw_type = (row.get("type") or "").strip()
            amount_range = (row.get("amount_range") or "").strip()

            out = {
                "year": (row.get("year") or "").strip(),
                "filing_id": filing_id,
                "filing_date": (row.get("filing_date") or "").strip(),
                "owner": (row.get("owner") or "").strip(),
                "asset": (row.get("asset") or "").strip(),
                "ticker": (row.get("ticker") or "").strip(),
                "type": norm_type(raw_type),
                "transaction_date": transaction_date,
                "notification_date": notification_date,
                "amount_range": amount_range,
                "price_trade_date": (row.get("price_trade_date") or "").strip(),
                "price_filing_date": (row.get("price_filing_date") or "").strip(),
                "pdf_url": pdf_url,
            }
            rows_out.append(out)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=nancy_headers, delimiter="\t", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"OK: {output_path} ({len(rows_out)} rows)")

if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent
    input_file = base / "kevin_hern_trades.csv"
    output_file = base / "kevin_hern_all_transaction.csv"
    if len(sys.argv) >= 3:
        input_file = Path(sys.argv[1])
        output_file = Path(sys.argv[2])
    elif len(sys.argv) == 2:
        input_file = Path(sys.argv[1])
        output_file = input_file.parent / (input_file.stem + "_all_transaction.csv")
    run(str(input_file), str(output_file))
