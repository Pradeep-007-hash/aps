# Google Cloud Console Setup - Step by Step

## Quick Checklist
- [ ] You have a Google account
- [ ] You can access Google Cloud Console
- [ ] Your Client ID: `11933295591-5jfqfnlrctnemc4iltlaljvd1injshp0.apps.googleusercontent.com`

---

## Step-by-Step Setup

### **Step 1: Go to Google Cloud Console**
1. Open https://console.cloud.google.com/
2. Sign in with your Google account
3. If prompted, accept the terms

---

### **Step 2: Select or Create Project**
1. At the top, click the **Project Selector** (dropdown showing project name)
2. Look for a project containing your OAuth Client ID
   - If you have one, click it
   - If not, click **"NEW PROJECT"**
     - Name it: `APS` (or similar)
     - Click **"Create"**
3. Wait for the project to load (takes 30 seconds)

---

### **Step 3: Navigate to Credentials**
1. In the left sidebar, click **"APIs & Services"**
2. Click **"Credentials"**

---

### **Step 4: Find Your OAuth Client**
1. Under "OAuth 2.0 Client IDs", you should see your Client ID: 
   ```
   11933295591-5jfqfnlrctnemc4iltlaljvd1injshp0.apps.googleusercontent.com
   ```
2. Click on it to open the details

---

### **Step 5: CRITICAL - Configure Redirect URIs**

This is where the "invalid_client" error comes from if done wrong.

#### **Clear Steps:**

1. Look for the section called **"Authorized redirect URIs"**
2. Delete any existing URIs (if there are any)
3. Add these **EXACT** two URIs:
   ```
   http://localhost:5173/
   http://localhost:5174/
   ```

**Important Rules:**
- ✅ Include the `http://` protocol
- ✅ Include the port number (5173 or 5174)
- ✅ Include the trailing `/` slash
- ❌ Do NOT include `/login` or `/register` after the slash
- ❌ Do NOT include `https://` for localhost (only `http://`)

**Example - CORRECT:**
```
http://localhost:5173/
```

**Example - WRONG:**
```
http://localhost:5173/login  ❌ (extra path)
https://localhost:5173/      ❌ (wrong protocol for local dev)
localhost:5173/              ❌ (missing http://)
```

4. After adding the URIs, click **"SAVE"**

---

### **Step 6: Verify Your Client Secret (Optional)**
1. While still on this page, scroll down
2. You should see your **"Client secret"**
3. If you want to use it in backend, copy it and add to `backend/.env`:
   ```
   GOOGLE_CLIENT_SECRET=paste_here
   ```

---

## Verification Checklist

- [ ] Authorized redirect URIs contains `http://localhost:5173/`
- [ ] Authorized redirect URIs contains `http://localhost:5174/`
- [ ] No extra paths in the URIs (no `/login`, `/register`)
- [ ] Settings are **SAVED**
- [ ] Client ID matches in your `.env` files:
  ```
  VITE_GOOGLE_CLIENT_ID=11933295591-5jfqfnlrctnemc4iltlaljvd1injshp0.apps.googleusercontent.com
  ```

---

## If You Still Get "invalid_client" Error

### **Check 1: Exact Redirect URI Match**
```
What your app sends:    http://localhost:5173/
What Google expects:    http://localhost:5173/
                        ↑ Must be identical
```

### **Check 2: Browser Cache**
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Click **"Empty cache and hard refresh"**

### **Check 3: Servers Restarted**
```bash
# Stop both servers (Ctrl+C)
# Then restart:

# Terminal 1 (Backend)
cd backend
npm start

# Terminal 2 (Frontend)
npm run dev
```

### **Check 4: Client ID Propagation**
1. Wait 10 seconds after saving in Google Cloud
2. Restart your dev servers
3. Try again

---

## Your Current Setup

```
Frontend .env:
VITE_GOOGLE_CLIENT_ID=11933295591-5jfqfnlrctnemc4iltlaljvd1injshp0.apps.googleusercontent.com

Backend .env:
GOOGLE_CLIENT_ID=11933295591-5jfqfnlrctnemc4iltlaljvd1injshp0.apps.googleusercontent.com

Frontend running on:
http://localhost:5173/

Google Cloud expects these redirect URIs:
http://localhost:5173/
http://localhost:5174/
```

✅ **This should all match now!**

---

## Production Deployment

When you deploy to production, update Google Cloud Console:

1. Go back to this OAuth Client settings
2. Add your production redirect URIs:
   ```
   https://yourdomain.com/
   https://www.yourdomain.com/
   ```
3. Keep `http://localhost:5173/` for local testing

---

## Need Help?

1. Share a screenshot of your Google Cloud Console "Authorized redirect URIs" section
2. Share backend console output when you click "Continue with Google"
3. Check browser console (F12) for error messages

Common issues are always the redirect URI configuration, so triple-check that first!
