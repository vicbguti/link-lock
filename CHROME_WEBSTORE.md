# Chrome Web Store Submission Guide

## Prerequisites
- Chrome extension working and tested
- API deployed and running
- Stripe account configured
- Developer account for Chrome Web Store ($5 one-time)

## Step 1: Prepare Extension Files

### Update Config for Production
Edit `packages/extension/src/config.js`:

```javascript
export const API_URL = 'https://api.linklock.app';
export const WEB_URL = 'https://linklock.app';
```

### Build Extension Package
```bash
cd packages/extension
npm run build
# Creates: linklock-extension.zip
```

### Verify manifest.json
```json
{
  "manifest_version": 3,
  "name": "LinkLock - Save & Organize Links",
  "version": "0.1.0",
  "description": "The inbox for links. Save any link with AI search & organization.",
  "permissions": ["activeTab", "scripting", "storage", "tabs"],
  "host_permissions": ["<all_urls>"]
}
```

## Step 2: Create Developer Account

1. Go to https://chrome.google.com/webstore/devconsole
2. Pay $5 one-time developer registration fee
3. Verify email address

## Step 3: Create Store Listing

### 1. Click "New item"
### 2. Upload ZIP file (linklock-extension.zip)

### 3. Fill in Store Metadata

**Basic Info:**
- Name: `LinkLock - Save & Organize Links`
- Summary: `Smart link management at your fingertips`

**Detailed Description:**
```
LinkLock is your personal link inbox. Save any link with one click and access it later with lightning-fast search and organization.

Features:
✨ One-click saving with screenshots
🔍 Lightning-fast AI search
📁 Organize with smart folders
🔐 Private folders (Pro)
💾 Export as CSV/JSON (Pro)
🌐 Share your public profile (Pro)
⭐ Free tier: 500 links/month
💳 Pro: $3.99/month

Perfect for researchers, content creators, and anyone who saves links.
```

**Category:** Productivity

**Language:** English

**Content Rating:** General

**Support Email:** support@linklock.app

**Privacy Policy URL:** https://linklock.app/privacy

**Homepage URL:** https://linklock.app

**Support Website:** https://linklock.app/support

## Step 4: Upload Assets

### Screenshots (1280x800 or 640x400)
Required: 2 minimum, 5 maximum

**Screenshot 1 - Main UI:**
- Show link grid with folders
- Include search bar
- Display save button

**Screenshot 2 - Extension Popup:**
- Show "Save this link" popup
- Display confirmation message

**Screenshot 3 - Public Profile:**
- Show shared profile with public links
- Display user stats

**Screenshot 4 - Pro Features:**
- Show private folder lock icon
- Display export button

**Screenshot 5 - Mobile Friendly:**
- Show responsive design
- Link organization on smaller screen

### Icon Files Required:
- **128x128** - Large icon (store listing)
- **48x48** - Medium icon (Chrome toolbar)
- **16x16** - Small icon (favicon)

**Design Requirements:**
- Transparent background recommended
- Use brand colors (blue/purple)
- Clear, recognizable at small sizes
- Include "LinkLock" text or logo mark

### Pro Marketing Images:
Create in Figma/Canva:

1. **Hero image** (1400x560):
   - "Your Link Inbox" headline
   - Extension screenshot
   - Save button call-to-action

2. **Feature tiles** (1280x800):
   - One-click saving
   - Smart organization
   - AI search
   - Pro features

## Step 5: Permissions Justification

Google asks why you need each permission. Fill in:

**activeTab:** 
"Required to capture the current tab's URL and title when you click the save button."

**scripting:**
"Required to take screenshots of the webpage you're viewing."

**storage:**
"Required to store your authentication token and saved preferences locally."

**tabs:**
"Required to detect which tab is currently active and get its URL/title."

**host_permissions (<all_urls>):**
"Required to save links from any website you visit."

## Step 6: Privacy & Security

### Privacy Policy
Create at https://linklock.app/privacy

Include:
- What data is collected (URL, screenshots, user email)
- How data is stored (encrypted, password-protected)
- Data retention policy (kept until user deletes)
- Third-party access (Stripe for payments only)
- User rights (can export/delete anytime)

### Data Security
- SSL/TLS encryption for API
- JWT tokens for auth (no passwords in extension)
- Screenshots stored encrypted in database
- No data sold to third parties

## Step 7: Submit for Review

1. Fill all required fields (red asterisks)
2. Review "Requirements" checklist
3. Click "Submit for review"
4. Google reviews in **1-3 business days**

**Common rejection reasons:**
- Missing privacy policy ❌
- Misleading description ❌
- Poor quality screenshots ❌
- Extension doesn't match description ❌
- Permissions not justified ❌

## Step 8: After Approval

### Update Extension ID
Once approved, Google assigns an extension ID.

Update `packages/extension/src/config.js`:
```javascript
export const EXTENSION_ID = 'abcdefghijklmnopqrstuvwxyz';
```

### Market the Extension

**Social Media:**
```
🎉 LinkLock is now on the Chrome Web Store!

Save links faster than ever. One click, any site.
📥 Download now: chrome.google.com/webstore/detail/linklock

#ChromeExtension #Productivity #Launcher
```

**Product Hunt:**
- Post to https://producthunt.com
- Engage with feedback
- Iterate based on reviews

**Twitter/X Thread:**
```
1/ We just launched LinkLock on the Chrome Web Store 🚀

"The inbox for links" - save any link with one click, never lose it again

Free tier + Pro for power users

Let me show you what we built 🧵
```

## Step 9: Monitor & Maintain

### Check Reviews
- https://chrome.google.com/webstore/detail/linklock
- Respond to all user feedback
- Fix issues promptly

### Analytics
- Users count
- Install source
- Crash reports
- Permission requests

### Updates
- Push bug fixes regularly
- Add features based on feedback
- Keep description up-to-date
- Maintain privacy policy

## Version Updates

To release a new version:

1. Update version in `manifest.json`:
   ```json
   "version": "0.2.0"
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Upload new ZIP in Developer Console
4. Submit for review (usually faster: 1-2 days)

---

**Timeline:**
- Preparation: 2-3 hours
- Store listing: 1 hour
- Google review: 1-3 days
- Launch: immediate after approval

**Costs:**
- Developer registration: $5 (one-time)
- Hosting (Railway): $5-10/month
- Domain: $10-15/year

**Success Metrics:**
- 100+ installs = viral
- 500+ installs = trending
- 1000+ = featured collection potential
