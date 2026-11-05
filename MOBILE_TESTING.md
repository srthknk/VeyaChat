# 📱 MOBILE TESTING GUIDE

## ✅ QUICK START

### Get Your PC's IP Address

**On Windows (Power Shell)**:
```powershell
ipconfig
```

Look for **"IPv4 Address"** under your network adapter (usually starts with 192.168.x.x or 10.x.x.x)

Example: `192.168.1.100`

---

## 📱 Step 1: Connect Mobile to Same WiFi

Make sure your **phone is on the same WiFi network** as your PC!

---

## 📱 Step 2: Update Frontend .env

Edit: `frontend/.env`

Replace `localhost` with your PC's IP:

```env
VITE_API_URL=http://192.168.1.100:5000
VITE_SOCKET_URL=http://192.168.1.100:5000
```

**Save the file** and the frontend will auto-reload!

---

## 📱 Step 3: Open on Mobile

On your phone, open browser and go to:

```
http://192.168.1.100:5173/
```

(Replace `192.168.1.100` with YOUR PC's IP from Step 1)

---

## 📱 Step 4: Test Live Chat

1. **Register account** on mobile
2. **Open PC browser** to http://localhost:5173/
3. **Register different account** on PC
4. **Search for each other** 
5. **Send messages between them**
6. **Watch live draft preview!** ✨

---

## ✅ Checklist

- [ ] Found your PC's IPv4 address (run `ipconfig`)
- [ ] Updated `frontend/.env` with your IP
- [ ] Frontend reloaded (check terminal)
- [ ] Both backend and frontend running
- [ ] Phone on same WiFi as PC
- [ ] Accessed http://YOUR_IP:5173/ on phone
- [ ] Registered account
- [ ] Can see home page with search

---

## 🔍 Finding Your PC's IP (Detailed)

### Windows PowerShell Method:
1. Open PowerShell (Win + R, type `powershell`)
2. Type: `ipconfig`
3. Look for your network adapter
4. Find **"IPv4 Address"** - this is your IP!

Example output:
```
Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . : 255.255.255.0
```

Your IP is: **192.168.1.100**

### Alternative (Command Prompt):
1. Open Command Prompt (Win + R, type `cmd`)
2. Type: `ipconfig`
3. Find IPv4 Address

---

## 🔧 Full Setup Example

### Your PC
- IP Address: `192.168.1.100`
- Backend: http://192.168.1.100:5000
- Frontend: http://192.168.1.100:5173

### Your Phone
- WiFi: Same as PC
- Browser URL: http://192.168.1.100:5173

### frontend/.env
```env
VITE_API_URL=http://192.168.1.100:5000
VITE_SOCKET_URL=http://192.168.1.100:5000
```

---

## 🚀 Testing Workflow

### Test 1: Register on Mobile
1. Phone: http://192.168.1.100:5173/
2. Click "Register"
3. Fill in: username, phone, password
4. ✅ Should be logged in

### Test 2: Search on Mobile
1. Phone: Search for a user
2. ✅ Should show results
3. Try searching by username or phone

### Test 3: 1-to-1 Chat
1. **Mobile**: Register "alice"
2. **PC**: Go to http://localhost:5173/
3. **PC**: Register "bob"
4. **Mobile**: Search for "bob"
5. **Mobile**: Click "bob" to start chat
6. **Mobile**: Type message "Hi from phone!"
7. **PC**: Should see message appear
8. ✅ Chat working!

### Test 4: Real-Time Draft Preview
1. **Mobile**: Open chat with "bob"
2. **PC**: Open same chat (http://localhost:5173/chat/CHATID)
3. **Mobile**: Start typing in message input
4. **PC**: Watch message appear in real-time!
5. ✅ Live draft preview working!

### Test 5: Two Mobile Devices
1. **Phone 1**: http://192.168.1.100:5173/ 
2. **Phone 2**: http://192.168.1.100:5173/
3. Register different accounts on each
4. Search and chat between phones
5. Watch live draft preview!

---

## ⚠️ Troubleshooting

### "Cannot Connect"
- ❌ Check WiFi - both devices on same network?
- ❌ Check IP - did you copy it correctly?
- ❌ Check .env - did you update VITE_API_URL?
- ❌ Servers running? Both showing "ready"?

**Solution**:
1. Ping PC from phone: `ping 192.168.1.100` (use Tools app)
2. If no response, IP is wrong or WiFi not connected
3. Restart both servers: Ctrl+C, then npm run dev

### "Page Won't Load"
- ❌ Frontend not running
- ❌ Wrong port (should be 5173)
- ❌ Firewall blocking - try allowing Node.js

**Solution**:
1. Check frontend terminal shows "ready in XXX ms"
2. Try: http://PC_IP:5173/ (exactly)
3. Check Windows Firewall allows Node.js

### "Register Fails"
- ❌ Backend not running
- ❌ Wrong API_URL in .env
- ❌ Network can't reach backend

**Solution**:
1. Check backend running on 5000
2. From phone, try: http://192.168.1.100:5000/health
3. Should show: `{"success":true,"message":"Server is running"}`

### "Real-Time Not Working"
- ❌ Socket.IO not connecting
- ❌ API_URL correct but SOCKET_URL wrong
- ❌ Phone not on same WiFi

**Solution**:
1. Check browser console (F12) on phone
2. Should show: "Socket connected"
3. Make sure BOTH URLs in .env are same IP

### "Can't Access Backend from Phone"
- Firewall is blocking port 5000

**Solution**:
1. Windows Firewall → Allow Node.js
2. Or allow ports 5000 & 5173 manually
3. Restart backend

---

## 📋 Environment Setup

### Before Testing on Mobile

**File: frontend/.env**
```env
# For LOCAL testing (PC only)
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# For MOBILE testing (replace with YOUR IP)
VITE_API_URL=http://192.168.1.100:5000
VITE_SOCKET_URL=http://192.168.1.100:5000
```

### Switching Between Local & Mobile

1. **Local Only (PC)**: Use `localhost` in .env
2. **Mobile**: Change to your PC's IP
3. Frontend auto-reloads after .env change

---

## 🔗 Important URLs

| Device | Purpose | URL |
|--------|---------|-----|
| PC Browser | Local frontend | http://localhost:5173/ |
| Phone Browser | Remote frontend | http://192.168.1.100:5173/ |
| Phone (verify) | Backend health | http://192.168.1.100:5000/health |
| Backend API | Server | http://192.168.1.100:5000/ |

---

## 🎯 What to Test on Mobile

✅ Registration and login  
✅ User search (by username/phone)  
✅ Chat creation  
✅ Send messages  
✅ Receive messages in real-time  
✅ Live draft preview  
✅ Online/offline status  
✅ Message delivery status  
✅ Profile view  
✅ Settings page  

---

## 🚀 Perfect Test Scenario

1. **PC Setup**:
   - Terminal 1: Backend running on 5000 ✓
   - Terminal 2: Frontend running on 5173 ✓
   - PC Browser: http://localhost:5173/

2. **Phone Setup**:
   - .env updated with PC IP
   - Phone Browser: http://192.168.1.100:5173/
   - Both on same WiFi

3. **User 1 (PC)**: Register "alice"
4. **User 2 (Phone)**: Register "bob"
5. **User 1 (PC)**: Search "bob" → Chat
6. **User 2 (Phone)**: Search "alice" → Chat
7. **User 1 (PC)**: Type message slowly
8. **User 2 (Phone)**: Watch live draft appear! ✨
9. **User 1 (PC)**: Press Send
10. **User 2 (Phone)**: See message appear!

---

## 📝 Quick Reference

```bash
# Find your IP
ipconfig

# Update frontend/.env with YOUR IP
VITE_API_URL=http://YOUR_IP:5000
VITE_SOCKET_URL=http://YOUR_IP:5000

# Frontend reloads automatically
# Then on phone: http://YOUR_IP:5173/
```

---

## 🎉 You're Ready!

Once both servers are running and .env is updated, you can test on any device on your WiFi!

**Questions?** Check the main [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md)

---

**Happy Testing on Mobile! 📱🚀**
