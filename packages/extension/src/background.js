// Service Worker for LinkLock
// Handles background tasks if needed

chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkLock extension installed');
});
