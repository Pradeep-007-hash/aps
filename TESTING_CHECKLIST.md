# Google OAuth Testing Checklist

## Pre-Testing Setup

### ✅ 1. Verify Files Updated
- [ ] `App.jsx` has `GoogleOAuthProvider` wrapper
- [ ] `src/components/common/SocialLogin.jsx` uses `GoogleLogin` component
- [ ] `backend/server.js` has updated `/auth/google` endpoint
- [ ] `.env` has Client ID: `11933295591-5jfqfnlrctnemc4iltlaljvd1injshp0.apps.googleusercontent.com`
- [ ] `backend/.env` has matching Client ID

### ✅ 2. Verify Google Cloud Console
Go to https://console.cloud.google.com/apis/credentials

- [ ] OAuth Client exists with your Client ID
- [ ] Authorized redirect URIs include: `http://localhost:5173/`
- [ ] Authorized redirect URIs include: `http://localhost:5174/`
- [ ] No typos in URIs (especially trailing `/`)
- [ ] Settings are SAVED

### ✅ 3. Restart Servers

```bash
# Backend Terminal
cd backend
npm install   # Just in case
npm start
# Should see: "✅ MongoDB Connected!"
# Should see: "🔍 Backend loaded GOOGLE_CLIENT_ID: 11933295591..."
```

```bash
# Frontend Terminal
npm run dev
# Should see: "Local: http://localhost:5173/"
```

---

## Testing Steps

### **Test 1: Frontend Package Loaded**
1. Open browser to `http://localhost:5173/login`
2. Open Developer Tools (F12)
3. Check Console tab
4. Verify NO errors about `GoogleOAuthProvider` or `GoogleLogin`
5. **Expected**: Clean console with no import errors

---

### **Test 2: Google Button Renders**
1. Stay on login page
2. Look below the email/password form
3. **Expected**: You should see a Google Sign-In button
   - Official Google styling
   - Text says "Sign in with Google" or similar
4. **NOT expected**: Custom blue button with Google logo (that was the old code)

---

### **Test 3: Click Google Button**
1. Click the Google Sign-In button
2. **Expected**: Google popup/dialog appears
   - Not a redirect (stays on same page)
   - Google's official popup
   - "Sign in with Google" or "Choose an account"
3. **NOT expected**: Page redirect to `accounts.google.com`

---

### **Test 4: Backend Receives Token**
1. Keep Developer Tools open
2. Switch to Console tab
3. Click Google button again
4. In the popup, select your Google account
5. Switch to **Backend Terminal**
6. **Expected Output**:
   ```
   🔍 Google Auth: Attempting to verify credential...
   ✅ Google Token Verified for email: yourname@example.com
   👤 User not found by provider, checking by email...
   👤 User not found, creating new account...
   ✅ New user created with ID: [MongoDB ObjectId]
   ```

---

### **Test 5: Login Success**
1. After selecting account in Google popup
2. Wait 2-3 seconds
3. **Expected**: 
   - Google popup closes
   - You're redirected to dashboard
   - You're logged in as the Google user
   - Message shows "✅ Sign in successful"

4. **NOT expected**:
   - Error message about "invalid_client"
   - Error message about "Authorization Error"
   - Staying on login page

---

### **Test 6: User Created in Database**
1. After successful login, you should be on dashboard
2. Go to backend MongoDB (if you have access)
3. Check `users` collection
4. **Expected**: New user with:
   - `email`: your Google email
   - `provider`: "google"
   - `providerId`: Google's user ID
   - `firstname`, `lastname`: from Google profile
   - `status`: "APPROVED" (auto-approved for Google login)

---

### **Test 7: Session Works**
1. After successful login on dashboard
2. Refresh the page (F5)
3. **Expected**: You stay logged in
4. **NOT expected**: Redirected back to login page

---

## Debugging Errors

### **Error: "OAuth client was not found"**
- ❌ Cause: Redirect URI mismatch or client ID wrong
- ✅ Fix:
  1. Go to Google Cloud Console
  2. Verify Authorized redirect URIs has `http://localhost:5173/`
  3. No extra paths like `/login`
  4. Click Save
  5. Restart both servers
  6. Clear browser cache (Ctrl+Shift+Delete)

### **Error: "invalid_client"**
- ❌ Cause: Same as above
- ✅ Fix: Same as above

### **Google Button Not Appearing**
- ❌ Cause: `GoogleOAuthProvider` not loaded or Client ID missing
- ✅ Fix:
  1. Check `.env` has Client ID
  2. Check `App.jsx` has `GoogleOAuthProvider` wrapper
  3. Restart frontend server

### **Console Error: "clientId is required"**
- ❌ Cause: `.env` file not loaded or wrong name
- ✅ Fix:
  1. Check variable name is exactly: `VITE_GOOGLE_CLIENT_ID`
  2. Restart frontend server
  3. Clear browser cache

### **Backend Never Receives Token**
- ❌ Cause: Network issue or wrong API URL
- ✅ Fix:
  1. Check backend is running on `http://localhost:5000`
  2. Check `SocialLogin.jsx` is posting to correct URL: `http://localhost:5000/auth/google`
  3. Check CORS is enabled in backend

---

## Success Indicators

✅ **You'll know it works when:**

**In Browser:**
- Google button appears
- Google popup shows (no page redirect)
- You login successfully
- Redirected to dashboard
- No errors in console

**In Backend Console:**
- "🔍 Google Auth: Attempting to verify credential..."
- "✅ Google Token Verified"
- New user created message
- No error messages

**In Database:**
- New user with `provider: "google"`

---

## Quick Commands to Remember

```bash
# Start backend
cd backend && npm start

# Start frontend
npm run dev

# Check for errors
# Frontend: Open http://localhost:5173/login and press F12
# Backend: Look at terminal output

# Restart everything
# 1. Stop backend (Ctrl+C)
# 2. Stop frontend (Ctrl+C)
# 3. Start backend: npm start (in backend folder)
# 4. Start frontend: npm run dev (in root folder)
```

---

## Support

If you're stuck:
1. Check this checklist in order
2. Look at the error message carefully
3. Check backend and frontend console logs
4. Verify redirect URIs in Google Cloud Console
5. Share the error message if you need help

The most common issue is **redirect URI mismatch** - triple check that!
