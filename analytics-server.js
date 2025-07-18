const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = './analytics-data';
const DATA_FILE = path.join(DATA_DIR, 'visitor-data.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.')); // Serve static files from current directory

// Ensure data directory exists
async function ensureDataDirectory() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize data file if it doesn't exist
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
        }
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// Load existing data
async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

// Save data
async function saveData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Analytics endpoint to receive tracking data
app.post('/api/analytics', async (req, res) => {
    try {
        const trackingData = req.body;
        
        // Add server timestamp
        trackingData.serverTimestamp = new Date().toISOString();
        
        // Load existing data
        const existingData = await loadData();
        
        // Add new data
        existingData.push(trackingData);
        
        // Save updated data
        await saveData(existingData);
        
        res.status(200).json({ success: true, message: 'Data received' });
    } catch (error) {
        console.error('Error processing analytics data:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get analytics data
app.get('/api/analytics', async (req, res) => {
    try {
        const data = await loadData();
        res.json(data);
    } catch (error) {
        console.error('Error retrieving analytics data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get analytics summary
app.get('/api/analytics/summary', async (req, res) => {
    try {
        const data = await loadData();
        
        // Calculate summary statistics
        const summary = {
            totalEvents: data.length,
            uniqueVisitors: new Set(data.map(d => d.visitorId)).size,
            uniqueSessions: new Set(data.map(d => d.sessionId)).size,
            pageViews: data.filter(d => d.type === 'page_view').length,
            interactions: data.filter(d => d.type === 'interaction').length,
            avgTimePerPage: 0,
            topPages: {},
            topReferrers: {},
            deviceTypes: {},
            languages: {},
            recentActivity: []
        };
        
        // Calculate page statistics
        const pageViews = data.filter(d => d.type === 'page_view');
        const pageExits = data.filter(d => d.type === 'page_exit');
        
        // Top pages
        pageViews.forEach(pv => {
            const page = pv.path || pv.url;
            summary.topPages[page] = (summary.topPages[page] || 0) + 1;
        });
        
        // Top referrers
        pageViews.forEach(pv => {
            if (pv.referrer) {
                const referrer = new URL(pv.referrer).hostname;
                summary.topReferrers[referrer] = (summary.topReferrers[referrer] || 0) + 1;
            }
        });
        
        // Device types (simplified)
        pageViews.forEach(pv => {
            const userAgent = pv.userAgent || '';
            let deviceType = 'Desktop';
            if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
                deviceType = 'Mobile';
            } else if (/Tablet|iPad/.test(userAgent)) {
                deviceType = 'Tablet';
            }
            summary.deviceTypes[deviceType] = (summary.deviceTypes[deviceType] || 0) + 1;
        });
        
        // Languages
        pageViews.forEach(pv => {
            if (pv.language) {
                summary.languages[pv.language] = (summary.languages[pv.language] || 0) + 1;
            }
        });
        
        // Average time per page
        if (pageExits.length > 0) {
            const totalTime = pageExits.reduce((sum, pe) => sum + (pe.timeSpent || 0), 0);
            summary.avgTimePerPage = Math.round(totalTime / pageExits.length / 1000); // Convert to seconds
        }
        
        // Recent activity (last 10 events)
        summary.recentActivity = data
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10)
            .map(d => ({
                type: d.type,
                url: d.url,
                timestamp: new Date(d.timestamp).toISOString(),
                visitorId: d.visitorId?.substring(0, 8) + '...' // Truncate for privacy
            }));
        
        res.json(summary);
    } catch (error) {
        console.error('Error generating analytics summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get visitor sessions
app.get('/api/analytics/sessions', async (req, res) => {
    try {
        const data = await loadData();
        const sessions = {};
        
        data.forEach(event => {
            if (!sessions[event.sessionId]) {
                sessions[event.sessionId] = {
                    sessionId: event.sessionId,
                    visitorId: event.visitorId,
                    startTime: event.timestamp,
                    endTime: event.timestamp,
                    events: [],
                    pages: new Set(),
                    totalTimeSpent: 0
                };
            }
            
            const session = sessions[event.sessionId];
            session.events.push(event);
            session.endTime = Math.max(session.endTime, event.timestamp);
            
            if (event.path) {
                session.pages.add(event.path);
            }
            
            if (event.timeSpent) {
                session.totalTimeSpent = Math.max(session.totalTimeSpent, event.timeSpent);
            }
        });
        
        // Convert to array and add calculated fields
        const sessionArray = Object.values(sessions).map(session => ({
            ...session,
            pages: Array.from(session.pages),
            duration: session.endTime - session.startTime,
            eventCount: session.events.length
        }));
        
        res.json(sessionArray);
    } catch (error) {
        console.error('Error retrieving session data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Analytics dashboard route
app.get('/analytics-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'analytics-dashboard.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
    await ensureDataDirectory();
    
    app.listen(PORT, () => {
        console.log(`Analytics server running on port ${PORT}`);
        console.log(`Dashboard available at: http://localhost:${PORT}/analytics-dashboard`);
        console.log(`API endpoints:`);
        console.log(`  POST /api/analytics - Receive tracking data`);
        console.log(`  GET /api/analytics - Get all analytics data`);
        console.log(`  GET /api/analytics/summary - Get analytics summary`);
        console.log(`  GET /api/analytics/sessions - Get session data`);
    });
}

startServer().catch(console.error);

module.exports = app;