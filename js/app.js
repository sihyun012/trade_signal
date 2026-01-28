// ===== Main Application =====

const App = {
    currentTab: 'politicians',
    currentSort: 'return',
    currentFilter: 'all',
    searchQuery: '',
    onboardingStep: 1,
    onboardingData: {
        selectedPolitician: null,
        selectedStocks: []
    },
    selectedPlan: 'yearly',
    subscriptionEmail: '',

    // Initialize app
    async init() {
        Toast.init();

        // ?? ?? ??
        document.getElementById('app').innerHTML = `
            <div class="login-page">
                <div class="login-container text-center">
                    <div class="login-logo">
                        <h1><i class="fas fa-chart-line"></i> Trade Signal</h1>
                        <p>데이터를 불러오는 중...</p>
                    </div>
                    <div class="spinner" style="margin: 40px auto;"></div>
                </div>
            </div>
        `;

        // CSV ??? ??
        await loadCSVData();

        // Register routes
        Router.register('/login', () => this.showLoginPage());
        Router.register('/signup', () => this.showLoginPage());
        Router.register('/', () => this.showHomePage());
        Router.register('/politician/:id', (ctx) => this.showPoliticianPage(ctx.params.id));
        Router.register('/trade/:id', (ctx) => this.showTradePage(ctx.params.id));
        Router.register('/stock/:id', (ctx) => this.showStockPage(ctx.params.id));
        Router.register('/onboarding', () => this.showOnboardingPage());
        Router.register('/settings', () => this.showSettingsPage());
        Router.register('/subscription', () => this.showSubscriptionPage());

        // GA4 페이지 제목: 의원명·종목명·거래명 등 실제 이름 노출
        Router.setPageTitleResolver((path, matchedRoute, params) => {
            switch (matchedRoute) {
                case '/politician/:id': {
                    const p = (typeof MOCK_POLITICIANS !== 'undefined') && MOCK_POLITICIANS.find(pp => pp.id === parseInt(params.id, 10));
                    return p ? `의원 - ${p.name}` : null;
                }
                case '/stock/:id': {
                    const s = (typeof MOCK_STOCKS !== 'undefined') && MOCK_STOCKS.find(ss => ss.id === parseInt(params.id, 10));
                    return s ? `종목 - ${s.name || s.ticker || params.id}` : null;
                }
                case '/trade/:id': {
                    const t = (typeof MOCK_TRADES !== 'undefined') && MOCK_TRADES.find(tt => tt.id === parseInt(params.id, 10));
                    if (!t) return null;
                    const parts = [t.stockName || t.ticker, t.politician].filter(Boolean);
                    return parts.length ? `거래 - ${parts.join(' / ')}` : `거래 - ${params.id}`;
                }
                case '/': return '홈';
                case '/onboarding': return '온보딩';
                case '/settings': return '설정';
                case '/login':
                case '/signup': return '로그인';
                default: return null;
            }
        });

        Router.init();

        // ??? ?? ??? ?? ?? ??? ??
        const hash = window.location.hash.slice(1);
        if (!hash || hash === '/') {
            if (!Auth.isOnboardingCompleted()) {
                Router.navigate('/onboarding');
            } else {
                Router.navigate('/');
            }
        }

        Auth.trackEvent('app_init', {
            event_category: 'app',
            timestamp: new Date().toISOString(),
            user_authenticated: Auth.isAuthenticated(),
            onboarding_completed: Auth.isOnboardingCompleted()
        });
    },

    // ===== Page Renderers =====

    showLoginPage() {
        if (Auth.isAuthenticated()) {
            Router.navigate('/');
            return;
        }
        document.getElementById('app').innerHTML = Components.renderLoginPage();
        Auth.trackEvent('auth_check');
    },

    async showHomePage() {
        document.getElementById('app').innerHTML = Components.renderHomePage();

        // Simulate loading
        await Auth.delay(500);
        this.renderList();

        Auth.trackEvent('list_view', {
            event_category: 'navigation',
            tab: this.currentTab,
            filter: this.currentFilter,
            sort: this.currentSort
        });
    },

    async showPoliticianPage(id) {
        const politician = MOCK_POLITICIANS.find(p => p.id === parseInt(id));

        if (!politician) {
            Toast.show('의원을 찾을 수 없습니다다.', 'error');
            Router.navigate('/');
            return;
        }

        document.getElementById('app').innerHTML = Components.renderPoliticianProfile(politician);

        // Draw chart after render
        await Auth.delay(100);
        this.drawPerformanceChart(politician);

        Auth.trackEvent('view_politician_profile', {
            politicianId: id,
            politician_name: politician.name,
            party: politician.party,
            event_category: 'engagement',
            content_type: 'politician'
        });
    },

    async showTradePage(id) {
        const trade = MOCK_TRADES.find(t => t.id === parseInt(id));

        if (!trade) {
            Toast.show('거래를 찾을 수 없습니다다.', 'error');
            Router.navigate('/');
            return;
        }

        document.getElementById('app').innerHTML = Components.renderTradeDetail(trade);

        // Draw chart after render (?? ??? API ??)
        await Auth.delay(100);
        await this.drawStockChart(trade);

        Auth.trackEvent('trade_detail_view', {
            tradeId: id,
            ticker: trade.ticker,
            trade_type: trade.type,
            politician: trade.politician,
            event_category: 'engagement',
            content_type: 'trade'
        });
    },

    showStockPage(id) {
        const stock = MOCK_STOCKS.find(s => s.id === parseInt(id));
        if (!stock) {
            Toast.show('종목을 찾을 수 없습니다.', 'error');
            Router.navigate('/');
            return;
        }
        const trades = MOCK_TRADES.filter(t => t.ticker === stock.ticker || (t.stockName && stock.name && t.stockName === stock.name));
        document.getElementById('app').innerHTML = Components.renderStockDetail(stock, trades);
        Auth.trackEvent('view_stock_detail', {
            stockId: id,
            ticker: stock.ticker,
            stock_name: stock.name,
            sector: stock.sector,
            event_category: 'engagement',
            content_type: 'stock'
        });
    },

    showOnboardingPage() {
        if (!window.onboardingStartTime) {
            window.onboardingStartTime = Date.now();
        }
        document.getElementById('app').innerHTML = Components.renderOnboardingPage(this.onboardingStep);
        Auth.trackEvent('onboarding_step_view', {
            event_category: 'onboarding',
            step: this.onboardingStep,
            step_name: this.onboardingStep === 1 ? 'politician_selection' : 'stock_selection'
        });
    },

    showSettingsPage() {
        document.getElementById('app').innerHTML = Components.renderSettingsPage();
        Auth.trackEvent('settings_view', {
            event_category: 'navigation',
            page: 'settings'
        });
    },

    showSubscriptionPage() {
        this.showPaywall();
        Router.navigate('/settings');
    },

    // ===== Authentication Handlers =====

    async handleEmailLogin(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        const btn = document.getElementById('loginBtn');

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';
        errorEl.style.display = 'none';

        try {
            await Auth.login(email, password);
            Toast.show('로그인 성공!', 'success');

            if (!Auth.isOnboardingCompleted()) {
                Router.navigate('/onboarding');
            } else {
                Router.navigate('/');
            }
        } catch (error) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
            Auth.trackEvent('login_fail', {
                event_category: 'authentication',
                error_type: error.message,
                method: 'email'
            });
        } finally {
            btn.disabled = false;
            btn.innerHTML = '???';
        }
    },

    async handleEmailSignup(event) {
        event.preventDefault();

        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupPasswordConfirm').value;
        const termsAgreed = document.getElementById('termsAgreed').checked;
        const errorEl = document.getElementById('signupError');
        const btn = document.getElementById('signupBtn');

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';
        errorEl.style.display = 'none';

        try {
            await Auth.signup(email, password, confirmPassword, termsAgreed);
            Toast.show('회원가입 성공!', 'success');
            Router.navigate('/onboarding');
        } catch (error) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
            Auth.trackEvent('signup_fail', {
                event_category: 'authentication',
                error_type: error.message,
                method: 'email'
            });
        } finally {
            btn.disabled = false;
            btn.innerHTML = '????';
        }
    },

    async handleGoogleLogin() {
        try {
            await Auth.loginWithGoogle();
            Toast.show('Google 로그인 성공!', 'success');

            if (!Auth.isOnboardingCompleted()) {
                Router.navigate('/onboarding');
            } else {
                Router.navigate('/');
            }
        } catch (error) {
            Toast.show('로그인이 취소되었습니다. 다시 진행해 주세요.', 'error');
            Auth.trackEvent('google_oauth_fail', {
                event_category: 'authentication',
                method: 'google',
                error_type: error.message || 'unknown'
            });
        }
    },

    handleLogout() {
        Auth.logout();
        Toast.show('로그아웃되었습니다.', 'info');
        Router.navigate('/login');
    },

    // ===== Home Page Handlers =====

    switchHomeTab(tab) {
        this.currentTab = tab;

        const tabs = document.querySelectorAll('.tabs .tab');
        tabs.forEach(t => t.classList.remove('active'));
        tabs[tab === 'politicians' ? 0 : 1].classList.add('active');

        // Update filter options
        const partyFilter = document.getElementById('partyFilter');
        if (tab === 'stocks') {
            partyFilter.innerHTML = `
                <option value="all">?? ??</option>
                <option value="Technology">??</option>
                <option value="Financial Services">??</option>
                <option value="Consumer Cyclical">???</option>
                <option value="Automotive">???</option>
            `;
        } else {
            partyFilter.innerHTML = `
                <option value="all">?? ??</option>
                <option value="Democrat">???</option>
                <option value="Republican">???</option>
            `;
        }

        this.currentFilter = 'all';
        this.renderList();

        Auth.trackEvent('tab_changed', {
            event_category: 'navigation',
            tab: tab,
            previous_tab: this.currentTab === 'politicians' ? 'stocks' : 'politicians'
        });
    },

    handleSearch: Utils.debounce(function(query) {
        App.searchQuery = query.toLowerCase();
        App.renderList();
        Auth.trackEvent('search_submitted', {
            event_category: 'search',
            search_term: query,
            search_length: query.length,
            tab: App.currentTab
        });
    }, 300),

    handleSort(sortBy) {
        this.currentSort = sortBy;
        this.renderList();
        Auth.trackEvent('sort_changed', {
            event_category: 'interaction',
            sort_by: sortBy,
            tab: this.currentTab
        });
    },

    handleFilter(filter) {
        this.currentFilter = filter;
        this.renderList();
        Auth.trackEvent('filter_changed', {
            event_category: 'interaction',
            filter_value: filter,
            tab: this.currentTab
        });
    },

    renderList() {
        const container = document.getElementById('listContainer');
        if (!container) return;

        if (this.currentTab === 'politicians') {
            let data = [...MOCK_POLITICIANS];

            // Filter
            if (this.currentFilter !== 'all') {
                data = data.filter(p => p.party === this.currentFilter);
            }

            // Search
            if (this.searchQuery) {
                data = data.filter(p =>
                    p.name.toLowerCase().includes(this.searchQuery) ||
                    p.state.toLowerCase().includes(this.searchQuery)
                );
            }

            // Sort
            switch (this.currentSort) {
                case 'return':
                    data.sort((a, b) => b.return10Y - a.return10Y);
                    break;
                case 'trades':
                    data.sort((a, b) => b.totalTrades - a.totalTrades);
                    break;
                case 'recent':
                    data.sort((a, b) => new Date(b.lastTradeDate) - new Date(a.lastTradeDate));
                    break;
                case 'name':
                    data.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }

            container.innerHTML = Components.renderPoliticianList(data);
        } else {
            let data = [...MOCK_STOCKS];

            // Filter
            if (this.currentFilter !== 'all') {
                data = data.filter(s => s.sector === this.currentFilter);
            }

            // Search
            if (this.searchQuery) {
                data = data.filter(s =>
                    s.ticker.toLowerCase().includes(this.searchQuery) ||
                    s.name.toLowerCase().includes(this.searchQuery)
                );
            }

            // Sort
            switch (this.currentSort) {
                case 'return':
                    data.sort((a, b) => b.dailyChange - a.dailyChange);
                    break;
                case 'trades':
                    data.sort((a, b) => b.tradeCount - a.tradeCount);
                    break;
                case 'recent':
                    data.sort((a, b) => new Date(b.lastTradeDate) - new Date(a.lastTradeDate));
                    break;
                case 'name':
                    data.sort((a, b) => a.ticker.localeCompare(b.ticker));
                    break;
            }

            container.innerHTML = Components.renderStockList(data);
        }
    },

    toggleFollow(politicianId, event) {
        if (event) event.stopPropagation();

        const result = UserData.toggleFollowPolitician(politicianId);

        if (!result.success) {
            Toast.show(result.error, 'error');
            this.showPaywall();
            Auth.trackEvent('follow_limit_hit', {
                event_category: 'conversion',
                limit_type: 'free_plan',
                current_follows: UserData.getFollowedPoliticians().length,
                action: 'follow_politician'
            });
            return;
        }

        if (result.following) {
            Toast.show('팔로우했습니다.', 'success');
        } else {
            Toast.show('팔로우를 취소했습니다.', 'info');
        }

        // Re-render if on home page
        if (Router.currentRoute === '/') {
            this.renderList();
        } else {
            // Update button state on profile page
            const btn = event.target.closest('.follow-btn') || event.target.closest('.btn');
            if (btn) {
                btn.classList.toggle('following');
                btn.classList.toggle('btn-primary');
                btn.classList.toggle('btn-outline');
                const icon = btn.querySelector('i');
                icon.className = result.following ? 'fas fa-check' : 'fas fa-plus';
                btn.innerHTML = `<i class="fas fa-${result.following ? 'check' : 'plus'}"></i> ${result.following ? '팔로잉' : '팔로우'}`;
            }
        }

        Auth.trackEvent('follow_toggle', {
            event_category: 'engagement',
            politician_id: politicianId,
            following: result.following,
            action: result.following ? 'follow' : 'unfollow'
        });
    },

    toggleWatchlist(stockId, event) {
        if (event) event.stopPropagation();

        const result = UserData.toggleWatchlist(stockId);

        if (result.watching) {
            Toast.show('관심 종목에 추가했습니다.', 'success');
        } else {
            Toast.show('관심 종목에서 취소했습니다.', 'info');
        }

        this.renderList();
        Auth.trackEvent('watchlist_toggle', {
            event_category: 'engagement',
            stock_id: stockId,
            watching: result.watching,
            action: result.watching ? 'add' : 'remove'
        });
    },

    // ===== Onboarding Handlers =====

    selectOnboardingPolitician(id) {
        this.onboardingData.selectedPolitician = id;

        // Update UI
        document.querySelectorAll('.onboarding-item').forEach(item => {
            item.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');

        // Enable next button
        document.getElementById('onboardingNextBtn').disabled = false;

        Auth.trackEvent('onboarding_follow_select', { politicianId: id });
    },

    toggleOnboardingStock(id) {
        const index = this.onboardingData.selectedStocks.indexOf(id);
        if (index > -1) {
            this.onboardingData.selectedStocks.splice(index, 1);
        } else {
            this.onboardingData.selectedStocks.push(id);
        }

        // Update UI
        event.currentTarget.classList.toggle('selected');

        Auth.trackEvent('onboarding_ticker_select', {
            event_category: 'onboarding',
            stock_id: id,
            step: 2,
            total_selected: this.onboardingData.selectedStocks.length
        });
    },

    searchOnboardingStocks(query) {
        const filtered = MOCK_STOCKS.filter(s =>
            s.ticker.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase())
        );

        const watchlist = this.onboardingData.selectedStocks;
        document.getElementById('stockList').innerHTML = filtered.map(s => `
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
        `).join('');

        Auth.trackEvent('onboarding_ticker_search_submit', {
            event_category: 'onboarding',
            search_term: query,
            search_length: query.length,
            step: 2
        });
    },

    onboardingNext() {
        if (this.onboardingStep === 1) {
            if (!this.onboardingData.selectedPolitician) {
                Toast.show('?의원 1명을 선택해주세요요.', 'error');
                return;
            }

            // Save follow
            UserData.toggleFollowPolitician(this.onboardingData.selectedPolitician);

            this.onboardingStep = 2;
            this.showOnboardingPage();
        } else {
            // Save watchlist
            this.onboardingData.selectedStocks.forEach(id => {
                const watchlist = UserData.getWatchlist();
                if (!watchlist.includes(id)) {
                    UserData.toggleWatchlist(id);
                }
            });

            // Complete onboarding
            Auth.completeOnboarding();
            Toast.show('온보딩 완료!', 'success');
            Router.navigate('/');

            Auth.trackEvent('onboarding_complete', {
                event_category: 'onboarding',
                politicians_selected: 1,
                stocks_selected: this.onboardingData.selectedStocks.length,
                total_time_seconds: Math.round((Date.now() - (window.onboardingStartTime || Date.now())) / 1000)
            });
        }
    },

    onboardingBack() {
        this.onboardingStep = 1;
        this.showOnboardingPage();
    },

    // ===== Settings Handlers =====

    updateSetting(key, value) {
        UserData.updateSettings({ [key]: value });
        Toast.show('알림 설정 완료', 'success');

        if (key === 'emailAlerts') {
            Auth.trackEvent(value ? 'email_subscribe' : 'email_unsubscribe', {
                event_category: 'engagement',
                source: 'inapp',
                setting_type: 'email_alerts'
            });
        } else if (key === 'newsletter') {
            Auth.trackEvent(value ? 'newsletter_subscribe' : 'newsletter_unsubscribe', {
                event_category: 'engagement',
                setting_type: 'newsletter'
            });
        }
    },

    // ===== Paywall Handlers =====

    showPaywall() {
        const paywallEl = document.createElement('div');
        paywallEl.id = 'paywallModal';
        paywallEl.innerHTML = Components.renderPaywall();
        document.body.appendChild(paywallEl);

        // ??? ?? ?? ??? ? ??? ??? ??? ?? ???
        const emailInput = document.getElementById('subscription-email');
        const submitBtn = document.getElementById('subscription-submit-btn');
        
        // ???? ???? ??? ?? ???
        const user = Auth.getUser();
        if (emailInput) {
            if (user && user.email) {
                emailInput.value = user.email;
                this.validateSubscriptionEmail(user.email);
            } else {
                emailInput.value = '';
            }
        }
        
        // ???? ??? ?? ????
        if (submitBtn && (!emailInput || !emailInput.value.trim())) {
            submitBtn.disabled = true;
        }

        Auth.trackEvent('paywall_view', {
            event_category: 'conversion',
            source: Router.currentRoute || 'unknown'
        });
    },

    closePaywall(event) {
        if (event && event.target !== event.currentTarget) return;
        const modal = document.getElementById('paywallModal');
        if (modal) modal.remove();
    },

    selectPlan(plan) {
        this.selectedPlan = plan;

        document.querySelectorAll('.plan-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');

        Auth.trackEvent('click_paywall', { plan });
    },

    validateSubscriptionEmail(email) {
        const emailInput = document.getElementById('subscription-email');
        const errorDiv = document.getElementById('subscription-email-error');
        const submitBtn = document.getElementById('subscription-submit-btn');
        
        if (!email || !email.trim()) {
            errorDiv.textContent = '이메일 주소를 입력해주세요.';
            errorDiv.style.display = 'block';
            emailInput.classList.add('error');
            if (submitBtn) submitBtn.disabled = true;
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorDiv.textContent = '올바른 양식이 아닙니다.';
            errorDiv.style.display = 'block';
            emailInput.classList.add('error');
            if (submitBtn) submitBtn.disabled = true;
            return false;
        }

        errorDiv.style.display = 'none';
        emailInput.classList.remove('error');
        this.subscriptionEmail = email.trim();
        if (submitBtn) submitBtn.disabled = false;
        return true;
    },

    proceedToCheckout() {
        const emailInput = document.getElementById('subscription-email');
        const email = emailInput ? emailInput.value.trim() : '';

        if (!this.validateSubscriptionEmail(email)) {
            return;
        }

        this.subscriptionEmail = email;
        Toast.show('결제 페이지로 이동합니다...', 'info');
        this.closePaywall();

        // ?? ??? ??? ?? ??
        Auth.trackEvent('free_trial_email_submitted', {
            event_category: 'conversion',
            email: this.subscriptionEmail,
            source: 'paywall_modal'
        });
    },

    // Chart.js ???? ??
    performanceChart: null,
    stockChart: null,

    // ===== Chart Drawing =====

    drawPerformanceChart(politician) {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // ?? ?? ??
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        // ????? ?? ??? ??
        const { politicianData, sp500Data } = generatePoliticianPerformanceData(politician.id);

        // ???? ??? ????? ??? ??
        let chartPoliticianData, chartSp500Data;

        if (politicianData.length > 0 && sp500Data.length > 0) {
            chartPoliticianData = politicianData;
            chartSp500Data = sp500Data;
        } else {
            // ????? ??? ??
            const startValue = 100;
            const simData = generateChartData('2016-01-01', '2026-01-01', startValue);
            const finalValue = startValue * (1 + (politician.return10Y || 50) / 100);
            const scale = finalValue / simData[simData.length - 1].value;

            chartPoliticianData = simData.filter((d, i) => i % 30 === 0).map(d => ({
                date: d.date,
                value: d.value * scale
            }));

            chartSp500Data = SP500_DATA.length > 0
                ? SP500_DATA.filter((d, i) => i % 30 === 0).map(d => ({
                    date: d.date,
                    value: (d.value / SP500_DATA[0].value) * 100
                }))
                : chartPoliticianData.map(d => ({ date: d.date, value: 100 + Math.random() * 150 }));
        }

        // ?? ??? ?? (0?? ??? ??)
        const pFirst = chartPoliticianData.length > 0 ? chartPoliticianData[0].value : 0;
        const pLast = chartPoliticianData.length > 0 ? chartPoliticianData[chartPoliticianData.length - 1].value : 0;
        const politicianFinalReturn = (chartPoliticianData.length > 0 && pFirst > 0 && Number.isFinite(pLast / pFirst))
            ? ((pLast / pFirst - 1) * 100).toFixed(1)
            : '0.0';
        const sFirst = chartSp500Data.length > 0 ? chartSp500Data[0].value : 0;
        const sLast = chartSp500Data.length > 0 ? chartSp500Data[chartSp500Data.length - 1].value : 0;
        const sp500FinalReturn = (chartSp500Data.length > 0 && sFirst > 0 && Number.isFinite(sLast / sFirst))
            ? ((sLast / sFirst - 1) * 100).toFixed(1)
            : '0.0';
        const fmtPct = (v) => { const n = parseFloat(v); return (Number.isFinite(n) ? (n >= 0 ? '+' : '') + n + '%' : '-'); };

        // Chart.js ??
        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartPoliticianData.map(d => d.date),
                datasets: [
                    {
                        label: `${politician.name} (${fmtPct(politicianFinalReturn)})`,
                        data: chartPoliticianData.map(d => d.value),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#3b82f6',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    },
                    {
                        label: `S&P 500 (${fmtPct(sp500FinalReturn)})`,
                        data: chartSp500Data.map(d => d.value),
                        borderColor: '#64748b',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.3,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: '#64748b',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            color: '#e2e8f0',
                            font: { family: 'Inter', size: 12 },
                            usePointStyle: true,
                            pointStyle: 'line',
                            padding: 20
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleColor: '#f8fafc',
                        bodyColor: '#e2e8f0',
                        borderColor: '#475569',
                        borderWidth: 1,
                        padding: 12,
                        titleFont: { family: 'Inter', size: 13, weight: '600' },
                        bodyFont: { family: 'Inter', size: 12 },
                        displayColors: true,
                        callbacks: {
                            title: function(tooltipItems) {
                                const date = tooltipItems[0].label;
                                return new Date(date).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                const change = (value - 100).toFixed(1);
                                const sign = change >= 0 ? '+' : '';
                                return ` ${context.dataset.label.split(' (')[0]}: ${value.toFixed(1)} (${sign}${change}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        grid: {
                            display: true,
                            color: 'rgba(71, 85, 105, 0.3)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 11 },
                            maxRotation: 0,
                            callback: function(value, index, ticks) {
                                const date = this.getLabelForValue(value);
                                const year = date.substring(0, 4);
                                // ?? ?? (?? ??? ??)
                                if (index === 0) return year;
                                const prevDate = this.getLabelForValue(ticks[index - 1].value);
                                const prevYear = prevDate.substring(0, 4);
                                return year !== prevYear ? year : '';
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: true,
                            color: 'rgba(71, 85, 105, 0.3)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 11 },
                            callback: function(value) {
                                return value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });

        // ?? ?? ????
        this.updateChartSummary(politician, politicianFinalReturn, sp500FinalReturn);
    },

    updateChartSummary(politician, politicianReturn, sp500Return) {
        const summaryEl = document.getElementById('chartSummary');
        if (!summaryEl) return;

        const p = parseFloat(politicianReturn);
        const s = parseFloat(sp500Return);
        const excess = (Number.isFinite(p) && Number.isFinite(s) ? (p - s).toFixed(1) : '0.0');
        const isOutperforming = parseFloat(excess) > 0;
        const fmt = (v) => (Number.isFinite(parseFloat(v)) ? (parseFloat(v) >= 0 ? '+' : '') + parseFloat(v) + '%' : '-');

        summaryEl.innerHTML = `
            <div class="chart-summary-item">
                <span class="chart-summary-label">${politician.name}</span>
                <span class="chart-summary-value text-primary">${fmt(politicianReturn)}</span>
            </div>
            <div class="chart-summary-item">
                <span class="chart-summary-label">S&P 500</span>
                <span class="chart-summary-value">${fmt(sp500Return)}</span>
            </div>
            <div class="chart-summary-item">
                <span class="chart-summary-label">초과 수익익 <span class="text-muted" style="font-size:0.85em">(???)</span></span>
                <span class="chart-summary-value ${isOutperforming ? 'text-success' : 'text-danger'}">
                    ${isOutperforming ? '+' : ''}${excess}%
                </span>
            </div>
        `;
    },

    async drawStockChart(trade) {
        const canvas = document.getElementById('stockChart');
        const container = document.getElementById('stockChartContainer');
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        const rect = container.getBoundingClientRect();
        const width = Math.floor(rect.width) || 400;
        const height = Math.floor(rect.height) || 400;
        canvas.width = width;
        canvas.height = height;

        const padding = 40;
        const startPrice = (trade.closingPrice && trade.closingPrice > 0) ? trade.closingPrice : 100;
        const endDateStr = new Date().toISOString().split('T')[0];

        // 1) Yahoo Finance API(?? /api/stock/<ticker>)? ?? ??? ????
        let priceData = [];
        let usedApi = false;
        if (trade.ticker) {
            try {
                const url = `/api/stock?ticker=${encodeURIComponent(trade.ticker)}&from=${encodeURIComponent(trade.tradeDate || '')}&to=${encodeURIComponent(endDateStr)}`;
                const startTime = performance.now();
                
                Auth.trackEvent('api_call', {
                    event_category: 'api',
                    api_endpoint: '/api/stock',
                    ticker: trade.ticker,
                    method: 'GET'
                });
                
                const res = await fetch(url);
                const endTime = performance.now();
                const duration = Math.round(endTime - startTime);
                
                if (res.ok) {
                    const json = await res.json();
                    if (json.data && json.data.length > 0) {
                        priceData = json.data.map(d => ({ date: d.date, value: d.close }));
                        usedApi = true;
                        
                        Auth.trackEvent('api_success', {
                            event_category: 'api',
                            api_endpoint: '/api/stock',
                            ticker: trade.ticker,
                            response_time_ms: duration,
                            data_points: json.data.length
                        });
                    } else {
                        Auth.trackEvent('api_empty_response', {
                            event_category: 'api',
                            api_endpoint: '/api/stock',
                            ticker: trade.ticker
                        });
                    }
                } else {
                    Auth.trackEvent('api_error', {
                        event_category: 'api',
                        api_endpoint: '/api/stock',
                        ticker: trade.ticker,
                        status_code: res.status,
                        response_time_ms: duration
                    });
                }
            } catch (error) {
                Auth.trackEvent('api_exception', {
                    event_category: 'api',
                    api_endpoint: '/api/stock',
                    ticker: trade.ticker,
                    error_message: error.message
                });
            }
        }

        // 2) API ???? ??? ????? ??? ??
        if (priceData.length === 0) {
            priceData = generateChartData(trade.tradeDate, endDateStr, startPrice);
            if (priceData.length === 0 && trade.tradeDate) {
                const d = new Date(trade.tradeDate);
                d.setDate(d.getDate() + 30);
                const fallbackEnd = d.toISOString().split('T')[0];
                priceData = generateChartData(trade.tradeDate, fallbackEnd, startPrice);
            }
        }

        if (priceData.length === 0) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('주가 데이터를 불러올 수 없습니다.', width / 2, height / 2);
            return;
        }

        // ????? ???? ?? CURRENT_PRICES? ??. ?? API ???? ??? ??
        if (!usedApi) {
            const lastVal = priceData[priceData.length - 1].value;
            const currentPrice = (typeof CURRENT_PRICES !== 'undefined' && trade.ticker && CURRENT_PRICES[trade.ticker] > 0)
                ? CURRENT_PRICES[trade.ticker]
                : (lastVal || startPrice);
            if (lastVal > 0) {
                const scaleFactor = currentPrice / lastVal;
                priceData.forEach(d => { d.value *= scaleFactor; });
            }
        }

        const minValue = Math.min(...priceData.map(d => d.value)) * 0.98;
        const maxValue = Math.max(...priceData.map(d => d.value)) * 1.02;
        const range = maxValue - minValue || 1;
        const n = priceData.length;
        const div = n > 1 ? n - 1 : 1;

        // Clear canvas
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height - 2 * padding) * (i / 4);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            const value = maxValue - range * (i / 4);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px Inter';
            ctx.textAlign = 'left';
            ctx.fillText('$' + value.toFixed(0), 5, y + 4);
        }

        // Draw price line
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        priceData.forEach((d, i) => {
            const x = padding + (width - 2 * padding) * (i / div);
            const y = padding + (height - 2 * padding) * (1 - (d.value - minValue) / range);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw trade date marker
        const tradeDateIndex = priceData.findIndex(d => d.date === trade.tradeDate);
        if (tradeDateIndex >= 0) {
            const x = padding + (width - 2 * padding) * (tradeDateIndex / div);
            const y = padding + (height - 2 * padding) * (1 - (priceData[tradeDateIndex].value - minValue) / range);
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw disclosure date marker
        const disclosureDateIndex = priceData.findIndex(d => d.date === trade.disclosureDate);
        if (disclosureDateIndex >= 0) {
            const x = padding + (width - 2 * padding) * (disclosureDateIndex / div);
            const y = padding + (height - 2 * padding) * (1 - (priceData[disclosureDateIndex].value - minValue) / range);
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    switchChartType(type) {
        const btns = document.querySelectorAll('.chart-toggle-btn');
        btns.forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');

        Toast.show(`${type === 'trade' ? '거래일' : '공개일'} 기준으로 표시`, 'info');
        Auth.trackEvent('view_compare_chart', {
            event_category: 'interaction',
            chart_type: type,
            view_type: type === 'trade' ? 'trade_date' : 'disclosure_date'
        });
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
