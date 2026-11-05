# 🔧 TROUBLESHOOTING GUIDE

## Issue 1: Page Disappears When Refreshing

### Problem
- Website works initially
- Refresh page (F5)
- Page goes blank/disappears
- Doesn't come back

### Root Cause
**Frontend dev server crashed!** Exit code 1

### Solution

#### Step 1: Check Terminal
Look at your frontend terminal. Is it showing errors?

```
VITE v5.4.21 ready in 799 ms ✓  = Good
✓ = Good

vs.

Error:  = Bad
✗ = Bad
Exit Code: 1 = Bad
```

#### Step 2: Restart Frontend Server

**If frontend crashed:**
```powershell
# Terminal 2 - STOP current process
Ctrl + C

# Then restart
cd d:\Coding\Chatapp\frontend
npm run dev
```

Wait for:
```
VITE v5.4.21 ready in XXX ms
```

#### Step 3: Try Refresh Again
- F5 to refresh
- Page should come back immediately

---

## Issue 2: Real-Time Features Not Working

### Problem
- Messages not appearing instantly
- Draft preview not showing
- Online status not updating
- Socket.IO not connecting

### Root Cause
**Socket.IO connection failing** - usually because:
1. Backend not running on 5000
2. Wrong API/Socket URL in .env
3. Different IPs for API vs Socket

### Solution

#### Step 1: Check Backend Running
```powershell
# Terminal 1 - Check output
ps aux | grep node

# OR just look at terminal - should show:
✓ MongoDB Connected
✓ Server running on port 5000
✓ New user connected: XXX
```

If not showing, restart:
```powershell
cd d:\Coding\Chatapp\backend
npm run dev
```

#### Step 2: Check .env URLs Match

**File: `frontend/.env`**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000    ← Must be SAME as API_URL
```

**If different:**
```env
# Wrong:
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://127.0.0.1:5000    ← Different!

# Correct:
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000    ← Same!
```

#### Step 3: Check Browser Console

1. Open DevTools: **F12**
2. Go to **Console** tab
3. Look for messages:

**Good Signs:**
```
✓ Socket connected
✓ User authenticated
✓ Ready to chat
```

**Bad Signs:**
```
❌ WebSocket error
❌ Cannot reach backend
❌ Failed to connect
```

#### Step 4: Restart Frontend

After fixing .env:
```powershell
# Stop frontend
Ctrl + C

# Restart
npm run dev
```

Wait for reload in terminal:
```
[vite] ✨ optimized dependencies changed. reloading
```

#### Step 5: Try Again
1. Refresh page (F5)
2. Register new account
3. Try sending message
4. Real-time should work now!

---

## Issue 3: Refresh Clears Chat History

### Problem
- Chat loads fine
- Click refresh (F5)
- Chat page goes blank
- Have to go back to home

### Solution

This is **normal behavior** - messages load from database but Socket.IO connection drops briefly.

**Fix:**
1. Page refreshes and reconnects Socket.IO automatically
2. Wait 2-3 seconds
3. Messages should reappear
4. If not, check browser console (F12)

**If still not working:**
1. Check backend logs
2. Check Socket connection (Console → Network tab)
3. Restart both servers

---

## 🔍 Detailed Debugging

### Browser Console (F12)

**Step 1: Open Console**
- Windows: F12
- Mac: Cmd + Option + J
- Then click **Console** tab

**Step 2: Look for Socket Logs**
You should see:
```
✓ Socket connected
Socket.io: setting ack callback
```

**If you see errors:**
```
❌ WebSocket is closed before the connection is established
❌ CORS error
❌ Cannot find API at http://localhost:5000
```

**Action:**
- Backend not running? Start it
- Wrong .env? Update it
- Still broken? Show me the error

### Network Tab (F12)

**Step 1: Open Network Tab**
- F12 → Network tab
- Filter by "XHR"

**Step 2: Send a Message**
- Type in chat
- Press Send
- Look for:
  - `POST /api/messages/send` → Status 201 ✓
  - Socket events → Green checkmark ✓

**If red X:**
- Backend not running
- Wrong URL in .env
- Network problem

### Terminal Logs

**Backend Logs (Terminal 1)**:
```
POST /api/messages/send 201  ← Good!
GET /messages 200            ← Good!
Socket disconnected          ← May be okay
```

**Frontend Logs (Terminal 2)**:
```
VITE ready    ← Good!
[vite] hmr update  ← Good!
Error parsing  ← Bad!
```

---

## Common Error Solutions

### Error: "Cannot GET /"
**Problem**: Frontend server not running  
**Solution**: 
```powershell
cd frontend
npm run dev
```

### Error: "Connection refused at localhost:5000"
**Problem**: Backend not running  
**Solution**:
```powershell
cd backend
npm run dev
```

### Error: "WebSocket closed"
**Problem**: Socket.IO disconnected  
**Solution**:
1. Refresh page (F5)
2. Socket auto-reconnects
3. Try again

### Error: "API response 404"
**Problem**: Wrong endpoint or .env URL  
**Solution**:
1. Check frontend .env has `/api` prefix? No!
2. Backend handles `/api` routing
3. Frontend .env should just be `http://localhost:5000`

### Error: "CORS error"
**Problem**: API blocking requests  
**Solution**:
1. Backend CORS is configured
2. Check backend .env has `CLIENT_URL=http://localhost:5173`
3. Restart backend

---

## 🚨 Emergency Reset

If nothing works:

```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Wait 2 seconds
# Then restart:

# Terminal 1
cd d:\Coding\Chatapp\backend
npm run dev

# Terminal 2 (wait for backend to show "ready")
cd d:\Coding\Chatapp\frontend
npm run dev

# Then refresh browser
# Everything should work again!
```

---

## Quick Diagnostic Checklist

- [ ] Backend running? (`npm run dev` in backend folder)
- [ ] Frontend running? (`npm run dev` in frontend folder)
- [ ] Both show "ready" or "connected"?
- [ ] Browser console (F12) shows no errors?
- [ ] .env URLs match? (API_URL = SOCKET_URL)
- [ ] Page loads at http://localhost:5173?
- [ ] Can register account?
- [ ] Can send message?
- [ ] Real-time message appears instantly?
- [ ] Draft preview shows when typing?

If all ✓, everything works!  
If any ✗, check corresponding solution above.

---

## 📞 Quick Support

**For each issue, provide:**

1. **What you see**: "Page is blank", "Error message", etc.
2. **What's in Terminal 1 (Backend)**:
   - Is it running?
   - Any errors?
3. **What's in Terminal 2 (Frontend)**:
   - Is it running?
   - Any errors?
4. **Browser Console (F12)**:
   - Any error messages?

---

## 🎯 Most Common Fixes

1. **Page disappears on refresh** → Restart frontend
2. **Real-time not working** → Check .env URLs match
3. **Can't send message** → Restart backend  
4. **Socket error** → Clear browser cache (Ctrl+Shift+Delete)
5. **Nothing works** → Kill all Node processes and restart both

---

## ✅ All Fixed!

Once you see:
```
✓ Backend running on 5000
✓ Frontend running on 5173
✓ Socket connected (in browser console)
✓ Messages send & appear instantly
✓ Draft preview works
```

**You're all set!** Everything is working perfectly. 🎉

---

**Still having issues?** Check the main docs:
- [README.md](README.md)
- [QUICKSTART.md](QUICKSTART.md)
- [TESTING.md](TESTING.md)
