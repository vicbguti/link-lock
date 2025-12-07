// Content script to share auth token with popup

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getToken') {
    // Get token from the webpage's localStorage if available
    const token = window.localStorage?.getItem('token');
    sendResponse({ token: token || null });
  }
});

// Also periodically sync the token to extension storage
setInterval(() => {
  const token = window.localStorage?.getItem('token');
  if (token) {
    chrome.storage.local.set({ authToken: token });
  }
}, 1000);
