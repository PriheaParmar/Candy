// Background service worker for the extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Job Autofill Extension Installed');
  
  // Initialize storage
  chrome.storage.local.get(['userData', 'applicationStats'], (result) => {
    if (!result.applicationStats) {
      chrome.storage.local.set({
        applicationStats: {
          total: 0,
          today: 0,
          recent: [],
          lastDate: new Date().toDateString()
        }
      });
    }
  });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveData') {
    chrome.storage.local.set({ userData: request.data }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getData') {
    chrome.storage.local.get('userData', (result) => {
      sendResponse({ data: result.userData });
    });
    return true;
  }
  
  if (request.action === 'trackApplication') {
    chrome.storage.local.get('applicationStats', (result) => {
      const stats = result.applicationStats || { total: 0, today: 0, recent: [] };
      const today = new Date().toDateString();
      
      if (today !== stats.lastDate) {
        stats.today = 0;
        stats.lastDate = today;
      }
      
      stats.total++;
      stats.today++;
      
      if (request.appData) {
        stats.recent = [request.appData, ...stats.recent].slice(0, 10);
      }
      
      chrome.storage.local.set({ applicationStats: stats }, () => {
        sendResponse({ success: true, stats });
      });
    });
    return true;
  }
});

// Badge update based on activity
chrome.storage.local.get('applicationStats', (result) => {
  if (result.applicationStats && result.applicationStats.today > 0) {
    chrome.action.setBadgeText({ text: result.applicationStats.today.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  }
});