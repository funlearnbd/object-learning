# 🚀 Quick GitHub Pages Setup

## Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Name: `funlearnbd-learning-game`
3. Description: "Educational learning game for kids"
4. Public
5. Don't initialize with README
6. Click "Create repository"

## Step 2: Upload Files

### Option A: Using Git (Recommended)
```bash
cd funlearnbd-learning-game
git init
git add .
git commit -m "Initial commit: FunLearnBD Learning Game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/funlearnbd-learning-game.git
git push -u origin main
```

### Option B: Upload via Web
1. On GitHub repository page
2. Click "uploading an existing file"
3. Drag all files and folders
4. Commit changes

## Step 3: Enable GitHub Pages
1. Go to repository Settings
2. Click "Pages" in left sidebar
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main** / **root**
   - Click Save
4. Wait 2-3 minutes
5. URL will be: `https://YOUR_USERNAME.github.io/funlearnbd-learning-game/`

## Step 4: Test on Phone
1. Open URL on Android Chrome
2. Browser prompts "Add to Home Screen"
3. Tap to install
4. App opens full screen!

## Troubleshooting

### Page Not Loading
- Wait 3-5 minutes for first deployment
- Check Actions tab for build status
- Ensure all files uploaded

### Images Not Showing
- Add your images to `assets/images/` folders
- Commit and push changes
- Game uses placeholder until real images added

### PWA Not Installing
- Must use HTTPS (GitHub Pages provides this)
- Need Chrome/Android browser
- Check manifest.json uploaded

---

**Your game URL will be:**
```
https://YOUR_USERNAME.github.io/funlearnbd-learning-game/
```

**Share this URL to test on any device!** 📱✨
