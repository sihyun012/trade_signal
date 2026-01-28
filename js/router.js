// ===== Simple Router =====

const Router = {
    routes: {},
    currentRoute: null,
    pageTitleResolver: null,

    setPageTitleResolver(fn) {
        this.pageTitleResolver = fn;
    },

    // Initialize router
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    // Register a route
    register(path, handler) {
        this.routes[path] = handler;
    },

    // Navigate to a path
    navigate(path) {
        window.location.hash = path;
    },

    // Handle route change
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, queryString] = hash.split('?');
        const params = this.parseParams(path);
        const query = this.parseQuery(queryString);

        // Onboarding guard - ???? ???? ???? ????? ??
        if (!Auth.isOnboardingCompleted() && path !== '/onboarding' && path !== '/login' && path !== '/signup') {
            Auth.trackEvent('onboarding_gate_blocked', {
                event_category: 'onboarding',
                attempted_route: path,
                reason: 'onboarding_not_completed'
            });
            this.navigate('/onboarding');
            return;
        }

        // Find matching route
        let matchedRoute = null;
        let routeParams = {};

        for (const routePath in this.routes) {
            const match = this.matchRoute(routePath, path);
            if (match) {
                matchedRoute = routePath;
                routeParams = match;
                break;
            }
        }

        if (matchedRoute && this.routes[matchedRoute]) {
            this.currentRoute = matchedRoute;
            
            // Track page view in GA4 (의원명/종목명 등 실제 이름이 보이도록 resolver 사용)
            if (typeof gtag !== 'undefined') {
                let pageTitle = path;
                if (typeof this.pageTitleResolver === 'function') {
                    try {
                        const custom = this.pageTitleResolver(path, matchedRoute, routeParams);
                        if (custom != null && String(custom).trim() !== '') pageTitle = custom;
                    } catch (e) { /* fallback to path */ }
                }
                gtag('event', 'page_view', {
                    page_title: pageTitle,
                    page_location: window.location.href,
                    page_path: path
                });
            }
            
            this.routes[matchedRoute]({ params: routeParams, query });
        } else {
            // 404 - redirect to home
            this.navigate('/');
        }
    },

    // Match route with params
    matchRoute(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');

        if (routeParts.length !== actualParts.length) return null;

        const params = {};

        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                params[routeParts[i].slice(1)] = actualParts[i];
            } else if (routeParts[i] !== actualParts[i]) {
                return null;
            }
        }

        return params;
    },

    // Parse URL params
    parseParams(path) {
        return path.split('/').filter(p => p);
    },

    // Parse query string
    parseQuery(queryString) {
        if (!queryString) return {};
        const params = {};
        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        return params;
    }
};

// ===== Toast Notifications =====
const Toast = {
    container: null,

    init() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = type === 'success' ? 'check-circle' :
                     type === 'error' ? 'exclamation-circle' : 'info-circle';

        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// ===== Utility Functions =====
const Utils = {
    // Format currency
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Format number with commas
    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    },

    // Format percentage
    formatPercent(value, includeSign = true) {
        const sign = includeSign && value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    },

    // Format date
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // Calculate days between dates
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get initials from name
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
