# GitHub Issues Setup for Shared Wishlist

## Overview
The Team Wishlist now uses GitHub Issues API to enable **shared, real-time updates** across all users. Everyone can add wishes, and all team members see the updates without manual page refresh (checks every 30 seconds).

## Prerequisites
- GitHub account
- This repository (**srichu143/TARGET**)
- A GitHub Personal Access Token (PAT)

## Step-by-Step Setup

### 1. Create a GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** (classic)
3. Set the token name: `wishlist-token` or similar
4. Select scopes:
   - ✅ `repo` (full control of private repositories)
   - ✅ `issues` (read and write access to issues)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

### 2. First Time Using the Wishlist

1. Open the Team Wishlist: https://srichu143.github.io/TARGET/
2. A popup will ask for your **GitHub Personal Access Token**
3. Paste the token you created in Step 1
4. Click **OK**
5. The page will reload and fetch all wishes from GitHub Issues

### 3. How It Works

- **Adding a Wish**: Creates a GitHub Issue with label `wish`
- **Editing a Wish**: Updates the GitHub Issue title and body
- **Deleting a Wish**: Closes the GitHub Issue
- **Viewing Wishes**: Fetches all open issues with label `wish`
- **Auto-refresh**: Page checks GitHub every 30 seconds for new/updated wishes

### 4. Sharing with Team

Each team member needs to:
1. Open the Team Wishlist
2. Provide their own GitHub Personal Access Token
3. Once done, they'll see all wishes and can add/edit their own

## Fallback Mode

If GitHub token is not provided:
- Wishes are saved **locally** in browser storage
- Only visible to that user on that browser
- No shared updates

## Troubleshooting

**Issue: "Error fetching from GitHub"**
- Check that your token is correct
- Verify you have `issues` scope enabled on your token
- Make sure repo is public or you have access

**Issue: "Showing local data"**
- Token has expired or is invalid
- Create a new token and refresh the page
- Clear browser storage: `localStorage.removeItem('GITHUB_TOKEN')`

**Change Token:**
- Open browser DevTools → Console
- Run: `localStorage.removeItem('GITHUB_TOKEN')`
- Refresh the page
- Paste your new token when prompted

## Technical Details

- **API Endpoint**: `https://api.github.com/repos/srichu143/TARGET/issues`
- **Label Filter**: Issues labeled `wish`
- **State Filter**: Only open issues
- **Refresh Interval**: Every 30 seconds
- **Authentication**: GitHub OAuth token (read + write)

## FAQ

**Q: Is my token safe?**  
A: Your token is stored in browser's localStorage. Only use tokens with minimal required scopes.

**Q: Can I use a different repository?**  
A: Edit `script.js` lines 10-11:
```javascript
const GITHUB_OWNER = 'your-username';
const GITHUB_REPO = 'your-repo';
```

**Q: How long are wishes kept?**  
A: As long as the GitHub Issue is open. Deleted wishes close the issue.

**Q: Multiple wishlists?**  
A: Create multiple GitHub labels (e.g., `wish-personal`, `wish-team`) and modify the API call accordingly.
