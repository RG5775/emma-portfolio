/**
 * Custom Tracking Examples
 * Add these to your existing JavaScript files to track specific interactions
 */

// Example 1: Track button clicks with custom data
document.addEventListener('DOMContentLoaded', function() {
    
    // Track navigation clicks
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            window.trackEvent('navigation_click', {
                linkText: this.textContent,
                linkHref: this.href,
                section: 'navigation'
            });
        });
    });

    // Track project card clicks
    const projectCards = document.querySelectorAll('.project');
    projectCards.forEach(card => {
        card.addEventListener('click', function(e) {
            window.trackEvent('project_click', {
                projectTitle: this.querySelector('h3')?.textContent || 'Unknown',
                clickPosition: { x: e.clientX, y: e.clientY }
            });
        });
    });

    // Track cube interactions (specific to your 3D cube)
    const cube = document.getElementById('cube');
    if (cube) {
        cube.addEventListener('click', function(e) {
            window.trackEvent('cube_interaction', {
                interactionType: 'click',
                currentFace: this.style.transform || 'unknown'
            });
        });
    }

    // Track timeline button clicks
    const timelineButtons = document.querySelectorAll('.timeline-btn');
    timelineButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            window.trackEvent('timeline_click', {
                targetRotation: this.dataset.rotation,
                buttonText: this.textContent
            });
        });
    });

    // Track form interactions (if you have forms)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            window.trackEvent('form_submit', {
                formId: this.id,
                formAction: this.action,
                fieldCount: this.querySelectorAll('input, textarea, select').length
            });
        });
    });

    // Track external link clicks
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
        if (!link.href.includes(window.location.hostname)) {
            link.addEventListener('click', function(e) {
                window.trackEvent('external_link_click', {
                    destination: this.href,
                    linkText: this.textContent,
                    opensInNewTab: this.target === '_blank'
                });
            });
        }
    });

    // Track scroll milestones with custom data
    let scrollMilestones = [25, 50, 75, 100];
    let reachedMilestones = new Set();
    
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100);
        
        scrollMilestones.forEach(milestone => {
            if (scrollPercent >= milestone && !reachedMilestones.has(milestone)) {
                reachedMilestones.add(milestone);
                window.trackEvent('scroll_milestone', {
                    milestone: milestone,
                    pageTitle: document.title,
                    timeToReach: Date.now() - window.visitorAnalytics.pageStartTime
                });
            }
        });
    });

    // Track time spent reading (when user stops scrolling)
    let readingTimer;
    let readingStartTime;
    
    window.addEventListener('scroll', function() {
        if (!readingStartTime) {
            readingStartTime = Date.now();
        }
        
        clearTimeout(readingTimer);
        readingTimer = setTimeout(function() {
            const readingTime = Date.now() - readingStartTime;
            if (readingTime > 5000) { // Only track if reading for more than 5 seconds
                window.trackEvent('reading_session', {
                    duration: readingTime,
                    pageTitle: document.title,
                    scrollPosition: window.pageYOffset
                });
            }
            readingStartTime = null;
        }, 2000); // 2 seconds of no scrolling
    });

    // Track mouse leave (potential bounce)
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0) { // Mouse left through top of page
            window.trackEvent('mouse_leave_top', {
                timeOnPage: Date.now() - window.visitorAnalytics.pageStartTime,
                scrollDepth: window.visitorAnalytics.maxScrollDepth
            });
        }
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            window.trackEvent('page_hidden', {
                timeVisible: Date.now() - window.visitorAnalytics.pageStartTime
            });
        } else {
            window.trackEvent('page_visible', {
                returnedAfter: Date.now() - window.visitorAnalytics.pageStartTime
            });
        }
    });

    // Track keyboard shortcuts (if you have any)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            window.trackEvent('keyboard_shortcut', {
                key: e.key,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
                shiftKey: e.shiftKey
            });
        }
    });

    // Track device orientation changes (mobile)
    if (screen.orientation) {
        screen.orientation.addEventListener('change', function() {
            window.trackEvent('orientation_change', {
                orientation: screen.orientation.type,
                angle: screen.orientation.angle
            });
        });
    }

    // Track performance metrics
    window.addEventListener('load', function() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            
            window.trackEvent('page_performance', {
                loadTime: pageLoadTime,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                firstByte: timing.responseStart - timing.navigationStart
            });
        }
    });

    // Track search interactions (if you have search)
    const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                if (this.value.length > 2) {
                    window.trackEvent('search_query', {
                        query: this.value,
                        queryLength: this.value.length
                    });
                }
            }, 1000);
        });
    });

    // Track downloads (if you have download links)
    const downloadLinks = document.querySelectorAll('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".zip"]');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const fileExtension = this.href.split('.').pop().toLowerCase();
            window.trackEvent('file_download', {
                fileName: this.href.split('/').pop(),
                fileType: fileExtension,
                fileSize: this.dataset.size || 'unknown'
            });
        });
    });

    console.log('🎯 Custom tracking initialized for enhanced analytics!');
});

// Example function to track user engagement score
function calculateEngagementScore() {
    const sessionData = window.visitorAnalytics.getSessionData();
    const timeSpent = sessionData.timeSpent / 1000; // Convert to seconds
    const interactions = sessionData.interactions;
    const scrollDepth = sessionData.maxScrollDepth;
    
    // Simple engagement scoring algorithm
    let score = 0;
    score += Math.min(timeSpent / 60, 10); // Up to 10 points for time (1 point per minute, max 10)
    score += Math.min(interactions / 5, 5); // Up to 5 points for interactions
    score += scrollDepth / 20; // Up to 5 points for scroll depth
    
    return Math.round(score);
}

// Track engagement score when user leaves
window.addEventListener('beforeunload', function() {
    const engagementScore = calculateEngagementScore();
    window.trackEvent('engagement_score', {
        score: engagementScore,
        timeSpent: window.visitorAnalytics.getSessionData().timeSpent,
        interactions: window.visitorAnalytics.getSessionData().interactions,
        scrollDepth: window.visitorAnalytics.getSessionData().maxScrollDepth
    });
});