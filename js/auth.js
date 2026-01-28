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
            throw new Error('이메일 또는 비밀번호를 입력해 주세요.');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('이메일 형식을 확인해 주세요.');
        }

        // Check if user exists (mock)
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('등록되지 않은 이메일입니다. 회원가입을 진행해 주세요.');
        }

        // In real app, would compare hashed password
        if (user.passwordHash !== this.hashPassword(password)) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        // Generate token and store
        const token = this.generateToken(user.id);
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt
        }));

        this.trackEvent('login_success', { method: 'email' });
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
            this.trackEvent('signup_success', { method: 'google' });
        } else {
            this.trackEvent('login_success', { method: 'google' });
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
            throw new Error('이메일 또는 비밀번호를 입력해 주세요.');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('이메일 형식을 확인해 주세요.');
        }

        if (password.length < 8) {
            throw new Error('비밀번호는 8자 이상이어야 합니다.');
        }

        if (password !== confirmPassword) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        if (!termsAgreed) {
            throw new Error('가입을 위해 필수 약관 동의가 먼저 필요합니다.');
        }

        // Check duplicate
        const users = this.getStoredUsers();
        if (users.find(u => u.email === email)) {
            throw new Error('이미 가입된 이메일입니다. 로그인을 먼저 진행해 주세요.');
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

        this.trackEvent('signup_success', { method: 'email' });
        return user;
    },

    // Logout
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.trackEvent('logout');
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

    // Event tracking (mock)
    trackEvent(eventName, data = {}) {
        console.log(`[Event] ${eventName}`, data);
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
            // Check limit for free users (무료: 1명까지만 팔로우 가능)
            const subscription = this.getSubscription();
            if (!subscription.active && follows.length >= 1) {
                return { success: false, error: '멤버십 업그레이드가 필요합니다.' };
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
