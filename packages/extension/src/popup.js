// Configuration - Update these when deploying to production
const API_URL = 'http://localhost:3000';      // Change to https://api.linklock.app in production
const WEB_URL = 'http://localhost:5173';      // Change to https://linklock.app in production

let currentTab = null;
let authToken = null;

document.addEventListener('DOMContentLoaded', async () => {
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');
  const viewLinksBtn = document.querySelector('.btn-secondary');

  // Get current tab
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs[0];
  } catch (e) {
    statusDiv.textContent = 'Error getting tab info';
    saveBtn.disabled = true;
  }

  // Try to get auth token from storage
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], resolve);
  });
  
  authToken = result.authToken;

  // If not in storage, try to get from current tab
  if (!authToken && currentTab && currentTab.url.includes(WEB_URL)) {
    try {
      const response = await chrome.tabs.sendMessage(currentTab.id, { action: 'getToken' });
      authToken = response.token;
      if (authToken) {
        chrome.storage.local.set({ authToken });
      }
    } catch (e) {
      console.log('Could not get token from page');
    }
  }

  // Update view links button
  if (viewLinksBtn) {
    viewLinksBtn.href = WEB_URL;
  }

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Saving...';
    statusDiv.className = 'status loading';
    statusDiv.textContent = 'Saving link...';

    try {
      if (!currentTab) {
        throw new Error('Tab not found');
      }

      // Check if authenticated
      if (!authToken) {
        throw new Error('Not authenticated. Login first.');
      }

      console.log('Tab URL:', currentTab.url);

      // Try to capture screenshot (but don't fail if it doesn't work)
      let screenshot = null;
      try {
        screenshot = await captureScreenshot();
      } catch (e) {
        console.warn('Screenshot failed:', e);
      }

      // Save to backend
      const payload = {
        url: currentTab.url,
        title: currentTab.title || 'Untitled',
        folder: 'default',
      };
      
      if (screenshot) {
        payload.screenshot = screenshot;
      }

      console.log('Sending payload:', { ...payload, screenshot: screenshot ? 'base64...' : null });

      const response = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response body:', responseText);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      statusDiv.className = 'status success';
      statusDiv.textContent = '✓ Saved! (popup closes in 3 seconds)';
      saveBtn.textContent = '✓ Saved';
      // setTimeout(() => window.close(), 3000);
    } catch (error) {
      console.error('Error:', error);
      statusDiv.className = 'status error';
      statusDiv.textContent = '✗ ' + error.message;
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Try again';
    }
  });
});

async function captureScreenshot() {
  try {
    const screenshotUrl = await chrome.tabs.captureVisibleTab();
    // Remove data:image/png;base64, prefix
    return screenshotUrl.split(',')[1] || screenshotUrl;
  } catch (error) {
    console.error('Screenshot error:', error);
    throw new Error('Failed to capture screenshot: ' + error.message);
  }
}

async function getUserId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userId'], (result) => {
      if (result.userId) {
        resolve(result.userId);
      } else {
        // Generate userId and sync with web app localStorage
        const userId = 'user-' + Math.random().toString(36).slice(2);
        chrome.storage.local.set({ userId });
        // Broadcast to any open LinkLock tabs
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            if (tab.url && tab.url.includes(WEB_URL)) {
              chrome.tabs.sendMessage(tab.id, { action: 'setUserId', userId }).catch(() => {});
            }
          });
        });
        resolve(userId);
      }
    });
  });
}
