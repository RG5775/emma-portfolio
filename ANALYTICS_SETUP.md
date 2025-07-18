# Website Visitor Analytics Setup Guide

## Overview

This visitor analytics system tracks comprehensive website activity including:
- **Page visits** and time spent on each page
- **User interactions** (clicks, scrolls, form submissions)
- **Session tracking** with unique visitor identification
- **Device and browser information**
- **Real-time analytics dashboard**

## Files Created

1. **`visitor-analytics.js`** - Client-side tracking script
2. **`analytics-server.js`** - Node.js backend server
3. **`analytics-dashboard.html`** - Beautiful analytics dashboard
4. **`package.json`** - Node.js dependencies

## Installation & Setup

### Step 1: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Or install manually:
npm install express cors
npm install --save-dev nodemon
```

### Step 2: Start the Analytics Server

```bash
# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:3001`

### Step 3: Access the Dashboard

Open your browser and go to:
- **Dashboard**: `http://localhost:3001/analytics-dashboard`
- **API endpoints**: `http://localhost:3001/api/analytics`

## Features

### 📊 Comprehensive Tracking

- **Page Views**: Every page visit is tracked with metadata
- **Time Tracking**: Accurate time spent on each page
- **User Interactions**: Clicks, scrolls, form submissions, link clicks
- **Session Management**: Unique visitor and session identification
- **Device Detection**: Mobile, tablet, desktop classification
- **Real-time Updates**: Live activity tracking

### 📈 Analytics Dashboard

- **Key Metrics**: Visitors, sessions, page views, average time
- **Visual Charts**: Top pages, device types, languages, referrers
- **Recent Activity**: Live feed of visitor actions
- **Session Details**: Detailed session analysis
- **Auto-refresh**: Updates every 30 seconds

### 🔧 Custom Event Tracking

You can track custom events in your website:

```javascript
// Track custom events
window.trackEvent('button_click', { button: 'signup' });
window.trackEvent('video_play', { video: 'intro' });
window.trackEvent('download', { file: 'resume.pdf' });
```

## API Endpoints

### POST `/api/analytics`
Receives tracking data from the website

### GET `/api/analytics`
Returns all analytics data

### GET `/api/analytics/summary`
Returns aggregated analytics summary

### GET `/api/analytics/sessions`
Returns detailed session information

### GET `/analytics-dashboard`
Serves the analytics dashboard

## Data Storage

Analytics data is stored in:
- **File**: `./analytics-data/visitor-data.json`
- **Backup**: Data is automatically backed up locally if server is unavailable

## Privacy & Security

- **Anonymous Tracking**: No personal information is collected
- **Local Storage**: Data stays on your server
- **GDPR Compliant**: Minimal data collection
- **Visitor IDs**: Generated randomly, not linked to personal data

## Customization

### Modify Tracking Behavior

Edit `visitor-analytics.js` to:
- Change tracking frequency
- Add custom events
- Modify data collection

### Customize Dashboard

Edit `analytics-dashboard.html` to:
- Change visual appearance
- Add new charts
- Modify metrics display

### Server Configuration

Edit `analytics-server.js` to:
- Change port number
- Add authentication
- Modify data storage

## Troubleshooting

### Server Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Use different port
PORT=3002 npm start
```

### No Data Appearing
1. Check browser console for errors
2. Verify analytics script is loaded
3. Check server logs
4. Ensure CORS is properly configured

### Dashboard Not Loading
1. Verify server is running
2. Check browser console
3. Try refreshing the page
4. Clear browser cache

## Production Deployment

### Environment Variables
```bash
export PORT=3001
export NODE_ENV=production
```

### Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start analytics-server.js --name "analytics"

# Using forever
npm install -g forever
forever start analytics-server.js
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api/analytics {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /analytics-dashboard {
        proxy_pass http://localhost:3001;
    }
}
```

## Performance Considerations

- **Lightweight**: Minimal impact on website performance
- **Efficient**: Batched data sending
- **Scalable**: Can handle high traffic volumes
- **Optimized**: Throttled event tracking

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Fallbacks**: Graceful degradation for older browsers

## Data Retention

- **Default**: Unlimited retention
- **Cleanup**: Implement data rotation as needed
- **Export**: JSON format for easy data migration

## Security Best Practices

1. **HTTPS**: Use SSL in production
2. **Authentication**: Add dashboard authentication
3. **Rate Limiting**: Implement API rate limiting
4. **Data Validation**: Validate incoming data
5. **Monitoring**: Monitor for unusual activity

## Next Steps

1. **Test the system** by visiting your website pages
2. **Monitor the dashboard** for incoming data
3. **Customize tracking** based on your needs
4. **Set up production deployment** when ready

## Support

For issues or questions:
1. Check the browser console for errors
2. Review server logs
3. Verify all files are properly configured
4. Test with different browsers and devices

---

**Happy Analytics Tracking! 📊**