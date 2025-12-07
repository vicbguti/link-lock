# Extension Fix - Save Link Error

## Problem
Got error: `SyntaxError: Cannot use import statement outside a module`

## Root Cause
`popup.html` wasn't loading `popup.js` as an ES module.

## What Was Fixed

### 1. popup.html
**Before:**
```html
<script src="popup.js"></script>
```

**After:**
```html
<script type="module" src="popup.js"></script>
```

### 2. popup.js
Removed import statement and put config directly in file:

```javascript
// Dynamic configuration based on environment
const isDevelopment = !chrome.runtime.getManifest().version;
const API_URL = isDevelopment 
  ? 'http://localhost:3000'
  : 'https://api.linklock.app';

const WEB_URL = isDevelopment
  ? 'http://localhost:5173'
  : 'https://linklock.app';
```

This automatically detects if you're in development or production and uses the right URLs.

## How to Apply Fix

### In Chrome:
1. Go to `chrome://extensions/`
2. Find LinkLock extension
3. Click reload icon 🔄
4. Try "Save Link" again → should work now!

## Configuration

To change your production domains later:
- Edit `popup.js` lines 2-9
- Update `API_URL` to your Railway domain
- Update `WEB_URL` to your web domain

That's it! No need for separate config.js file.

## Test It Works

1. Click extension icon
2. Click "Save Link" button
3. Should see "✓ Saved!" message
4. Check logs - no errors

✅ Fixed!
