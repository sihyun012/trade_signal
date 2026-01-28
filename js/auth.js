// ===== Authentication Module =====

const Auth = {
    TOKEN_KEY: 'trade_signal_token',
    USER_KEY: 'trade_signal_user',
    ONBOARDING_KEY: 'trade_signal_onboarding',

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp < Date.now() / 1000) {
                this.logout();
                return false;
            }
            return true;
        } catch (e) {
            this.logout();
            return false;
        }
    },

    // Get current user
    getUser() {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if onboarding is completed
    isOnboardingCompleted() {
        const onboarding = localStorage.getItem(this.ONBOARDING_KEY);
        return onboarding === 'completed';
    },

    // Complete onboarding
    completeOnboarding() {
        localStorage.setItem(this.ONBOARDING_KEY, 'completed');
    },

    // Generate mock JWT token
    generateToken(userId) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        }));
        const signature = btoa('mock_signature');
        return `${header}.${payload}.${signature}`;
    },

    // Email/Password Login
    async login(email, password) {
        // Simulate API call delay
        await this.delay(800);

        // Basic validation
        if (!email || !password) {
            throw new Error('占쎈쐻占쎈윪��얠쥉異�嚥▲꺂毓쇔뜝�럥�럡 占쎈쐻占쎈윪�뤃�꽒�쐻占쎈윥獒뺧옙 �뜝�럥�몡�넭怨ｋ쳟占쎌굲占쎈쐻占쎈쓠�뵳怨ㅼ삕占쎌맇�뜝�럡�돭�뜝�럥�걫占쎈쐻�뜝占� 占쎈쐻占쎈윪�굢占쏙옙�쐻占쎈윪占쎌죷占쎈쐻占쎈윥占쎈뤅 占쎌뜏占쎌뒩占쎈땾占쎈빝�뜝�뜴�쐻占쎈윪占쎈��.');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('占쎈쐻占쎈윪��얠쥉異�嚥▲꺂毓쇔뜝�럥�럡 占쎈쐻占쎈윪�뤃�벂�쐻占쎈윥筌묒뇯�쐻占쎈윪獄�占� 占쎈쐻占쎈윪占쎄섈占쎈쐻占쎈윪��앓듬쐻占쎈윥占쎈뤅 占쎌뜏占쎌뒩占쎈땾占쎈빝�뜝�뜴�쐻占쎈윪占쎈��.');
        }

        // Check if user exists (mock)
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('占쎈쐻占쎈윥�떋�궍�뒙占쎈룱�뜮戮ル뎨�뇡�빘占썬굝�쐻�뜝占� 占쎈쐻占쎈윥�몴�깷�쐻占쎈짗占쎌굲占쎈쐻�뜝占� 占쎈쐻占쎈윪��얠쥉異�嚥▲꺂毓쇔뜝�럥�럡占쎈쐻占쎈윪�굢占쏙옙�쐻占쎈윥�뜮�씢�쐻占쎈윥�젆占�. 占쎈쐻占쎈윪占쎈쨧占쎈쐻占쎈윪占쎌맱占쎈쨬占쎈즸占쎌굲占쎈쐻占쎈윪�굢占쏙옙�쐻占쎈윪獄�占� 癲ル슣�돰占쎈쳯嶺뚮쵐堉뀐옙�굲占쎈쑏�뜝占� 占쎌뜏占쎌뒩占쎈땾占쎈빝�뜝�뜴�쐻占쎈윪占쎈��.');
        }

        // In real app, would compare hashed password
        if (user.passwordHash !== this.hashPassword(password)) {
            throw new Error('�뜝�럥�몡�넭怨ｋ쳟占쎌굲占쎈쐻占쎈쓠�뵳怨ㅼ삕占쎌맇�뜝�럡�돭占쎈쨬占쎈즸占쎌굲 占쎈쐻占쎈윪��앗낅뇲占쎄땀�몭諛깅눀�뜝�뜾異�占쎌돸占쎌굲 占쎈쐻占쎈윥�몴�깷�쐻占쎈윥獒뺣ŀ�쐻占쎈윥�뜮�씢�쐻占쎈윥�젆占�.');
        }

        // Generate token and store
        const token = this.generateToken(user.id);
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt
        }));

        this.trackEvent('login_success', {
            event_category: 'authentication',
            method: 'email',
            user_id: user.id
        });
        return user;
    },

    // Google OAuth Login (mock)
    async loginWithGoogle() {
        await this.delay(1000);

        // Simulate Google OAuth response
        const mockGoogleUser = {
            id: 'google_' + Date.now(),
            email: 'user@gmail.com',
            name: 'Google User',
            picture: null
        };

        const users = this.getStoredUsers();
        let user = users.find(u => u.email === mockGoogleUser.email);

        if (!user) {
            // Create new user
            user = {
                id: mockGoogleUser.id,
                email: mockGoogleUser.email,
                provider: 'google',
                createdAt: new Date().toISOString()
            };
            users.push(user);
            this.saveStoredUsers(users);

            // Reset onboarding for new users
            localStorage.removeItem(this.ONBOARDING_KEY);
            this.trackEvent('signup_success', {
                event_category: 'authentication',
                method: 'google',
                user_id: user.id
            });
        } else {
            this.trackEvent('login_success', {
                event_category: 'authentication',
                method: 'google',
                user_id: user.id
            });
        }

        const token = this.generateToken(user.id);
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));

        return user;
    },

    // Email/Password Signup
    async signup(email, password, confirmPassword, termsAgreed) {
        await this.delay(800);

        // Validation
        if (!email || !password) {
            throw new Error('占쎈쐻占쎈윪��얠쥉異�嚥▲꺂毓쇔뜝�럥�럡 占쎈쐻占쎈윪�뤃�꽒�쐻占쎈윥獒뺧옙 �뜝�럥�몡�넭怨ｋ쳟占쎌굲占쎈쐻占쎈쓠�뵳怨ㅼ삕占쎌맇�뜝�럡�돭�뜝�럥�걫占쎈쐻�뜝占� 占쎈쐻占쎈윪�굢占쏙옙�쐻占쎈윪占쎌죷占쎈쐻占쎈윥占쎈뤅 占쎌뜏占쎌뒩占쎈땾占쎈빝�뜝�뜴�쐻占쎈윪占쎈��.');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('占쎈쐻占쎈윪��얠쥉異�嚥▲꺂毓쇔뜝�럥�럡 占쎈쐻占쎈윪�뤃�벂�쐻占쎈윥筌묒뇯�쐻占쎈윪獄�占� 占쎈쐻占쎈윪占쎄섈占쎈쐻占쎈윪��앓듬쐻占쎈윥占쎈뤅 占쎌뜏占쎌뒩占쎈땾占쎈빝�뜝�뜴�쐻占쎈윪占쎈��.');
        }

        if (password.length < 8) {
            throw new Error('�뜝�럥�몡�넭怨ｋ쳟占쎌굲占쎈쐻占쎈쓠�뵳怨ㅼ삕占쎌맇�뜝�럡�돭占쎈쐻占쎈윥獒뺧옙 8占쎈쐻占쎈윪占쎄껑 占쎈쐻占쎈윪��얠±�쐻占쎈윞筌띾�ｋ쐻占쎈윪��얠±�쐻占쎈윥占쎄퐨占쎈쐻占쎈윥占쎈뭾 占쎈쐻占쎈윥�뜝�룞�삕占쎈쐻占쎈윥�뜮�씢�쐻占쎈윥�젆占�.');
        }

        if (password !== confirmPassword) {
            throw new Error('�뜝�럥�몡�넭怨ｋ쳟占쎌굲占쎈쐻占쎈쓠�뵳怨ㅼ삕占쎌맇�뜝�럡�돭占쎈쨬占쎈즸占쎌굲 占쎈쐻占쎈윪��앗낅뇲占쎄땀�몭諛깅눀�뜝�뜾異�占쎌돸占쎌굲 占쎈쐻占쎈윥�몴�깷�쐻占쎈윥獒뺣ŀ�쐻占쎈윥�뜮�씢�쐻占쎈윥�젆占�.');
        }

        if (!termsAgreed) {
            throw new Error('占쎈쨬占쎈즸占쎌굲占쎈쐻占쎈윪�굢占쏙옙�쐻占쎈윪獄�占� 占쎈쐻占쎈윪筌띻쐼�쐻占쎈윥占쎈뤅 占쎈쐻占쎈윥占쎈떋占쎈쐻占쎈윥占쎈묄 占쎈쐻占쎈윥占쎈뭿�뜝�럡�뒋占쎈쐻�뜝占� 占쎈쐻占쎈윥筌욎�λ쐻占쎈윪甕겄띕쨬占쎈즸占쎌굲 �뜝�럩�꼥�뜝�럥�땾占쎈쐻占쎈짗占쎌굲 占쎈쐻占쎈윥占쎈떋占쎈쐻占쎈윪占쎈�듸옙�쐻占쎈윥�뜝�룞�삕占쎈쐻占쎈윥�뜮�씢�쐻占쎈윥�젆占�.');
        }

        // Check duplicate
        const users = this.getStoredUsers();
        if (users.find(u => u.email === email)) {
            throw new Error('占쎈쐻占쎈윪��얠×苡э옙瑗삼옙�굲 占쎈쨬占쎈즸占쎌굲占쎈쐻占쎈윪�굢占쏙옙�쐻占쎈윥壤쏉옙 占쎈쐻占쎈윪��얠쥉異�嚥▲꺂毓쇔뜝�럥�럡占쎈쐻占쎈윪�굢占쏙옙�쐻占쎈윥�뜮�씢�쐻占쎈윥�젆占�. 占쎌뒙占쎈룱獒뺢쒀�삕占쎌읇占쎈쐻占쎈윪��앓듬쐻占쎈윪獄�占� �뜝�럩�꼥�뜝�럥�땾占쎈쐻占쎈짗占쎌굲 癲ル슣�돰占쎈쳯嶺뚮쵐堉뀐옙�굲占쎈쑏�뜝占� 占쎌뜏占쎌뒩占쎈땾占쎈빝�뜝�뜴�쐻占쎈윪占쎈��.');
        }

        // Create user
        const user = {
            id: 'user_' + Date.now(),
            email: email,
            passwordHash: this.hashPassword(password),
            provider: 'email',
            termsAgreedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        users.push(user);
        this.saveStoredUsers(users);

        // Generate token
        const token = this.generateToken(user.id);
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt
        }));

        // Reset onboarding for new users
        localStorage.removeItem(this.ONBOARDING_KEY);

        this.trackEvent('signup_success', {
            event_category: 'authentication',
            method: 'email',
            user_id: user.id
        });
        return user;
    },

    // Logout
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.trackEvent('logout', {
            event_category: 'authentication',
            method: 'manual'
        });
    },

    // Helper: Get stored users
    getStoredUsers() {
        const usersStr = localStorage.getItem('trade_signal_users');
        return usersStr ? JSON.parse(usersStr) : [];
    },

    // Helper: Save stored users
    saveStoredUsers(users) {
        localStorage.setItem('trade_signal_users', JSON.stringify(users));
    },

    // Helper: Email validation
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Helper: Simple hash (in real app, use bcrypt/argon2 on server)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    },

    // Helper: Delay for simulating API calls
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Event tracking with GA4
    trackEvent(eventName, data = {}) {
        // Console log for debugging
        console.log(`[Event] ${eventName}`, data);
        
        // Send to GA4 if gtag is available
        if (typeof gtag !== 'undefined') {
            // Map custom events to GA4 standard events where applicable
            const eventMapping = {
                'login_success': 'login',
                'signup_success': 'sign_up',
                'logout': 'logout',
                'list_view': 'page_view',
                'view_politician_profile': 'view_item',
                'trade_detail_view': 'view_item',
                'view_stock_detail': 'view_item',
                'follow_toggle': 'add_to_cart', // Using add_to_cart as analogy for follow
                'watchlist_toggle': 'add_to_watchlist',
                'checkout_view': 'begin_checkout',
                'onboarding_complete': 'tutorial_complete',
                'onboarding_step_view': 'tutorial_step_view',
                'search_submitted': 'search',
                'filter_changed': 'filter',
                'sort_changed': 'sort',
                'tab_changed': 'select_content',
                'paywall_view': 'view_promotion',
                'click_paywall': 'select_promotion',
                'api_call': 'api_call',
                'email_subscribe': 'generate_lead',
                'newsletter_subscribe': 'generate_lead'
            };
            
            const ga4EventName = eventMapping[eventName] || eventName;
            
            // Prepare GA4 event parameters
            const ga4Params = {
                ...data,
                event_category: data.event_category || 'user_interaction',
                event_label: data.event_label || eventName
            };
            
            // Remove undefined values
            Object.keys(ga4Params).forEach(key => {
                if (ga4Params[key] === undefined) {
                    delete ga4Params[key];
                }
            });
            
            // Send event to GA4
            gtag('event', ga4EventName, ga4Params);
        }
    }
};

// ===== User Data Management =====
const UserData = {
    FOLLOWS_KEY: 'trade_signal_follows',
    WATCHLIST_KEY: 'trade_signal_watchlist',
    SETTINGS_KEY: 'trade_signal_settings',
    SUBSCRIPTION_KEY: 'trade_signal_subscription',

    // Get followed politicians
    getFollowedPoliticians() {
        const data = localStorage.getItem(this.FOLLOWS_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Follow/Unfollow politician
    toggleFollowPolitician(politicianId) {
        const follows = this.getFollowedPoliticians();
        const index = follows.indexOf(politicianId);

        if (index > -1) {
            follows.splice(index, 1);
        } else {
            // Check limit for free users (�뜝�럥�떛�뜝�룞�삕�뜝�룞彛⒴뜝占�: 1癲ル슢�뀖�뤃�룊�삕占쎈��癲ル슣�돸占쎌굲癲ル슢�뿪占쎌굲 占쎈쐻占쎈윥占쎈꺕占쎌뒙占쎈룱獒뺣돍�삕占쎈�� 占쎈쨬占쎈즸占쎌굲占쎈쐻占쎈윥獒뺧옙)
            const subscription = this.getSubscription();
            if (!subscription.active && follows.length >= 1) {
                return { success: false, error: '구독이 활성화되지 않았습니다. 구독을 활성화하려면 먼저 구독을 해야 합니다.' };
            }
            follows.push(politicianId);
        }

        localStorage.setItem(this.FOLLOWS_KEY, JSON.stringify(follows));
        return { success: true, following: index === -1 };
    },

    // Get watchlist stocks
    getWatchlist() {
        const data = localStorage.getItem(this.WATCHLIST_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Add/Remove from watchlist
    toggleWatchlist(stockId) {
        const watchlist = this.getWatchlist();
        const index = watchlist.indexOf(stockId);

        if (index > -1) {
            watchlist.splice(index, 1);
        } else {
            watchlist.push(stockId);
        }

        localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
        return { success: true, watching: index === -1 };
    },

    // Get user settings
    getSettings() {
        const data = localStorage.getItem(this.SETTINGS_KEY);
        return data ? JSON.parse(data) : {
            emailAlerts: true,
            newsletter: true,
            notificationEmail: null
        };
    },

    // Update settings
    updateSettings(settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
        return updated;
    },

    // Get subscription status
    getSubscription() {
        const data = localStorage.getItem(this.SUBSCRIPTION_KEY);
        return data ? JSON.parse(data) : {
            active: false,
            plan: null,
            startDate: null,
            nextBillingDate: null
        };
    },

    // Update subscription (mock)
    updateSubscription(subscriptionData) {
        localStorage.setItem(this.SUBSCRIPTION_KEY, JSON.stringify(subscriptionData));
        return subscriptionData;
    }
};
