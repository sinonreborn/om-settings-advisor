# OM Settings Advisor — Setup Guide

Photography settings advisor for the OM SYSTEM OM-1 Mark II.  
Live weather, lens-aware recommendations, Custom Mode programming cards.

---

## What you'll end up with

- A URL like `om-advisor.vercel.app` that works on any device
- Install-to-homescreen on your phone (works like a native app)
- Live weather from Stockport, AI-powered settings recommendations
- Your API key stays hidden on the server — visitors never see it

---

## Step 1: Get an Anthropic API Key (3 mins)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account (or log in if you have one)
3. Go to **Settings → API Keys → Create Key**
4. Copy the key somewhere safe (starts with `sk-ant-...`)
5. Add credit — £5/$5 will last hundreds of queries

---

## Step 2: Create a GitHub Account (2 mins)

1. Go to [github.com](https://github.com) → **Sign Up**
2. Use any email/username you like
3. Verify your email

---

## Step 3: Upload This Project to GitHub (3 mins)

1. Once logged into GitHub, go to [github.com/new](https://github.com/new)
2. Repository name: `om-settings-advisor`
3. Set to **Public** (needed for free Vercel tier, the code is safe — your API key is NOT in the code)
4. Click **Create repository**
5. On the next page, you'll see "uploading an existing file" — click that
6. Drag the entire contents of this project folder into the upload area
7. Click **Commit changes**

**Important:** Upload the folder *contents*, not the folder itself. GitHub should show files like `package.json`, `index.html`, `src/`, `api/`, `public/` at the root level.

---

## Step 4: Deploy on Vercel (3 mins)

1. Go to [vercel.com](https://vercel.com) → **Sign Up with GitHub**
2. Authorize Vercel to access your GitHub
3. Click **Add New → Project**
4. Find `om-settings-advisor` in the list → **Import**
5. Under **Framework Preset**, select **Vite**
6. Expand **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: paste your `sk-ant-...` key
7. Click **Deploy**

Vercel will build and deploy automatically. You'll get a URL like `om-settings-advisor.vercel.app`.

---

## Step 5: Install on Your Phone

1. Open your Vercel URL in Safari (iPhone) or Chrome (Android)
2. **iPhone:** Tap the Share button → "Add to Home Screen"
3. **Android:** Tap the three-dot menu → "Install app"

It'll appear as "OM Advisor" with the camera lens icon.

---

## Customising for Other Shooters

Right now the weather is hardcoded to Stockport (lat 53.41, lon -2.16).  
For a public release, you'd want to add browser geolocation. The code has  
a comment showing where to add `navigator.geolocation.getCurrentPosition()`.

The default lens kit is your four lenses. Other users will open the Kit panel  
and select their own glass — their selection saves to their browser's localStorage.

---

## Updating the App

Any time you push changes to GitHub, Vercel automatically rebuilds and deploys.  
You can also edit files directly on GitHub's website.

To update the app with changes from Claude:
1. I'll give you updated files
2. Upload them to GitHub (replacing the old versions)
3. Vercel auto-deploys within ~30 seconds

---

## Costs

- **Vercel:** Free tier covers hobby projects easily
- **Open-Meteo weather API:** Free, no key needed
- **Anthropic API:** Pay-per-use, roughly £0.01-0.02 per settings query
  - £5 credit ≈ 300-500 queries
  - If sharing publicly, consider adding a daily limit in the serverless function

---

## File Structure

```
om-settings-advisor/
├── api/
│   └── settings.js          ← Serverless function (hides your API key)
├── public/
│   ├── icon.svg              ← App icon
│   ├── manifest.json         ← PWA config (install-to-phone)
│   └── sw.js                 ← Service worker (offline support)
├── src/
│   ├── App.jsx               ← The entire app
│   └── main.jsx              ← Entry point
├── index.html                ← HTML shell
├── package.json              ← Dependencies
├── vercel.json               ← Vercel routing config
└── vite.config.js            ← Build config
```
