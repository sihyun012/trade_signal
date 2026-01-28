// ===== UI Components =====

const Components = {

    // ===== Header Component =====
    renderHeader() {
        const user = Auth.getUser();
        const initials = user ? Utils.getInitials(user.email.split('@')[0]) : '?';

        return `
            <header class="header">
                <div class="header-content">
                    <div class="header-logo" onclick="Router.navigate('/')">
                        <i class="fas fa-chart-line"></i> Trade Signal
                    </div>
                    <nav class="header-nav">
                        <div class="header-nav-item ${Router.currentRoute === '/' ? 'active' : ''}"
                             onclick="Router.navigate('/')">
                            <i class="fas fa-home"></i> 홈
                        </div>
                        <div class="header-nav-item ${Router.currentRoute === '/settings' ? 'active' : ''}"
                             onclick="Router.navigate('/settings')">
                            <i class="fas fa-cog"></i> 설정
                        </div>
                    </nav>
                    <div class="header-user">
                        <div class="user-dropdown">
                            <div class="header-user-avatar" onclick="Components.toggleUserMenu()">
                                ${initials}
                            </div>
                            <div class="user-dropdown-menu" id="userDropdownMenu">
                                <div class="user-dropdown-item" onclick="Router.navigate('/settings')">
                                    <i class="fas fa-cog"></i> 설정
                                </div>
                                <div class="user-dropdown-item" onclick="Router.navigate('/subscription')">
                                    <i class="fas fa-crown"></i> 구독 관리
                                </div>
                                <div class="user-dropdown-item" onclick="App.handleLogout()">
                                    <i class="fas fa-sign-out-alt"></i> 로그아웃
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    toggleUserMenu() {
        const menu = document.getElementById('userDropdownMenu');
        menu.classList.toggle('show');

        // Close on outside click
        const closeMenu = (e) => {
            if (!e.target.closest('.user-dropdown')) {
                menu.classList.remove('show');
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    },

    // ===== Login Page =====
    renderLoginPage() {
        return `
            <div class="login-page">
                <div class="login-container">
                    <div class="login-logo">
                        <h1><i class="fas fa-chart-line"></i> Trade Signal</h1>
                        <p>미국 의원들의 주식 거래를 추적하세요</p>
                    </div>
                    <div class="login-card">
                        <div class="login-tabs">
                            <div class="login-tab active" onclick="Components.switchLoginTab('login')">로그인</div>
                            <div class="login-tab" onclick="Components.switchLoginTab('signup')">회원가입</div>
                        </div>

                        <div id="loginForm">
                            <button class="btn btn-google" onclick="App.handleGoogleLogin()">
                                <img src="https://www.google.com/favicon.ico" alt="Google">
                                Google로 계속하기
                            </button>

                            <div class="login-divider">
                                <span>또는</span>
                            </div>

                            <form onsubmit="App.handleEmailLogin(event)">
                                <div class="form-group">
                                    <label class="form-label">이메일</label>
                                    <input type="email" class="form-input" id="loginEmail"
                                           placeholder="example@email.com" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">비밀번호</label>
                                    <input type="password" class="form-input" id="loginPassword"
                                           placeholder="비밀번호를 입력하세요" required>
                                </div>
                                <div id="loginError" class="form-error" style="display: none;"></div>
                                <button type="submit" class="btn btn-primary btn-block" id="loginBtn">
                                    로그인
                                </button>
                            </form>
                        </div>

                        <div id="signupForm" style="display: none;">
                            <button class="btn btn-google" onclick="App.handleGoogleLogin()">
                                <img src="https://www.google.com/favicon.ico" alt="Google">
                                Google로 시작하기
                            </button>

                            <div class="login-divider">
                                <span>또는</span>
                            </div>

                            <form onsubmit="App.handleEmailSignup(event)">
                                <div class="form-group">
                                    <label class="form-label">이메일</label>
                                    <input type="email" class="form-input" id="signupEmail"
                                           placeholder="example@email.com" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">비밀번호</label>
                                    <input type="password" class="form-input" id="signupPassword"
                                           placeholder="8자 이상 입력하세요" required minlength="8">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">비밀번호 확인</label>
                                    <input type="password" class="form-input" id="signupPasswordConfirm"
                                           placeholder="비밀번호를 다시 입력하세요" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-checkbox">
                                        <input type="checkbox" id="termsAgreed" required>
                                        <span><a href="#" onclick="Components.showTerms()">이용약관</a> 및
                                        <a href="#" onclick="Components.showPrivacy()">개인정보 처리방침</a>에 동의합니다.</span>
                                    </label>
                                </div>
                                <div id="signupError" class="form-error" style="display: none;"></div>
                                <button type="submit" class="btn btn-primary btn-block" id="signupBtn">
                                    가입하기
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    switchLoginTab(tab) {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const tabs = document.querySelectorAll('.login-tab');

        tabs.forEach(t => t.classList.remove('active'));

        if (tab === 'login') {
            tabs[0].classList.add('active');
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            tabs[1].classList.add('active');
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
    },

    showTerms() {
        alert('이용약관 페이지 (실제로는 모달 또는 새 페이지로 표시)');
    },

    showPrivacy() {
        alert('개인정보 처리방침 페이지 (실제로는 모달 또는 새 페이지로 표시)');
    },

    // ===== Home Page =====
    renderHomePage() {
        return `
            ${this.renderHeader()}
            <main class="home-page container">
                <div class="page-header">
                    <h1 class="page-title">대시보드</h1>
                    <p class="page-subtitle">미국 의원들의 최신 주식 거래 현황을 확인하세요</p>
                </div>

                <div class="tabs">
                    <div class="tab active" onclick="App.switchHomeTab('politicians')">의원</div>
                    <div class="tab" onclick="App.switchHomeTab('stocks')">종목</div>
                </div>

                <div class="filters">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchInput" placeholder="의원 이름 또는 종목 검색..."
                               oninput="App.handleSearch(this.value)">
                    </div>
                    <select class="filter-select" id="sortSelect" onchange="App.handleSort(this.value)">
                        <option value="return">수익률순</option>
                        <option value="trades">거래량순</option>
                        <option value="recent">최근 거래순</option>
                        <option value="name">이름순</option>
                    </select>
                    <select class="filter-select" id="partyFilter" onchange="App.handleFilter(this.value)">
                        <option value="all">전체 정당</option>
                        <option value="Democrat">민주당</option>
                        <option value="Republican">공화당</option>
                    </select>
                </div>

                <div id="listContainer" class="list-container">
                    ${this.renderSkeletonList()}
                </div>

                <div id="loadMoreContainer" style="text-align: center; padding: 20px; display: none;">
                    <button class="btn btn-secondary" onclick="App.loadMore()">더 보기</button>
                </div>
            </main>
        `;
    },

    renderSkeletonList() {
        return Array(5).fill('<div class="skeleton skeleton-item"></div>').join('');
    },

    renderPoliticianList(politicians) {
        if (politicians.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-search"></i></div>
                    <h3>찾으시는 결과가 없습니다</h3>
                    <p>조건을 변경해 보세요.</p>
                </div>
            `;
        }

        const follows = UserData.getFollowedPoliticians();

        return politicians.map(p => {
            const partyClass = p.party === 'Democrat' ? 'text-primary' : p.party === 'Republican' ? 'text-danger' : 'text-muted';
            const partyName = p.party === 'Democrat' ? '민주당' : p.party === 'Republican' ? '공화당' : p.party;
            const hasData = p.totalTrades > 0;

            return `
                <div class="list-item ${!hasData ? 'opacity-50' : ''}" onclick="Router.navigate('/politician/${p.id}')">
                    <div class="list-item-avatar">
                        ${p.avatar ? `<img src="${p.avatar}" alt="${p.name}">` : Utils.getInitials(p.name)}
                    </div>
                    <div class="list-item-info">
                        <div class="list-item-name">${p.name} ${!hasData ? '<span class="text-muted" style="font-size: 12px;">(데이터 준비중)</span>' : ''}</div>
                        <div class="list-item-meta">
                            <span class="${partyClass}">${partyName}</span>
                            <span><i class="fas fa-landmark"></i> ${p.chamber}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${p.state}</span>
                        </div>
                    </div>
                    <div class="list-item-stats">
                        <div class="stat-item">
                            <div class="stat-value">${p.totalTrades || 0}</div>
                            <div class="stat-label">총 거래</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${p.buyCount || 0} / ${p.sellCount || 0}</div>
                            <div class="stat-label">매수/매도</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${p.lastTradeDate ? Utils.formatDate(p.lastTradeDate) : '-'}</div>
                            <div class="stat-label">최근 거래</div>
                        </div>
                    </div>
                    <div class="list-item-actions" onclick="event.stopPropagation()">
                        <button class="follow-btn ${follows.includes(p.id) ? 'following' : ''}"
                                onclick="App.toggleFollow(${p.id}, event)">
                            <i class="fas fa-${follows.includes(p.id) ? 'check' : 'plus'}"></i>
                            ${follows.includes(p.id) ? '팔로잉' : '팔로우'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderStockList(stocks) {
        if (stocks.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-search"></i></div>
                    <h3>찾으시는 결과가 없습니다</h3>
                    <p>조건을 변경해 보세요.</p>
                </div>
            `;
        }

        const watchlist = UserData.getWatchlist();

        return stocks.map(s => `
            <div class="list-item" onclick="Router.navigate('/stock/${s.id}')">
                <div class="list-item-avatar ticker-logo">
                    ${(s.ticker || s.name || '??').slice(0, 2).toUpperCase()}
                </div>
                <div class="list-item-info">
                    <div class="list-item-name">${s.ticker || s.name?.substring(0, 20) || '-'}</div>
                    <div class="list-item-meta">
                        <span>${s.name || '-'}</span>
                        <span><i class="fas fa-users"></i> ${s.tradedBy?.length || 0}명 거래</span>
                    </div>
                </div>
                <div class="list-item-stats">
                    <div class="stat-item">
                        <div class="stat-value">$${s.currentPrice.toFixed(2)}</div>
                        <div class="stat-label">현재가</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value ${s.dailyChange >= 0 ? 'text-success' : 'text-danger'}">
                            ${Utils.formatPercent(s.dailyChange)}
                        </div>
                        <div class="stat-label">일일 변동</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${s.tradeCount}</div>
                        <div class="stat-label">거래 건수</div>
                    </div>
                </div>
                <div class="list-item-actions" onclick="event.stopPropagation()">
                    <button class="follow-btn ${watchlist.includes(s.id) ? 'following' : ''}"
                            onclick="App.toggleWatchlist(${s.id}, event)">
                        <i class="fas fa-${watchlist.includes(s.id) ? 'bookmark' : 'bookmark'}"></i>
                        ${watchlist.includes(s.id) ? '관심' : '담기'}
                    </button>
                </div>
            </div>
        `).join('');
    },

    // ===== Politician Profile Page =====
    renderPoliticianProfile(politician) {
        const follows = UserData.getFollowedPoliticians();
        const isFollowing = follows.includes(politician.id);
        const trades = MOCK_TRADES.filter(t => t.politicianId === politician.id);

        return `
            ${this.renderHeader()}
            <main class="profile-page container">
                <div class="back-btn" onclick="Router.navigate('/')">
                    <i class="fas fa-arrow-left"></i> 목록으로 돌아가기
                </div>

                <div class="profile-header">
                    <div class="profile-top">
                        <div class="profile-avatar">
                            ${politician.avatar ? `<img src="${politician.avatar}">` : Utils.getInitials(politician.name)}
                        </div>
                        <div class="profile-info">
                            <h1 class="profile-name">${politician.name}</h1>
                            <div>
                                <span class="profile-badge ${politician.party.toLowerCase()}">
                                    ${politician.party === 'Democrat' ? '민주당' : '공화당'}
                                </span>
                                <span class="profile-badge">
                                    <i class="fas fa-landmark"></i> ${politician.chamber}
                                </span>
                                <span class="profile-badge">
                                    <i class="fas fa-map-marker-alt"></i> ${politician.state}
                                    ${politician.district ? ` (${politician.district})` : ''}
                                </span>
                                <span class="profile-badge">
                                    ${politician.status === 'Active' ? '활동 중' : '비활동'}
                                </span>
                            </div>
                            <div style="margin-top: 16px;">
                                <button class="btn ${isFollowing ? 'btn-primary' : 'btn-outline'}"
                                        onclick="App.toggleFollow(${politician.id}, event)">
                                    <i class="fas fa-${isFollowing ? 'check' : 'plus'}"></i>
                                    ${isFollowing ? '팔로잉' : '팔로우'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="profile-stats">
                        <div class="profile-stat">
                            <div class="profile-stat-value ${(politician.excessReturn || 0) >= 0 ? 'text-success' : 'text-danger'}" style="font-size: 1.5rem;">
                                ${(politician.excessReturn || 0) >= 0 ? '+' : ''}${(politician.excessReturn || 0).toFixed(1)}%
                            </div>
                            <div class="profile-stat-label">S&P 500 대비 <span class="text-muted" style="font-size:0.75em">(거래당 평균)</span></div>
                        </div>
                        <div class="profile-stat">
                            <div class="profile-stat-value ${(politician.return10Y || 0) >= 0 ? 'text-success' : 'text-danger'}">
                                ${Utils.formatPercent(politician.return10Y || 0)}
                            </div>
                            <div class="profile-stat-label">평균 수익률</div>
                        </div>
                        <div class="profile-stat">
                            <div class="profile-stat-value">${Utils.formatPercent(politician.sp500Return || 0)}</div>
                            <div class="profile-stat-label">S&P 500</div>
                        </div>
                        <div class="profile-stat">
                            <div class="profile-stat-value">${(politician.beatMarketRate || 0).toFixed(1)}%</div>
                            <div class="profile-stat-label">시장 초과 비율</div>
                        </div>
                        <div class="profile-stat">
                            <div class="profile-stat-value">${(politician.winRate || 0).toFixed(1)}%</div>
                            <div class="profile-stat-label">승률</div>
                        </div>
                        <div class="profile-stat">
                            <div class="profile-stat-value">${politician.avgHoldingDays || 0}일</div>
                            <div class="profile-stat-label">평균 보유기간</div>
                        </div>
                        <div class="profile-stat">
                            <div class="profile-stat-value">${politician.completedTrades || 0}</div>
                            <div class="profile-stat-label">완료된 거래</div>
                        </div>
                        <div class="profile-stat">
                            <div class="profile-stat-value">${politician.lastTradeDate ? Utils.formatDate(politician.lastTradeDate) : '-'}</div>
                            <div class="profile-stat-label">최근 매매일</div>
                        </div>
                    </div>
                </div>

                ${this.renderChartSection(politician)}

                <div class="trade-list">
                    <div class="trade-list-header">
                        <h3 class="trade-list-title">매매 내역</h3>
                        <span class="text-muted">${trades.length}건</span>
                    </div>
                    <table class="trade-table">
                        <thead>
                            <tr>
                                <th>종목</th>
                                <th>유형</th>
                                <th>거래일</th>
                                <th>종가</th>
                                <th>금액 범위</th>
                                <th>추정 수량</th>
                                <th>소유자</th>
                                <th>출처</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${trades.map(t => `
                                <tr onclick="Router.navigate('/trade/${t.id}')">
                                    <td>
                                        <div style="font-weight: 600;">${t.ticker || '-'}</div>
                                        <div class="text-muted" style="font-size: 12px;">${t.stockName || ''}</div>
                                    </td>
                                    <td>
                                        <span class="trade-type ${t.type}">
                                            ${t.type === 'buy' ? '매수' : '매도'}
                                        </span>
                                    </td>
                                    <td>${Utils.formatDate(t.tradeDate)}</td>
                                    <td>${t.closingPrice ? '$' + t.closingPrice.toFixed(2) : '-'}</td>
                                    <td>${t.amountRange || '-'}</td>
                                    <td>${t.estimatedShares ? t.estimatedShares.toLocaleString() + '주' : '-'}</td>
                                    <td>
                                        ${t.owner || 'Self'}
                                    </td>
                                    <td>
                                        <a href="${t.sourceUrl}" target="_blank" class="source-link"
                                           onclick="event.stopPropagation()">
                                            <i class="fas fa-external-link-alt"></i> view origin file
                                        </a>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${trades.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-state-icon"><i class="fas fa-inbox"></i></div>
                            <h3>매매 내역이 없습니다</h3>
                        </div>
                    ` : ''}
                </div>
            </main>
        `;
    },

    renderChartSection(politician) {
        return `
            <div class="chart-section">
                <div class="chart-header">
                    <div class="chart-header-left">
                        <h3 class="chart-title">Portfolio Performance vs S&P 500</h3>
                        <p class="chart-subtitle">의원 거래 따라하기 수익률 비교 (100 = 시작점)</p>
                    </div>
                    <div class="chart-toggle">
                        <button class="chart-toggle-btn active" onclick="App.switchChartType('trade')">
                            거래일 기준
                        </button>
                        <button class="chart-toggle-btn" onclick="App.switchChartType('disclosure')">
                            공시일 기준
                        </button>
                    </div>
                </div>
                <div id="chartSummary" class="chart-summary">
                    <div class="chart-summary-item">
                        <span class="chart-summary-label">${politician.name}</span>
                        <span class="chart-summary-value text-primary">계산 중...</span>
                    </div>
                    <div class="chart-summary-item">
                        <span class="chart-summary-label">S&P 500</span>
                        <span class="chart-summary-value">계산 중...</span>
                    </div>
                </div>
                <div class="chart-container" id="chartContainer">
                    <canvas id="performanceChart"></canvas>
                </div>
                <p class="text-muted text-center mt-2" style="font-size: 12px;">
                    * 데이터는 매일 00:00 스냅샷 기준이며, 실시간 정보가 아닙니다. 호버하여 상세 정보를 확인하세요.
                </p>
            </div>
        `;
    },

    // ===== Trade Detail Page =====
    renderTradeDetail(trade) {
        const politician = MOCK_POLITICIANS.find(p => p.id === trade.politicianId);
        const lagDays = trade.tradeDate && trade.disclosureDate ? Utils.daysBetween(trade.tradeDate, trade.disclosureDate) : '-';
        const tickerDisplay = trade.ticker || trade.stockName?.substring(0, 4) || '??';
        const relatedTrades = MOCK_TRADES.filter(t =>
            t.politicianId === trade.politicianId &&
            (t.ticker === trade.ticker || t.stockName === trade.stockName) &&
            t.id !== trade.id
        );

        return `
            ${this.renderHeader()}
            <main class="trade-detail-page container">
                <div class="back-btn" onclick="Router.navigate('/politician/${politician?.id || 1}')">
                    <i class="fas fa-arrow-left"></i> ${politician?.name || trade.politician} 프로필로 돌아가기
                </div>

                <div class="trade-detail-header">
                    <div class="trade-detail-top">
                        <div class="ticker-logo">${tickerDisplay.slice(0, 2).toUpperCase()}</div>
                        <div class="trade-detail-info">
                            <h1>${trade.stockName || tickerDisplay}</h1>
                            <div class="ticker">${trade.ticker || '-'}</div>
                        </div>
                        <span class="trade-type ${trade.type}" style="font-size: 16px; padding: 8px 16px;">
                            ${trade.type === 'buy' ? '매수' : '매도'}
                        </span>
                    </div>

                    <div class="trade-detail-grid">
                        <div class="trade-detail-item">
                            <div class="trade-detail-label">의원</div>
                            <div class="trade-detail-value">${trade.politician}</div>
                        </div>
                        <div class="trade-detail-item">
                            <div class="trade-detail-label">정당 / 지역</div>
                            <div class="trade-detail-value">
                                ${trade.party === 'Democrat' ? '민주당' : trade.party === 'Republican' ? '공화당' : trade.party} / ${trade.state}
                            </div>
                        </div>
                        <div class="trade-detail-item">
                            <div class="trade-detail-label">거래일</div>
                            <div class="trade-detail-value">${Utils.formatDate(trade.tradeDate)}</div>
                        </div>
                        <div class="trade-detail-item">
                            <div class="trade-detail-label">공시일</div>
                            <div class="trade-detail-value">${Utils.formatDate(trade.disclosureDate)}</div>
                        </div>
                        <div class="trade-detail-item">
                            <div class="trade-detail-label">공시 지연</div>
                            <div class="trade-detail-value">${lagDays}일</div>
                        </div>
                        <div class="trade-detail-item">
                            <div class="trade-detail-label">소유자</div>
                            <div class="trade-detail-value">${trade.owner || 'Self'}</div>
                        </div>
                        <div class="trade-detail-item">
                            <div class="trade-detail-label">거래 규모</div>
                            <div class="trade-detail-value">${trade.amountRange || '-'}</div>
                        </div>
                        <div class="trade-detail-item">
                            <div class="trade-detail-label">거래일 종가</div>
                            <div class="trade-detail-value">${trade.closingPrice ? '$' + trade.closingPrice.toFixed(2) : '-'}</div>
                        </div>
                        <div class="trade-detail-item">
                            <div class="trade-detail-label">추정 수량</div>
                            <div class="trade-detail-value">${trade.estimatedShares ? trade.estimatedShares.toLocaleString() + '주' : '-'}</div>
                        </div>
                        <div class="trade-detail-item">
                            <div class="trade-detail-label">Filing ID</div>
                            <div class="trade-detail-value">${trade.filingId || '-'}</div>
                        </div>
                    </div>

                    <div style="margin-top: 20px;">
                        <a href="${trade.sourceUrl}" target="_blank" class="btn btn-outline">
                            <i class="fas fa-file-pdf"></i> view origin file
                        </a>
                        <span class="text-muted" style="margin-left: 12px; font-size: 12px;">
                            Source ID: ${trade.sourceId}
                        </span>
                    </div>
                </div>

                <div class="chart-section">
                    <div class="chart-header">
                        <h3 class="chart-title">주가 추이</h3>
                    </div>
                    <div class="chart-container" id="stockChartContainer">
                        <canvas id="stockChart"></canvas>
                    </div>
                    <div class="chart-legend">
                        <div class="chart-legend-item">
                            <div class="chart-legend-color" style="background: #10b981;"></div>
                            <span>거래일</span>
                        </div>
                        <div class="chart-legend-item">
                            <div class="chart-legend-color" style="background: #f59e0b;"></div>
                            <span>공시일</span>
                        </div>
                    </div>
                    <p class="text-muted text-center mt-2" style="font-size: 12px;">
                        * 데이터 지연 또는 누락이 있을 수 있습니다.
                    </p>
                </div>

                ${relatedTrades.length > 0 ? `
                    <div class="trade-list">
                        <div class="trade-list-header">
                            <h3 class="trade-list-title">${trade.politician}의 ${trade.ticker || trade.stockName} 거래 히스토리</h3>
                            <span class="text-muted">${relatedTrades.length}건</span>
                        </div>
                        <table class="trade-table">
                            <thead>
                                <tr>
                                    <th>유형</th>
                                    <th>거래일</th>
                                    <th>공시일</th>
                                    <th>지연</th>
                                    <th>금액 범위</th>
                                    <th>소유자</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${relatedTrades.map(t => `
                                    <tr onclick="Router.navigate('/trade/${t.id}')">
                                        <td>
                                            <span class="trade-type ${t.type}">
                                                ${t.type === 'buy' ? '매수' : '매도'}
                                            </span>
                                        </td>
                                        <td>${Utils.formatDate(t.tradeDate)}</td>
                                        <td>${Utils.formatDate(t.disclosureDate)}</td>
                                        <td>${t.tradeDate && t.disclosureDate ? Utils.daysBetween(t.tradeDate, t.disclosureDate) : '-'}일</td>
                                        <td>${t.amountRange || '-'}</td>
                                        <td>${t.owner || 'Self'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            </main>
        `;
    },

    // ===== Stock Detail Page (해당 종목을 거래한 의원 목록) =====
    renderStockDetail(stock, trades) {
        const sortedTrades = [...trades].sort((a, b) => new Date(b.disclosureDate || b.filingDate || 0) - new Date(a.disclosureDate || a.filingDate || 0));
        const politicianIds = [...new Set(sortedTrades.map(t => t.politicianId))];
        const volumeSum = (stock.totalVolume && stock.totalVolume > 0) ? stock.totalVolume : sortedTrades.reduce((sum, t) => sum + (t.estimatedAmount || 0), 0);

        return `
            ${this.renderHeader()}
            <main class="profile-page container">
                <div class="back-btn" onclick="Router.navigate('/')">
                    <i class="fas fa-arrow-left"></i> 대시보드로 돌아가기
                </div>

                <div class="trade-detail-header">
                    <div class="trade-detail-top">
                        <div class="ticker-logo" style="width: 64px; height: 64px; font-size: 24px;">
                            ${(stock.ticker || stock.name || '??').slice(0, 2).toUpperCase()}
                        </div>
                        <div class="trade-detail-info" style="flex: 1;">
                            <h1>${stock.name || stock.ticker || '-'}</h1>
                            <div class="ticker">${stock.ticker || '-'}</div>
                        </div>
                        <div class="list-item-stats" style="margin: 0; gap: 24px;">
                            <div class="stat-item">
                                <div class="stat-value">$${(stock.currentPrice || stock.lastClosingPrice || 0).toFixed(2)}</div>
                                <div class="stat-label">현재가</div>
                            </div>
                        </div>
                    </div>

                    <div class="chart-summary" style="display: flex; gap: 24px; margin-top: 24px; flex-wrap: wrap;">
                        <div class="chart-summary-item">
                            <span class="chart-summary-label">거래 건수</span>
                            <span class="chart-summary-value">${trades.length}건</span>
                        </div>
                        <div class="chart-summary-item">
                            <span class="chart-summary-label">거래 의원</span>
                            <span class="chart-summary-value">${politicianIds.length}명</span>
                        </div>
                        <div class="chart-summary-item">
                            <span class="chart-summary-label">거래 규모</span>
                            <span class="chart-summary-value">$${volumeSum >= 1000000 ? (volumeSum / 1000000).toFixed(1) + 'M' : volumeSum >= 1000 ? (volumeSum / 1000).toFixed(0) + 'K' : volumeSum.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div class="trade-list" style="margin-top: 32px;">
                    <div class="trade-list-header">
                        <h3 class="trade-list-title">${stock.name || stock.ticker} 거래 내역</h3>
                        <span class="text-muted">${sortedTrades.length}건</span>
                    </div>
                    <table class="trade-table">
                        <thead>
                            <tr>
                                <th>의원</th>
                                <th>공시일</th>
                                <th>거래일</th>
                                <th>지연</th>
                                <th>유형</th>
                                <th>금액 범위</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedTrades.map(t => {
                                const lag = t.tradeDate && t.disclosureDate ? Utils.daysBetween(t.tradeDate, t.disclosureDate) : '-';
                                const partyLabel = t.party === 'Democrat' ? '민주당' : t.party === 'Republican' ? '공화당' : t.party || '-';
                                return `
                                <tr onclick="Router.navigate('/trade/${t.id}')" style="cursor: pointer;">
                                    <td onclick="event.stopPropagation(); Router.navigate('/politician/${t.politicianId}');">
                                        <div style="font-weight: 600;">${t.politician || '-'}</div>
                                        <div class="text-muted" style="font-size: 12px;">${partyLabel} | ${t.state || '-'}</div>
                                    </td>
                                    <td>${Utils.formatDate(t.disclosureDate || t.filingDate)}</td>
                                    <td>${Utils.formatDate(t.tradeDate)}</td>
                                    <td>${lag !== '-' ? lag + '일' : '-'}</td>
                                    <td>
                                        <span class="trade-type ${t.type}">${t.type === 'buy' ? '매수' : '매도'}</span>
                                    </td>
                                    <td>${t.amountRange || '-'}</td>
                                    <td>
                                        <a href="#" onclick="event.preventDefault(); event.stopPropagation(); Router.navigate('/trade/${t.id}');" class="source-link">
                                            <i class="fas fa-external-link-alt"></i>
                                        </a>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                    ${sortedTrades.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-state-icon"><i class="fas fa-inbox"></i></div>
                            <h3>거래 내역이 없습니다</h3>
                        </div>
                    ` : ''}
                </div>
            </main>
        `;
    },

    // ===== Onboarding Page =====
    renderOnboardingPage(step = 1) {
        return `
            <div class="onboarding-page">
                <div class="onboarding-header">
                    <div class="onboarding-progress">
                        <div class="onboarding-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}">
                            <div class="onboarding-step-number">${step > 1 ? '✓' : '1'}</div>
                            <span>의원 팔로우</span>
                        </div>
                        <div class="onboarding-step-line ${step > 1 ? 'completed' : ''}"></div>
                        <div class="onboarding-step ${step >= 2 ? 'active' : ''}">
                            <div class="onboarding-step-number">2</div>
                            <span>관심 종목</span>
                        </div>
                    </div>
                </div>

                <div class="onboarding-content">
                    ${step === 1 ? this.renderOnboardingStep1() : this.renderOnboardingStep2()}
                </div>

                <div class="onboarding-footer">
                    ${step === 2 ? `
                        <button class="btn btn-secondary" onclick="App.onboardingBack()">
                            <i class="fas fa-arrow-left"></i> 이전
                        </button>
                    ` : '<div></div>'}
                    <button class="btn btn-primary" id="onboardingNextBtn"
                            onclick="App.onboardingNext()" ${step === 1 ? 'disabled' : ''}>
                        ${step === 2 ? '시작하기' : '다음'} <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    },

    renderOnboardingStep1() {
        const sortedPoliticians = [...MOCK_POLITICIANS].sort((a, b) => b.return10Y - a.return10Y);
        const selectedId = App.onboardingData.selectedPolitician;

        return `
            <h2 class="onboarding-title">관심 있는 의원을 선택하세요</h2>
            <p class="onboarding-subtitle">최소 1명의 의원을 팔로우해야 합니다</p>

            <div class="onboarding-list">
                ${sortedPoliticians.map(p => `
                    <div class="onboarding-item ${selectedId === p.id ? 'selected' : ''}"
                         onclick="App.selectOnboardingPolitician(${p.id})">
                        <div class="onboarding-item-check"></div>
                        <div class="list-item-avatar" style="width: 48px; height: 48px; font-size: 18px;">
                            ${Utils.getInitials(p.name)}
                        </div>
                        <div class="list-item-info" style="flex: 1;">
                            <div class="list-item-name">${p.name}</div>
                            <div class="list-item-meta">
                                <span class="${p.party === 'Democrat' ? 'text-primary' : 'text-danger'}">
                                    ${p.party === 'Democrat' ? '민주당' : '공화당'}
                                </span>
                                <span>${p.chamber}</span>
                            </div>
                        </div>
                        <div class="stat-item" style="text-align: right;">
                            <div class="stat-value text-success">${Utils.formatPercent(p.return10Y)}</div>
                            <div class="stat-label">10년 수익률</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderOnboardingStep2() {
        const watchlist = App.onboardingData.selectedStocks || [];

        return `
            <h2 class="onboarding-title">관심 종목을 담아보세요</h2>
            <p class="onboarding-subtitle">선택 사항입니다. 나중에 추가할 수 있어요.</p>

            <div class="search-box mb-3">
                <i class="fas fa-search"></i>
                <input type="text" id="stockSearchInput" placeholder="티커 또는 종목명 검색..."
                       oninput="App.searchOnboardingStocks(this.value)">
            </div>

            <div class="onboarding-list" id="stockList">
                ${MOCK_STOCKS.map(s => `
                    <div class="onboarding-item ${watchlist.includes(s.id) ? 'selected' : ''}"
                         onclick="App.toggleOnboardingStock(${s.id})">
                        <div class="onboarding-item-check"></div>
                        <div class="ticker-logo" style="width: 48px; height: 48px; font-size: 16px;">
                            ${s.ticker.slice(0, 2)}
                        </div>
                        <div class="list-item-info" style="flex: 1;">
                            <div class="list-item-name">${s.ticker}</div>
                            <div class="list-item-meta">
                                <span>${s.name}</span>
                                <span>${s.sector}</span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="stat-value">$${s.currentPrice.toFixed(2)}</div>
                            <div class="stat-label ${s.dailyChange >= 0 ? 'text-success' : 'text-danger'}">
                                ${Utils.formatPercent(s.dailyChange)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ===== Settings Page =====
    renderSettingsPage() {
        const settings = UserData.getSettings();
        const user = Auth.getUser();

        return `
            ${this.renderHeader()}
            <main class="settings-page container">
                <div class="page-header">
                    <h1 class="page-title">설정</h1>
                </div>

                <div class="settings-section">
                    <h3 class="settings-section-title">계정 정보</h3>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <h4>이메일</h4>
                            <p>${user ? user.email : '-'}</p>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-section-title">알림 설정</h3>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <h4>이메일 알림</h4>
                            <p>팔로우한 의원의 새로운 거래 알림을 받습니다</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.emailAlerts ? 'checked' : ''}
                                   onchange="App.updateSetting('emailAlerts', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <h4>주간 뉴스레터</h4>
                            <p>매주 토요일 주간 요약 뉴스레터를 받습니다</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.newsletter ? 'checked' : ''}
                                   onchange="App.updateSetting('newsletter', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-section-title">구독</h3>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <h4>현재 플랜</h4>
                            <p>무료 플랜</p>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="App.showPaywall()">
                            <i class="fas fa-crown"></i> 프리미엄 업그레이드
                        </button>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-section-title">계정 관리</h3>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <h4>로그아웃</h4>
                            <p>현재 기기에서 로그아웃합니다</p>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="App.handleLogout()">
                            로그아웃
                        </button>
                    </div>
                </div>
            </main>
        `;
    },

    // ===== Paywall Modal =====
    renderPaywall() {
        return `
            <div class="paywall-overlay" onclick="App.closePaywall(event)">
                <div class="paywall-modal" onclick="event.stopPropagation()">
                    <div class="paywall-header">
                        <h2><i class="fas fa-gift" style="color: #10b981;"></i> 무료 이용권 증정</h2>
                        <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.6; margin-top: 12px;">
                            지금 웹사이트 테스트 중인데 이메일 남겨주시면<br>
                            <strong style="color: var(--primary);">3개월 무료 이용권</strong>을 증정하고 있습니다!
                        </p>
                    </div>

                    <div style="background: var(--bg-tertiary); border-radius: var(--border-radius); padding: 20px; margin: 24px 0;">
                        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">
                            <i class="fas fa-check-circle" style="color: var(--success); margin-right: 8px;"></i>
                            포함된 기능
                        </h3>
                        <ul class="plan-features" style="margin: 0; padding: 0;">
                            <li><i class="fas fa-check"></i> 무제한 의원 팔로우</li>
                            <li><i class="fas fa-check"></i> 실시간 거래 알림</li>
                            <li><i class="fas fa-check"></i> 주간 뉴스레터</li>
                            <li><i class="fas fa-check"></i> 전 기간 그래프 조회</li>
                            <li><i class="fas fa-check"></i> 프리미엄 리포트</li>
                        </ul>
                    </div>

                    <div class="form-group" style="margin-top: 24px;">
                        <label class="form-label" for="subscription-email">
                            <i class="fas fa-envelope" style="margin-right: 6px;"></i> 이메일 주소
                        </label>
                        <input 
                            type="email" 
                            id="subscription-email" 
                            class="form-input" 
                            placeholder="example@email.com"
                            oninput="App.validateSubscriptionEmail(this.value)"
                        />
                        <div id="subscription-email-error" class="form-error" style="display: none;"></div>
                        <p style="color: var(--text-muted); font-size: 12px; margin-top: 6px;">
                            무료 이용권 정보를 이메일로 발송해드립니다.
                        </p>
                    </div>

                    <button class="btn btn-primary btn-block mt-3" id="subscription-submit-btn" onclick="App.proceedToCheckout()">
                        무료 이용권 받기
                    </button>
                    <button class="btn btn-secondary btn-block mt-2" onclick="App.closePaywall()">
                        나중에 하기
                    </button>
                </div>
            </div>
        `;
    }
};
