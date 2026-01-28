// ===== Data Module for 5 Politicians =====

let MOCK_POLITICIANS = [];
let MOCK_STOCKS = [];
let MOCK_TRADES = [];
let dataLoaded = false;

// 현재 주가 데이터 (실제 API 연동 시 대체)
// 임시로 최근 종가 기준 +/- 변동 적용
let CURRENT_PRICES = {};

// 5명의 의원 기본 정보
const POLITICIANS_INFO = {
    'byron_donalds': {
        id: 1,
        name: 'Byron Donalds',
        party: 'Republican',
        chamber: 'House',
        state: 'Florida',
        district: 'FL-19',
        status: 'Active',
        csvFile: 'byron_donalds_all_transaction.csv',
        hasData: true
    },
    'jonathan_jackson': {
        id: 2,
        name: 'Jonathan Jackson',
        party: 'Democrat',
        chamber: 'House',
        state: 'Illinois',
        district: 'IL-01',
        status: 'Active',
        csvFile: 'jonathan_jackson_all_transaction.csv',
        hasData: false
    },
    'tim_moore': {
        id: 3,
        name: 'Tim Moore',
        party: 'Republican',
        chamber: 'House',
        state: 'North Carolina',
        district: 'NC-14',
        status: 'Active',
        csvFile: 'tim_moore_all_transaction.csv',
        hasData: false
    },
    'nancy_pelosi': {
        id: 4,
        name: 'Nancy Pelosi',
        party: 'Democrat',
        chamber: 'House',
        state: 'California',
        district: 'CA-11',
        status: 'Active',
        csvFile: 'nancy_pelosi_all_transaction.csv',
        hasData: true
    },
    'markwayne_mullin': {
        id: 5,
        name: 'Markwayne Mullin',
        party: 'Republican',
        chamber: 'Senate',
        state: 'Oklahoma',
        district: 'OK',
        status: 'Active',
        csvFile: 'markwayne_mullin_all_transaction.csv',
        hasData: false
    },
    'kevin_hern': {
        id: 6,
        name: 'Kevin Hern',
        party: 'Republican',
        chamber: 'House',
        state: 'Oklahoma',
        district: 'OK-01',
        status: 'Active',
        csvFile: 'kevin_hern_all_transaction.csv',
        hasData: true
    }
};

// 날짜 포맷 변환 (MM/DD/YYYY -> YYYY-MM-DD)
function parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const [month, day, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
}

// 금액 범위 파싱
function parseAmountRange(range) {
    if (!range) return { min: 0, max: 0, avg: 0 };
    const cleaned = range.replace(/[$,]/g, '').trim();
    const parts = cleaned.split(' - ');
    let min = parseInt(parts[0]) || 0;
    let max = parts[1] ? parseInt(parts[1]) : min * 2;
    if (isNaN(max) || max === 0) max = min * 2;
    return { min, max, avg: (min + max) / 2 };
}

// CSV 파싱 (쉼표 또는 탭 구분 자동 감지)
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');

    // 구분자 자동 감지: 첫 줄에 탭이 있으면 탭, 아니면 쉼표
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        let values = [];

        if (delimiter === '\t') {
            // 탭 구분: 단순 분리
            values = line.split('\t').map(v => v.trim());
        } else {
            // 쉼표 구분: 따옴표 처리 필요
            let current = '';
            let inQuotes = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());
        }

        if (values.length >= headers.length - 1) {
            const row = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx] || '';
            });
            data.push(row);
        }
    }
    return data;
}

// 의원별 거래 데이터 처리
function processTradesForPolitician(rawData, politicianInfo) {
    const trades = [];
    const stocksMap = new Map();

    rawData.forEach((row, index) => {
        // CSV 헤더에 맞게 수정
        const ticker = row.ticker || '';
        const asset = row.asset || '';
        const transactionType = (row.type || '').toLowerCase();
        const transactionDate = parseDate(row.transaction_date);
        const filingDate = parseDate(row.filing_date);
        const amountRange = row.amount_range || '';
        const owner = row.owner || '';
        const year = row.year || '';

        // URL에서 filing_id 추출 (컬럼명: URL 또는 pdf_url, filing_id 직접 사용)
        const url = row.pdf_url || row.URL || '';
        const filingId = (row.filing_id && String(row.filing_id)) || (url ? (url.match(/\/(\d+)\.pdf$/) || [])[1] : '') || '';

        // 종가 파싱 (price_trade_date 사용)
        const closingPrice = parseFloat(row.price_trade_date) || 0;

        // S&P 500 종가는 SP500_DATA_MAP에서 조회
        const sp500Close = SP500_DATA_MAP[transactionDate] || 0;

        // 디버깅: 첫 번째 거래 로그
        if (trades.length === 0) {
            console.log('첫 번째 거래 데이터:', {
                ticker, transactionDate, closingPrice, sp500Close,
                rawPriceTradeDate: row.price_trade_date,
                sp500MapSize: Object.keys(SP500_DATA_MAP).length
            });
        }

        const amount = parseAmountRange(amountRange);

        // 추정 수량 계산: 금액 중간값 / 종가
        const estimatedShares = closingPrice > 0 ? Math.round(amount.avg / closingPrice * 100) / 100 : 0;

        const trade = {
            id: trades.length + 1,
            filingId: filingId,
            year: year,
            politicianId: politicianInfo.id,
            politician: politicianInfo.name,
            party: politicianInfo.party,
            state: politicianInfo.state,
            district: politicianInfo.district,
            ticker: ticker,
            stockName: asset,
            type: transactionType === 'buy' ? 'buy' : 'sell',
            tradeDate: transactionDate,
            disclosureDate: filingDate,  // filing_date를 공시일로 사용
            filingDate: filingDate,
            amountRange: amountRange,
            estimatedAmount: amount.avg,
            closingPrice: closingPrice,           // 거래일 종가
            sp500Close: sp500Close,               // 거래일 S&P 500 종가
            estimatedShares: estimatedShares,     // 추정 수량
            owner: owner === 'SP' ? 'Spouse' : owner === 'DC' ? 'Dependent Child' : owner === 'JT' ? 'Joint' : 'Self',
            sourceUrl: url || `https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/${year}/${filingId}.pdf`,
            sourceId: filingId
        };

        trades.push(trade);

        // 종목 정보 수집
        const stockKey = ticker || asset.substring(0, 20);
        if (stockKey) {
            if (!stocksMap.has(stockKey)) {
                stocksMap.set(stockKey, {
                    ticker: ticker,
                    name: asset,
                    tradeCount: 0,
                    buyCount: 0,
                    sellCount: 0,
                    totalVolume: 0,
                    totalShares: 0,
                    avgBuyPrice: 0,
                    buyPriceSum: 0,
                    buySharesSum: 0,
                    lastTradeDate: null,
                    lastClosingPrice: 0,
                    tradedBy: new Set()
                });
            }
            const stock = stocksMap.get(stockKey);
            stock.tradeCount++;
            stock.totalVolume += amount.avg;
            stock.totalShares += estimatedShares;

            if (transactionType === 'buy') {
                stock.buyCount++;
                // 매수 평균가 계산용
                if (closingPrice > 0 && estimatedShares > 0) {
                    stock.buyPriceSum += closingPrice * estimatedShares;
                    stock.buySharesSum += estimatedShares;
                }
            } else {
                stock.sellCount++;
            }

            stock.tradedBy.add(politicianInfo.name);

            // 최근 거래일 및 종가 업데이트
            if (!stock.lastTradeDate || transactionDate > stock.lastTradeDate) {
                stock.lastTradeDate = transactionDate;
                stock.lastClosingPrice = closingPrice;
            }
        }
    });

    return { trades, stocksMap };
}

// 데이터 로드
async function loadCSVData() {
    // S&P 500 데이터 먼저 로드
    await loadSP500Data();

    const allTrades = [];
    const allStocksMap = new Map();
    const politicians = [];

    for (const [key, info] of Object.entries(POLITICIANS_INFO)) {
        const politician = {
            ...info,
            avatar: null,
            totalTrades: 0,
            totalVolume: 0,
            avgTradeAmount: 0,
            lastTradeDate: null,
            buyCount: 0,
            sellCount: 0,
            // 수익률 (나중에 실제 데이터로 계산)
            return10Y: 0,
            return5Y: 0,
            return1Y: 0,
            winRate: 0,
            avgHoldingDays: 0,
            marketBenchmark: 0,
            // 거래별 수익률 저장용
            tradeReturns: []
        };

        if (info.hasData) {
            try {
                const response = await fetch(info.csvFile);
                if (response.ok) {
                    const csvText = await response.text();
                    const rawData = parseCSV(csvText);
                    const { trades, stocksMap } = processTradesForPolitician(rawData, info);

                    // 거래 ID 재할당 (전역 기준)
                    trades.forEach(t => {
                        t.id = allTrades.length + 1;
                        allTrades.push(t);
                    });

                    // 종목 병합
                    stocksMap.forEach((stock, key) => {
                        if (allStocksMap.has(key)) {
                            const existing = allStocksMap.get(key);
                            existing.tradeCount += stock.tradeCount;
                            existing.buyCount += stock.buyCount;
                            existing.sellCount += stock.sellCount;
                            existing.totalVolume += stock.totalVolume;
                            stock.tradedBy.forEach(name => existing.tradedBy.add(name));
                            if (stock.lastTradeDate > existing.lastTradeDate) {
                                existing.lastTradeDate = stock.lastTradeDate;
                            }
                        } else {
                            allStocksMap.set(key, stock);
                        }
                    });

                    // 의원 통계 업데이트
                    politician.totalTrades = trades.length;
                    politician.totalVolume = trades.reduce((sum, t) => sum + t.estimatedAmount, 0);
                    politician.avgTradeAmount = politician.totalTrades > 0
                        ? Math.round(politician.totalVolume / politician.totalTrades) : 0;
                    politician.lastTradeDate = trades.sort((a, b) =>
                        new Date(b.tradeDate) - new Date(a.tradeDate))[0]?.tradeDate || null;
                    politician.buyCount = trades.filter(t => t.type === 'buy').length;
                    politician.sellCount = trades.filter(t => t.type === 'sell').length;

                    // 거래 데이터 저장 (나중에 수익률 계산용)
                    politician.trades = trades;

                    console.log(`✓ ${info.name}: ${trades.length}건 로드됨`);
                }
            } catch (error) {
                console.warn(`⚠ ${info.name} 데이터 로드 실패:`, error.message);
            }
        } else {
            console.log(`○ ${info.name}: 데이터 준비 중`);
        }

        politicians.push(politician);
    }

    // 종목 배열 생성
    const stocks = Array.from(allStocksMap.entries()).map(([key, stock], index) => {
        // 평균 매수가 계산
        const avgBuyPrice = stock.buySharesSum > 0
            ? Math.round(stock.buyPriceSum / stock.buySharesSum * 100) / 100
            : 0;

        // 현재 가격: 마지막 종가를 그대로 사용 (고정값)
        const basePrice = stock.lastClosingPrice || avgBuyPrice || 100;
        const currentPrice = basePrice;
        const dailyChange = 0; // 고정값이므로 변동 없음

        // 현재 가격 저장 (의원 수익률 계산용)
        const tickerKey = stock.ticker || key;
        CURRENT_PRICES[tickerKey] = currentPrice;

        // 수익률 계산: (현재가 - 평균매수가) / 평균매수가 * 100
        const returnRate = avgBuyPrice > 0
            ? Math.round((currentPrice - avgBuyPrice) / avgBuyPrice * 100 * 10) / 10
            : 0;

        return {
            id: index + 1,
            ticker: tickerKey,
            name: stock.name,
            sector: 'Unknown',
            tradeCount: stock.tradeCount,
            buyCount: stock.buyCount,
            sellCount: stock.sellCount,
            totalVolume: stock.totalVolume,
            totalShares: Math.round(stock.totalShares * 100) / 100,
            avgBuyPrice: avgBuyPrice,
            lastTradeDate: stock.lastTradeDate,
            lastClosingPrice: stock.lastClosingPrice,
            tradedBy: Array.from(stock.tradedBy),
            currentPrice: currentPrice,
            dailyChange: dailyChange,
            returnRate: returnRate
        };
    });

    // 의원별 수익률 계산 (매수→매도 쌍 기준)
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    politicians.forEach(p => {
        if (!p.trades || p.trades.length === 0) return;

        // 종목별로 거래 그룹화
        const tradesByTicker = new Map();
        p.trades.forEach(trade => {
            if (!trade.ticker || !trade.closingPrice) return;
            if (!tradesByTicker.has(trade.ticker)) {
                tradesByTicker.set(trade.ticker, { buys: [], sells: [] });
            }
            const group = tradesByTicker.get(trade.ticker);
            if (trade.type === 'buy') {
                group.buys.push(trade);
            } else {
                group.sells.push(trade);
            }
        });

        // 매수→매도 쌍으로 수익률 계산
        let totalReturnSum = 0;
        let totalSp500ReturnSum = 0;  // S&P 500 수익률 합계
        let completedTradeCount = 0;
        let winCount = 0;
        let beatMarketCount = 0;  // 시장 초과 수익 횟수
        let totalHoldingDays = 0;

        // 1년 내 거래용
        let return1YSum = 0;
        let sp500Return1YSum = 0;
        let trade1YCount = 0;

        tradesByTicker.forEach((group, ticker) => {
            // 매수/매도를 날짜순 정렬
            group.buys.sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));
            group.sells.sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));

            // 매칭된 매수 인덱스 추적
            const matchedBuyIndices = new Set();

            // 각 매도에 대해 가장 가까운 이전 매수 찾기 (FIFO 방식)
            let buyIndex = 0;
            group.sells.forEach(sell => {
                // 매도일 이전의 매수 찾기
                let matchedBuy = null;
                for (let i = buyIndex; i < group.buys.length; i++) {
                    if (new Date(group.buys[i].tradeDate) <= new Date(sell.tradeDate)) {
                        matchedBuy = group.buys[i];
                        matchedBuyIndices.add(i);
                        buyIndex = i + 1; // 다음 매도는 이 매수 이후부터 검색
                        break;
                    }
                }

                if (matchedBuy && matchedBuy.closingPrice > 0) {
                    // 실현 수익률 계산: (매도가 - 매수가) / 매수가 * 100
                    const returnRate = (sell.closingPrice - matchedBuy.closingPrice) / matchedBuy.closingPrice * 100;
                    totalReturnSum += returnRate;
                    completedTradeCount++;

                    if (returnRate > 0) winCount++;

                    // S&P 500 동일 기간 수익률 계산
                    let sp500Return = 0;
                    if (matchedBuy.sp500Close > 0 && sell.sp500Close > 0) {
                        sp500Return = (sell.sp500Close - matchedBuy.sp500Close) / matchedBuy.sp500Close * 100;
                        totalSp500ReturnSum += sp500Return;
                        if (returnRate > sp500Return) beatMarketCount++;
                    }

                    // 보유 기간 계산
                    const holdingDays = Math.floor((new Date(sell.tradeDate) - new Date(matchedBuy.tradeDate)) / (1000 * 60 * 60 * 24));
                    totalHoldingDays += holdingDays;

                    // 1년 내 매도 거래
                    if (new Date(sell.tradeDate) >= oneYearAgo) {
                        return1YSum += returnRate;
                        sp500Return1YSum += sp500Return;
                        trade1YCount++;
                    }

                    const excessReturn = returnRate - sp500Return;
                    console.log(`    ${ticker}: 매수 $${matchedBuy.closingPrice} → 매도 $${sell.closingPrice} = ${returnRate.toFixed(1)}% (S&P: ${sp500Return.toFixed(1)}%, 초과: ${excessReturn.toFixed(1)}%)`);
                }
            });

            // 매칭되지 않은 매수 (미실현) 처리
            const currentPrice = CURRENT_PRICES[ticker];
            // 현재 S&P 500 가격 (최근 데이터 기준, 약 6000 수준)
            const currentSp500 = 6000;

            if (currentPrice) {
                group.buys.forEach((buy, i) => {
                    if (!matchedBuyIndices.has(i) && buy.closingPrice > 0) {
                        // 미실현 수익률 계산: (현재가 - 매수가) / 매수가 * 100
                        const returnRate = (currentPrice - buy.closingPrice) / buy.closingPrice * 100;
                        totalReturnSum += returnRate;
                        completedTradeCount++;

                        if (returnRate > 0) winCount++;

                        // S&P 500 동일 기간 수익률 계산
                        let sp500Return = 0;
                        if (buy.sp500Close > 0) {
                            sp500Return = (currentSp500 - buy.sp500Close) / buy.sp500Close * 100;
                            totalSp500ReturnSum += sp500Return;
                            if (returnRate > sp500Return) beatMarketCount++;
                        }

                        // 보유 기간 (매수일 ~ 현재)
                        const holdingDays = Math.floor((now - new Date(buy.tradeDate)) / (1000 * 60 * 60 * 24));
                        totalHoldingDays += holdingDays;

                        // 1년 내 매수
                        if (new Date(buy.tradeDate) >= oneYearAgo) {
                            return1YSum += returnRate;
                            sp500Return1YSum += sp500Return;
                            trade1YCount++;
                        }

                        const excessReturn = returnRate - sp500Return;
                        console.log(`    ${ticker}: 매수 $${buy.closingPrice} → 현재 $${currentPrice} = ${returnRate.toFixed(1)}% (S&P: ${sp500Return.toFixed(1)}%, 초과: ${excessReturn.toFixed(1)}%) (미실현)`);
                    }
                });
            }
        });

        // 평균 수익률 계산
        const avgReturn = completedTradeCount > 0
            ? Math.round(totalReturnSum / completedTradeCount * 10) / 10
            : 0;

        const avgSp500Return = completedTradeCount > 0
            ? Math.round(totalSp500ReturnSum / completedTradeCount * 10) / 10
            : 0;

        // 초과 수익률 (의원 수익률 - S&P 500 수익률)
        const excessReturn = Math.round((avgReturn - avgSp500Return) * 10) / 10;

        const avgReturn1Y = trade1YCount > 0
            ? Math.round(return1YSum / trade1YCount * 10) / 10
            : 0;

        const avgSp500Return1Y = trade1YCount > 0
            ? Math.round(sp500Return1YSum / trade1YCount * 10) / 10
            : 0;

        const excessReturn1Y = Math.round((avgReturn1Y - avgSp500Return1Y) * 10) / 10;

        // 승률 (수익 거래 비율)
        const winRate = completedTradeCount > 0
            ? Math.round(winCount / completedTradeCount * 100 * 10) / 10
            : 0;

        // 시장 초과 비율 (S&P 500보다 높은 수익률 비율)
        const beatMarketRate = completedTradeCount > 0
            ? Math.round(beatMarketCount / completedTradeCount * 100 * 10) / 10
            : 0;

        // 평균 보유 기간
        const avgHoldingDays = completedTradeCount > 0
            ? Math.round(totalHoldingDays / completedTradeCount)
            : 0;

        p.return10Y = avgReturn;           // 전체 평균 수익률
        p.return5Y = avgReturn;            // 동일하게 설정
        p.return1Y = avgReturn1Y;          // 1년 평균 수익률
        p.sp500Return = avgSp500Return;    // S&P 500 평균 수익률
        p.excessReturn = excessReturn;     // 초과 수익률
        p.excessReturn1Y = excessReturn1Y; // 1년 초과 수익률
        p.winRate = winRate;
        p.beatMarketRate = beatMarketRate; // 시장 초과 비율
        p.avgHoldingDays = avgHoldingDays;
        p.marketBenchmark = avgSp500Return;
        p.completedTrades = completedTradeCount; // 완료된 거래 수

        // 거래 데이터 정리 (메모리 절약)
        delete p.trades;

        console.log(`  → ${p.name}: 수익률 ${avgReturn}% (S&P: ${avgSp500Return}%, 초과: ${excessReturn}%), 승률 ${winRate}%, 시장초과 ${beatMarketRate}% (${completedTradeCount}건)`);
    });

    // 전역 변수 설정
    MOCK_POLITICIANS = politicians.sort((a, b) => b.totalTrades - a.totalTrades);
    MOCK_STOCKS = stocks.sort((a, b) => b.tradeCount - a.tradeCount);
    MOCK_TRADES = allTrades.sort((a, b) => new Date(b.tradeDate) - new Date(a.tradeDate));

    dataLoaded = true;

    console.log(`\n=== 데이터 로드 완료 ===`);
    console.log(`의원: ${MOCK_POLITICIANS.length}명`);
    console.log(`종목: ${MOCK_STOCKS.length}개`);
    console.log(`거래: ${MOCK_TRADES.length}건`);

    return true;
}

// Chart data simulation
function generateChartData(startDate, endDate, startValue) {
    const data = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    let value = startValue;

    while (currentDate <= end) {
        const change = (Math.random() - 0.48) * 0.03 * value;
        value += change;
        data.push({
            date: currentDate.toISOString().split('T')[0],
            value: Math.round(value * 100) / 100
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
}

// S&P 500 실제 데이터 (JSON 파일에서 로드)
let SP500_DATA = [];
let SP500_DATA_MAP = {}; // 날짜로 빠른 조회를 위한 맵

// S&P 500 데이터 로드
async function loadSP500Data() {
    try {
        const response = await fetch('data/sp500_close.json');
        if (response.ok) {
            const rawData = await response.json();
            SP500_DATA = rawData.map(d => ({
                date: d.date,
                value: d.close
            }));
            // 날짜별 맵 생성
            SP500_DATA.forEach(d => {
                SP500_DATA_MAP[d.date] = d.value;
            });
            console.log(`✓ S&P 500 데이터 로드: ${SP500_DATA.length}일치`);
        }
    } catch (error) {
        console.warn('S&P 500 데이터 로드 실패, 시뮬레이션 데이터 사용:', error.message);
        SP500_DATA = generateChartData('2016-01-01', '2026-01-27', 2000);
    }
}

// 의원 포트폴리오 성과 데이터 생성 (S&P 500과 비교용)
function generatePoliticianPerformanceData(politicianId) {
    const trades = MOCK_TRADES.filter(t => t.politicianId === politicianId);
    if (trades.length === 0 || SP500_DATA.length === 0) {
        return { politicianData: [], sp500Data: [] };
    }

    // 거래를 날짜순으로 정렬
    const sortedTrades = [...trades].sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));

    // 첫 거래일 찾기
    const firstTradeDate = sortedTrades[0].tradeDate;
    const startIndex = SP500_DATA.findIndex(d => d.date >= firstTradeDate);

    if (startIndex === -1) {
        return { politicianData: [], sp500Data: [] };
    }

    // 포트폴리오 추적
    const holdings = {}; // ticker -> { shares, avgCost }
    let totalInvested = 0;
    let realizedGains = 0;

    // 결과 데이터
    const politicianData = [];
    const sp500Data = [];

    // 첫 S&P 500 값 (기준점)
    const baseS500Value = SP500_DATA[startIndex].value;

    // 각 날짜에 대해 포트폴리오 가치 계산
    for (let i = startIndex; i < SP500_DATA.length; i++) {
        const currentDate = SP500_DATA[i].date;
        const currentS500 = SP500_DATA[i].value;

        // 이 날짜까지의 거래 적용
        sortedTrades.forEach(trade => {
            if (trade.tradeDate === currentDate && trade.closingPrice > 0) {
                const ticker = trade.ticker;
                const shares = trade.estimatedShares || 0;
                const price = trade.closingPrice;

                if (!holdings[ticker]) {
                    holdings[ticker] = { shares: 0, totalCost: 0 };
                }

                if (trade.type === 'buy') {
                    holdings[ticker].shares += shares;
                    holdings[ticker].totalCost += shares * price;
                    totalInvested += shares * price;
                } else if (trade.type === 'sell') {
                    const avgCost = holdings[ticker].shares > 0
                        ? holdings[ticker].totalCost / holdings[ticker].shares
                        : price;
                    const sellValue = shares * price;
                    const costBasis = shares * avgCost;
                    realizedGains += sellValue - costBasis;

                    holdings[ticker].shares = Math.max(0, holdings[ticker].shares - shares);
                    holdings[ticker].totalCost = Math.max(0, holdings[ticker].totalCost - costBasis);
                }
            }
        });

        // 현재 포트폴리오 가치 계산 (미실현 + 실현) — S&P 변동률만 사용 (재현 가능)
        let currentValue = realizedGains;
        Object.keys(holdings).forEach(ticker => {
            const holding = holdings[ticker];
            if (holding.shares > 0) {
                const s500Change = currentS500 / baseS500Value;
                const estimatedPrice = (holding.totalCost / holding.shares) * s500Change;
                currentValue += holding.shares * estimatedPrice;
            }
        });

        // 수익률 계산 (100 기준)
        const totalCost = Object.values(holdings).reduce((sum, h) => sum + h.totalCost, 0);
        const baseValue = totalCost > 0 ? totalCost : totalInvested || 100;
        const portfolioReturn = baseValue > 0 ? (currentValue / baseValue) * 100 : 100;

        // S&P 500 정규화 (100 기준)
        const s500Normalized = (currentS500 / baseS500Value) * 100;

        // 월별 데이터만 저장 (데이터 포인트 줄이기)
        const date = new Date(currentDate);
        if (date.getDate() === 1 || i === startIndex || i === SP500_DATA.length - 1) {
            politicianData.push({
                date: currentDate,
                value: portfolioReturn
            });
            sp500Data.push({
                date: currentDate,
                value: s500Normalized
            });
        }
    }

    // 의원 곡선도 첫날 = 100 기준으로 정규화 (S&P와 동일한 시작점)
    if (politicianData.length > 0) {
        const firstVal = politicianData[0].value;
        if (firstVal > 0) {
            politicianData.forEach(d => {
                d.value = Math.max(50, Math.min(500, (d.value / firstVal) * 100));
            });
        } else {
            // 첫 값이 0이면 100으로 고정해 나중에 (마지막/첫값) 계산 시 Infinity 방지
            politicianData[0].value = 100;
        }
    }

    return { politicianData, sp500Data };
}

// 데이터 로드 대기 함수
function waitForData() {
    return new Promise((resolve) => {
        if (dataLoaded) {
            resolve();
        } else {
            const check = setInterval(() => {
                if (dataLoaded) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
        }
    });
}
