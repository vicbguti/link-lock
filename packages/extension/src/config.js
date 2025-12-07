// Extension Configuration
// Update API_URL for your deployment

const isDevelopment = !chrome.runtime.getManifest().version;

export const API_URL = isDevelopment 
  ? 'http://localhost:3000'
  : 'https://api.linklock.app'; // Update this with your Railway domain

export const WEB_URL = isDevelopment
  ? 'http://localhost:5173'
  : 'https://linklock.app'; // Update this with your web domain

export default { API_URL, WEB_URL };
