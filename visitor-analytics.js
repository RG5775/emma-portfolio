/**
 * Visitor Analytics Tracking System
 * Tracks page visits, time spent, user interactions, and other metrics
 */

class VisitorAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.visitorId = this.getOrCreateVisitorId();
        this.pageStartTime = Date.now();
        this.isActive = true;
        this.interactions = [];
        this.scrollDepth = 0;
        this.maxScrollDepth = 0;
        
        this.init();
    }

    init() {
        // Track page load
        this.trackPageView();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Track page visibility changes
        this.setupVisibilityTracking();
        
        // Send data periodically
        this.setupPeriodicTracking();
        
        // Track page unload
        this.setupUnloadTracking();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getOrCreateVisitorId() {
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitor_id', visitorId);
        }
        return visitorId;
    }

    trackPageView() {
        const pageData = {
            type: 'page_view',
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        this.sendData(pageData);
    }

    setupEventListeners() {
        // Track clicks
        document.addEventListener('click', (e) => {
            this.trackInteraction('click', {
                element: e.target.tagName,
                className: e.target.className,
                id: e.target.id,
                text: e.target.textContent?.substring(0, 100),
                x: e.clientX,
                y: e.clientY
            });
        });

        // Track scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackScroll();
            }, 100);
        });

        // Track mouse movement (throttled)
        let mouseTimeout;
        document.addEventListener('mousemove', () => {
            if (!mouseTimeout) {
                mouseTimeout = setTimeout(() => {
                    this.isActive = true;
                    mouseTimeout = null;
                }, 1000);
            }
        });

        // Track keyboard activity
        document.addEventListener('keydown', () => {
            this.isActive = true;
            this.trackInteraction('keydown');
        });

        // Track form interactions
        document.addEventListener('submit', (e) => {
            this.trackInteraction('form_submit', {
                formId: e.target.id,
                formClass: e.target.className
            });
        });

        // Track link clicks
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                this.trackInteraction('link_click', {
                    href: e.target.href,
                    text: e.target.textContent,
                    external: !e.target.href.startsWith(window.location.origin)
                });
            }
        });
    }

    trackScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);
        
        this.scrollDepth = scrollPercentage;
        this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercentage);
        
        // Track scroll milestones
        if (scrollPercentage > 0 && scrollPercentage % 25 === 0) {
            this.trackInteraction('scroll_milestone', {
                percentage: scrollPercentage
            });
        }
    }

    trackInteraction(type, data = {}) {
        const interaction = {
            type: type,
            timestamp: Date.now(),
            timeOnPage: Date.now() - this.pageStartTime,
            ...data
        };
        
        this.interactions.push(interaction);
        
        // Send interaction data immediately for important events
        if (['click', 'form_submit', 'link_click'].includes(type)) {
            this.sendData({
                type: 'interaction',
                visitorId: this.visitorId,
                sessionId: this.sessionId,
                url: window.location.href,
                interaction: interaction
            });
        }
    }

    setupVisibilityTracking() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isActive = false;
                this.trackInteraction('page_hidden');
            } else {
                this.isActive = true;
                this.trackInteraction('page_visible');
            }
        });
    }

    setupPeriodicTracking() {
        // Send heartbeat every 30 seconds
        setInterval(() => {
            if (this.isActive) {
                this.sendHeartbeat();
            }
        }, 30000);

        // Check for inactivity
        setInterval(() => {
            this.checkInactivity();
        }, 60000);
    }

    setupUnloadTracking() {
        const sendFinalData = () => {
            const timeSpent = Date.now() - this.pageStartTime;
            const finalData = {
                type: 'page_exit',
                visitorId: this.visitorId,
                sessionId: this.sessionId,
                url: window.location.href,
                timeSpent: timeSpent,
                maxScrollDepth: this.maxScrollDepth,
                totalInteractions: this.interactions.length,
                timestamp: Date.now()
            };

            // Use sendBeacon for reliable data sending on page unload
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/analytics', JSON.stringify(finalData));
            } else {
                // Fallback for older browsers
                this.sendData(finalData);
            }
        };

        window.addEventListener('beforeunload', sendFinalData);
        window.addEventListener('pagehide', sendFinalData);
    }

    sendHeartbeat() {
        const heartbeatData = {
            type: 'heartbeat',
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            url: window.location.href,
            timeSpent: Date.now() - this.pageStartTime,
            scrollDepth: this.scrollDepth,
            maxScrollDepth: this.maxScrollDepth,
            interactionCount: this.interactions.length,
            timestamp: Date.now()
        };

        this.sendData(heartbeatData);
    }

    checkInactivity() {
        // Mark as inactive if no mouse/keyboard activity for 5 minutes
        const inactivityThreshold = 5 * 60 * 1000; // 5 minutes
        const timeSinceLastActivity = Date.now() - this.lastActivityTime;
        
        if (timeSinceLastActivity > inactivityThreshold) {
            this.isActive = false;
        }
    }

    sendData(data) {
        // Add common fields
        data.timestamp = data.timestamp || Date.now();
        data.url = data.url || window.location.href;
        
        // Try to send to your analytics endpoint
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).catch(error => {
            // Fallback: store in localStorage if server is unavailable
            console.warn('Analytics server unavailable, storing locally:', error);
            this.storeLocally(data);
        });
    }

    storeLocally(data) {
        const stored = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
        stored.push(data);
        
        // Keep only last 100 events to prevent storage overflow
        if (stored.length > 100) {
            stored.splice(0, stored.length - 100);
        }
        
        localStorage.setItem('analytics_queue', JSON.stringify(stored));
    }

    // Method to manually track custom events
    trackCustomEvent(eventName, eventData = {}) {
        this.trackInteraction('custom_event', {
            eventName: eventName,
            eventData: eventData
        });
    }

    // Method to get current session data
    getSessionData() {
        return {
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            timeSpent: Date.now() - this.pageStartTime,
            interactions: this.interactions.length,
            maxScrollDepth: this.maxScrollDepth,
            isActive: this.isActive
        };
    }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.visitorAnalytics = new VisitorAnalytics();
    
    // Make it available globally for custom tracking
    window.trackEvent = function(eventName, eventData) {
        if (window.visitorAnalytics) {
            window.visitorAnalytics.trackCustomEvent(eventName, eventData);
        }
    };
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisitorAnalytics;
}