import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import numpy as np
import os

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'  # Windows
plt.rcParams['axes.unicode_minus'] = False

def parse_amount_range(amount_range):
    """금액 범위를 숫자로 변환 (중간값 사용)"""
    if pd.isna(amount_range):
        return 5000  # 기본값
    
    # 범위 파싱
    amount_range = str(amount_range).replace('$', '').replace(',', '').strip()
    
    if '-' in amount_range:
        parts = amount_range.split('-')
        if len(parts) == 2:
            try:
                min_val = float(parts[0].strip())
                max_val = float(parts[1].strip())
                return (min_val + max_val) / 2
            except:
                pass
    
    # 단일 값인 경우
    try:
        return float(amount_range)
    except:
        return 5000  # 기본값

def get_sp500_data(start_date, end_date):
    """S&P 500 데이터 가져오기"""
    try:
        sp500 = yf.download('^GSPC', start=start_date, end=end_date, progress=False)
        if sp500.empty:
            # 대체로 SPY 사용
            sp500 = yf.download('SPY', start=start_date, end=end_date, progress=False)
        return sp500['Close']
    except Exception as e:
        print(f"S&P 500 데이터 가져오기 오류: {e}")
        return None

def simulate_portfolio(transactions, initial_cash=10000):
    """의원 포트폴리오 시뮬레이션"""
    portfolio = {}  # {ticker: shares}
    cash = initial_cash
    portfolio_value_history = []
    
    # 거래 날짜별로 정렬
    transactions = transactions.sort_values('transaction_date')
    
    for idx, row in transactions.iterrows():
        date = pd.to_datetime(row['transaction_date'])
        ticker = row['ticker']
        transaction_type = row['type']
        price = row['price_trade_date']
        amount = parse_amount_range(row['amount_range'])
        
        if pd.isna(price) or price <= 0:
            continue
        
        if transaction_type == 'Buy':
            shares = amount / price
            if cash >= amount:
                cash -= amount
                if ticker in portfolio:
                    portfolio[ticker] += shares
                else:
                    portfolio[ticker] = shares
        
        elif transaction_type == 'Sell':
            if ticker in portfolio and portfolio[ticker] > 0:
                shares_to_sell = min(portfolio[ticker], amount / price)
                portfolio[ticker] -= shares_to_sell
                cash += shares_to_sell * price
                if portfolio[ticker] <= 0:
                    del portfolio[ticker]
        
        # 현재 포트폴리오 가치 계산
        current_value = cash
        for tick, shares in portfolio.items():
            try:
                stock = yf.Ticker(tick)
                # 거래 날짜 전후로 조회 시도
                hist = stock.history(start=date - pd.Timedelta(days=5), end=date + pd.Timedelta(days=5), period='10d')
                if not hist.empty:
                    current_price = float(hist['Close'].iloc[-1])
                    current_value += shares * current_price
                else:
                    # 가격을 가져올 수 없으면 거래 가격 사용
                    current_value += shares * float(price)
            except Exception as e:
                # 오류 발생 시 거래 가격 사용
                try:
                    current_value += shares * float(price)
                except:
                    pass
        
        portfolio_value_history.append({
            'date': date,
            'value': current_value,
            'cash': cash,
            'holdings': portfolio.copy()
        })
    
    return portfolio_value_history

def get_current_portfolio_value(portfolio_history, end_date):
    """최종 포트폴리오 가치 계산"""
    if not portfolio_history:
        return 10000
    
    last_entry = portfolio_history[-1]
    cash = float(last_entry['cash'])
    holdings = last_entry['holdings']
    
    current_value = cash
    for ticker, shares in holdings.items():
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(start=end_date - pd.Timedelta(days=10), end=end_date, period='10d')
            if not hist.empty:
                current_price = float(hist['Close'].iloc[-1])
                current_value += float(shares) * current_price
            else:
                # 최근 거래 가격 사용 시도
                # 마지막 거래에서 이 티커의 가격 찾기
                pass
        except Exception as e:
            # 오류 발생 시 해당 주식은 제외
            pass
    
    return float(current_value)

def main():
    # 스크립트 파일 위치 기준으로 작업 디렉토리 설정
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # CSV 파일 읽기
    print("CSV 파일 읽는 중...")
    csv_path = os.path.join(script_dir, 'byron_donalds_all_transaction.csv')
    df = pd.read_csv(csv_path)
    
    # 날짜 변환
    df['transaction_date'] = pd.to_datetime(df['transaction_date'], format='%m/%d/%Y', errors='coerce')
    df = df.dropna(subset=['transaction_date'])
    
    # 시작일과 종료일
    start_date = df['transaction_date'].min()
    end_date = df['transaction_date'].max() + pd.Timedelta(days=30)  # 마지막 거래 후 30일
    
    print(f"거래 기간: {start_date.date()} ~ {end_date.date()}")
    
    # 의원 포트폴리오 시뮬레이션
    print("의원 포트폴리오 시뮬레이션 중...")
    portfolio_history = simulate_portfolio(df, initial_cash=10000)
    
    # 최종 포트폴리오 가치 계산
    final_value = get_current_portfolio_value(portfolio_history, end_date)
    
    # S&P 500 데이터 가져오기
    print("S&P 500 데이터 가져오는 중...")
    sp500_prices = get_sp500_data(start_date - pd.Timedelta(days=30), end_date)
    
    if sp500_prices is None or sp500_prices.empty:
        print("S&P 500 데이터를 가져올 수 없습니다.")
        return
    
    # S&P 500 초기 가격
    first_price = sp500_prices.iloc[0]
    if isinstance(first_price, pd.Series):
        initial_sp500_price = float(first_price.values[0])
    else:
        initial_sp500_price = float(first_price)
    
    # S&P 500 포트폴리오 가치 계산 (일별)
    sp500_shares = 10000.0 / initial_sp500_price
    sp500_values = []
    sp500_dates = []
    
    # 의원 포트폴리오 가치를 일별로 보간
    portfolio_dates = [entry['date'] for entry in portfolio_history]
    portfolio_values = [entry['value'] for entry in portfolio_history]
    
    # 모든 날짜에 대해 포트폴리오 가치 계산
    all_dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    member_values = []
    sp500_daily_values = []
    dates_for_plot = []
    
    for date in all_dates:
        # 의원 포트폴리오 가치
        if date in portfolio_dates:
            idx = portfolio_dates.index(date)
            member_value = portfolio_values[idx]
        else:
            # 가장 가까운 이전 값 사용
            prev_values = [v for d, v in zip(portfolio_dates, portfolio_values) if d <= date]
            if prev_values:
                member_value = prev_values[-1]
            else:
                member_value = 10000
        
        # S&P 500 가치
        try:
            if date in sp500_prices.index:
                sp500_price_val = sp500_prices.loc[date]
                # 값이 Series나 배열인 경우 첫 번째 요소 추출
                if hasattr(sp500_price_val, '__len__') and not isinstance(sp500_price_val, str):
                    if len(sp500_price_val) > 0:
                        sp500_price_val = float(sp500_price_val.iloc[0] if hasattr(sp500_price_val, 'iloc') else sp500_price_val[0])
                    else:
                        sp500_price_val = initial_sp500_price
                else:
                    sp500_price_val = float(sp500_price_val)
                sp500_value = sp500_shares * sp500_price_val
            else:
                # 가장 가까운 이전 가격 사용
                prev_prices = sp500_prices[sp500_prices.index <= date]
                if not prev_prices.empty:
                    sp500_price_val = prev_prices.iloc[-1]
                    if hasattr(sp500_price_val, '__len__') and not isinstance(sp500_price_val, str):
                        if len(sp500_price_val) > 0:
                            sp500_price_val = float(sp500_price_val.iloc[0] if hasattr(sp500_price_val, 'iloc') else sp500_price_val[0])
                        else:
                            sp500_price_val = initial_sp500_price
                    else:
                        sp500_price_val = float(sp500_price_val)
                    sp500_value = sp500_shares * sp500_price_val
                else:
                    sp500_value = 10000.0
        except Exception as e:
            # 오류 발생 시 이전 값 사용
            if sp500_daily_values:
                sp500_value = sp500_daily_values[-1]
            else:
                sp500_value = 10000.0
        
        member_values.append(float(member_value))
        sp500_daily_values.append(float(sp500_value))
        dates_for_plot.append(date)
    
    # 수익률 계산
    initial_value = 10000
    member_return = float((final_value - initial_value) / initial_value * 100)
    final_sp500_value = float(sp500_daily_values[-1])
    sp500_return = float((final_sp500_value - initial_value) / initial_value * 100)
    excess_return = float(member_return - sp500_return)
    
    # 그래프 생성
    fig, ax = plt.subplots(figsize=(14, 8))
    
    ax.plot(dates_for_plot, member_values, label=f'Byron Donalds 포트폴리오 ({member_return:.1f}%)', 
            linewidth=2.5, color='#2E86AB')
    ax.plot(dates_for_plot, sp500_daily_values, label=f'S&P 500 ({sp500_return:.1f}%)', 
            linewidth=2.5, color='#A23B72', linestyle='--')
    
    # 거래 시점 표시
    transaction_dates = df['transaction_date'].unique()
    for trans_date in transaction_dates:
        if trans_date in dates_for_plot:
            idx = dates_for_plot.index(trans_date)
            ax.axvline(x=trans_date, color='gray', alpha=0.3, linestyle=':', linewidth=0.8)
    
    ax.axhline(y=initial_value, color='black', linestyle='-', linewidth=1, alpha=0.3, label='초기 투자 ($10,000)')
    
    ax.set_xlabel('날짜', fontsize=12, fontweight='bold')
    ax.set_ylabel('포트폴리오 가치 ($)', fontsize=12, fontweight='bold')
    ax.set_title(f'Byron Donalds 포트폴리오 vs S&P 500 비교\n초과 수익: {excess_return:+.1f}%', 
                 fontsize=14, fontweight='bold', pad=20)
    
    ax.legend(loc='best', fontsize=11, framealpha=0.9)
    ax.grid(True, alpha=0.3, linestyle='--')
    
    # Y축 포맷팅
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))
    
    # X축 날짜 포맷팅
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
    ax.xaxis.set_major_locator(mdates.MonthLocator(interval=2))
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    output_path = os.path.join(script_dir, 'byron_donalds_portfolio_comparison.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n그래프 저장 완료: {output_path}")
    print(f"\n=== 결과 요약 ===")
    print(f"초기 투자: ${initial_value:,.2f}")
    print(f"Byron Donalds 포트폴리오 최종 가치: ${final_value:,.2f}")
    print(f"Byron Donalds 수익률: {member_return:.2f}%")
    print(f"S&P 500 최종 가치: ${final_sp500_value:,.2f}")
    print(f"S&P 500 수익률: {sp500_return:.2f}%")
    print(f"초과 수익: {excess_return:+.2f}%")
    
    plt.show()

if __name__ == '__main__':
    main()
