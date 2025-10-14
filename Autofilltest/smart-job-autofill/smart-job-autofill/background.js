// Background service worker for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Smart Job Autofill Extension installed');
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    chrome.storage.local.get(['candidateData'], (result) => {
      sendResponse({ data: result.candidateData });
    });
    return true;
  }
});