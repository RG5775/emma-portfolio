#!/usr/bin/env node

/**
 * View User Events - Simple script to monitor visitor analytics
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function viewEvents() {
    try {
        console.log('📊 Fetching user events...\n');
        
        // Get all events
        const response = await fetch(`${BASE_URL}/api/analytics`);
        const events = await response.json();
        
        if (events.length === 0) {
            console.log('🔍 No events found yet. Visit your website to generate some data!');
            return;
        }
        
        console.log(`📈 Found ${events.length} events:\n`);
        
        // Display events in a readable format
        events.forEach((event, index) => {
            const date = new Date(event.timestamp).toLocaleString();
            console.log(`${index + 1}. ${event.type.toUpperCase()}`);
            console.log(`   Time: ${date}`);
            console.log(`   Page: ${event.path || event.url}`);
            console.log(`   Visitor: ${event.visitorId?.substring(0, 12)}...`);
            
            // Show specific details based on event type
            if (event.type === 'page_view') {
                console.log(`   Title: ${event.title}`);
                console.log(`   Referrer: ${event.referrer || 'Direct'}`);
                console.log(`   Device: ${event.screenResolution}`);
                console.log(`   Language: ${event.language}`);
            } else if (event.type === 'interaction') {
                console.log(`   Interaction: ${event.interaction?.type}`);
                console.log(`   Element: ${event.interaction?.element || 'N/A'}`);
                console.log(`   Time on page: ${Math.round((event.interaction?.timeOnPage || 0) / 1000)}s`);
            } else if (event.type === 'page_exit') {
                console.log(`   Time spent: ${Math.round((event.timeSpent || 0) / 1000)}s`);
                console.log(`   Max scroll: ${event.maxScrollDepth}%`);
                console.log(`   Interactions: ${event.totalInteractions}`);
            }
            
            console.log(''); // Empty line for readability
        });
        
        // Show summary
        const summary = await fetch(`${BASE_URL}/api/analytics/summary`);
        const summaryData = await summary.json();
        
        console.log('📋 SUMMARY:');
        console.log(`   Total Events: ${summaryData.totalEvents}`);
        console.log(`   Unique Visitors: ${summaryData.uniqueVisitors}`);
        console.log(`   Page Views: ${summaryData.pageViews}`);
        console.log(`   Average Time: ${summaryData.avgTimePerPage}s`);
        console.log(`   Total Interactions: ${summaryData.interactions}`);
        
    } catch (error) {
        console.error('❌ Error fetching events:', error.message);
        console.log('\n💡 Make sure the analytics server is running:');
        console.log('   npm start');
    }
}

// Watch mode - refresh every 5 seconds
async function watchEvents() {
    console.log('👀 Watching for new events... (Press Ctrl+C to stop)\n');
    
    while (true) {
        console.clear();
        await viewEvents();
        console.log('\n🔄 Refreshing in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

// Command line interface
const args = process.argv.slice(2);
if (args.includes('--watch') || args.includes('-w')) {
    watchEvents();
} else {
    viewEvents();
}

// Show usage
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📊 View User Events

Usage:
  node view-events.js          # View events once
  node view-events.js --watch  # Watch events in real-time
  node view-events.js -w       # Short version of --watch
  node view-events.js --help   # Show this help

Examples:
  node view-events.js          # Show current events
  node view-events.js -w       # Monitor events live
    `);
}