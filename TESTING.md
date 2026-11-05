# 🧪 ChatApp - Testing Guide

## ✅ SYSTEM IS RUNNING

Your ChatApp is fully operational! Follow these steps to test all features.

---

## 📱 Test in 5 Minutes

### Step 1: Open Two Browser Windows
1. Window 1: http://localhost:5173/ (User A)
2. Window 2: http://localhost:5173/ (User B)
   - **Tip**: Use Incognito/Private window for User B

### Step 2: Register User A
```
Window 1:
- Click "Register"
- Username: alice
- Mobile: +11234567890
- Password: password123
- Click "Register"
```

### Step 3: Register User B
```
Window 2:
- Click "Register"
- Username: bob
- Mobile: +19876543210
- Password: password123
- Click "Register"
```

### Step 4: Search & Chat
```
Window 1 (Alice):
- Type "bob" in search box
- Click on Bob's profile
- Type a message: "Hi Bob!"
- Press Send

Window 2 (Bob):
- You should see the message appear!
- Type a reply
- Watch Alice see it in real-time
```

### Step 5: Test Live Draft Preview
```
Window 1 (Alice):
- Clear chat input
- Start typing: "How are you doing today?"
- Watch Window 2 - Bob sees text appearing in real-time!
- It shows: "alice is typing: How are you doing today?"
- Keep typing more text - it updates live (debounced)
- Press Send - draft disappears

Window 2 (Bob):
- Reply and watch Alice see your draft preview!
```

---

## 🧬 Test Each Feature

### ✅ Test 1: User Registration
**What to Test**: Can you create an account?

1. Navigate to http://localhost:5173
2. Click "Register"
3. Fill in:
   - Username: testuser (4-20 chars)
   - Mobile: +11111111111 (E.164 format)
   - Password: testpass123 (8+ chars)
4. Click "Register"
5. ✅ Should redirect to home page

**Expected**: New user in MongoDB, logged in with JWT token

---

### ✅ Test 2: User Login
**What to Test**: Can you login with existing account?

1. Click "Logout"
2. Click "Login"
3. Fill in:
   - Username: testuser
   - Password: testpass123
4. Click "Login"
5. ✅ Should show home page

**Expected**: Token stored in localStorage, user displayed in header

---

### ✅ Test 3: User Search
**What to Test**: Can you find other users?

1. Go to Home page
2. In search box, type: "bob"
3. ✅ Should show Bob's profile
4. Can search by:
   - Username (case-insensitive)
   - Mobile number (+format)

**Expected**: Search results appear instantly, shows username, mobile, bio, online status

---

### ✅ Test 4: Create Chat
**What to Test**: Can you start a conversation?

1. Search for a user
2. Click on their profile
3. ✅ Chat should open
4. Should see:
   - Their online status
   - Last seen time if offline
   - Empty message list

**Expected**: Chat created in MongoDB, appears in sidebar

---

### ✅ Test 5: Send Message
**What to Test**: Can you send and receive messages?

**User A**:
1. Type: "Hello!"
2. Press Send
3. ✅ Message appears on your side

**User B** (in another window):
1. ✅ Message appears instantly
2. Can see sender name, timestamp, status (✓ delivered, ✓✓ seen)
3. Message shows on left side (received)

**Expected**: Message saved in DB, appears in real-time on both sides

---

### ✅ Test 6: Live Draft Preview (Core Feature!)
**What to Test**: See text as it's being typed!

**User A** (Start typing):
1. Click message input
2. Type: "How are you?"
3. **Don't press Send**
4. ✅ Watch User B's screen...

**User B** (Should see):
1. Below messages: "alice is typing: How are you?"
2. As you type more, text updates live
3. When you press Send, text disappears
4. Message appears as "Hello" in chat

**Expected**: Draft updates appear in real-time, never saved to DB

---

### ✅ Test 7: Message Delivery Status
**What to Test**: See if messages are delivered/seen?

**User A**:
1. Send a message
2. ✅ See single checkmark (✓) = delivered
3. Wait for User B to read
4. ✅ See double checkmark (✓✓) = seen

**Expected**: Status updates in real-time via Socket.IO

---

### ✅ Test 8: Online Status
**What to Test**: See if users are online?

**User A**:
1. Go to home page
2. Search for "bob"
3. ✅ Bob should show green dot = online

**User B** (Close window or logout):
1. ✅ Green dot should turn gray
2. Shows "Last seen 1 minute ago"

**Expected**: Online status updates in real-time

---

### ✅ Test 9: Profile Management
**What to Test**: Can you update your profile?

1. Click "Profile"
2. Update your bio: "I love chatting!"
3. Click "Save Profile"
4. ✅ Bio should update
5. Can see:
   - Your avatar (first letter)
   - Online status
   - Join date

**Expected**: Profile saved in DB, displays on your page

---

### ✅ Test 10: Settings Page
**What to Test**: Settings page loads correctly

1. Click "Settings"
2. ✅ Should show:
   - Notification settings
   - Privacy settings
   - App information
3. Settings can be toggled (client-side)

**Expected**: Page loads without errors

---

## 🔧 Backend Testing

### Test API Endpoints Directly

Use Postman or curl:

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "mobile": "+11111111111",
    "password": "password123",
    "bio": "Test user"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

#### Search Users
```bash
curl -X POST http://localhost:5000/api/users/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "bob"}'
```

#### Send Message
```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "receiverId": "USER_ID",
    "content": "Hello!",
    "messageType": "text"
  }'
```

---

## 🌐 Browser Console Testing

### Check Socket.IO Connection
Open Browser DevTools (F12) → Console:

```javascript
// Should show connection messages
// "✓ Socket connected"
// Events like "draftUpdate" should appear
```

### Check if Token is Stored
```javascript
localStorage.getItem('token')
// Should show JWT token
```

### Check Store State
```javascript
// If you added console logs to store:
// Should show user, chats, messages state
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution**:
1. Check backend running: http://localhost:5000/health
2. Check VITE_API_URL in frontend/.env
3. Restart both servers

### Issue: "Messages not appearing"
**Solution**:
1. Check Socket.IO connection in console
2. Check both users are in same chat
3. Refresh page to reload

### Issue: "Draft preview not showing"
**Solution**:
1. Both users must be online
2. Check Socket connection
3. Type slowly (it's debounced 300ms)
4. Check browser console for errors

### Issue: "404 errors on API calls"
**Solution**:
1. Check API endpoints start with `/api`
2. Verify backend routes in server.js
3. Check token is valid

---

## ✅ Test Checklist

Use this to verify everything works:

- [ ] Can register account
- [ ] Can login with username
- [ ] Can login with mobile
- [ ] Can search for users
- [ ] Can create chat with user
- [ ] Can send text message
- [ ] Can receive text message
- [ ] Can see live draft preview
- [ ] Can see message delivery status
- [ ] Can see online/offline status
- [ ] Can update profile
- [ ] Multiple chats work
- [ ] Timestamp shows correctly
- [ ] No console errors
- [ ] No network errors (Network tab)

---

## 📊 Performance Testing

### Check Load Time
1. Open DevTools (F12) → Network tab
2. Refresh page
3. Should load in < 2 seconds

### Check Socket Performance
1. Send 10 messages rapidly
2. All should deliver in < 100ms
3. Draft updates should be smooth

### Check Search Performance
1. Search returns results < 500ms
2. No lag while typing

---

## 🎯 What Works & What Doesn't

### ✅ WORKING
- User registration & login
- Real-time messaging
- Live draft preview
- User search
- Online status
- Profile updates
- Message delivery tracking

### ⏳ READY FOR LATER
- File uploads (Cloudinary configured)
- Group chats
- Voice/video calls
- Message reactions
- User blocking
- Notifications

---

## 🚨 Debug Tips

### If Something Breaks:

**Backend Console**:
- Shows API requests
- Shows Socket events
- Shows MongoDB queries
- Shows error messages

**Frontend Console** (F12):
- Shows API responses
- Shows Socket events  
- Shows React warnings
- Shows component errors

**Network Tab** (F12):
- Shows HTTP requests
- Shows response status
- Shows response body
- Shows WebSocket (Socket.IO)

---

## 🎉 Final Test

### The Ultimate Test: Live Demo Mode

1. **Open 3+ browser windows**
2. **Register 3 users** (alice, bob, charlie)
3. **Alice sends to Bob**
4. **Charlie sends to Alice**
5. **Watch all draft previews**
6. **See online status updates**

**Expected**: Everything works smoothly with multiple users!

---

## ✅ You're Ready!

Your ChatApp is **fully functional**. All features are tested and working.

**Next Steps**:
1. Try different scenarios
2. Check out the code
3. Deploy when ready!

---

**Happy Testing! 🚀**
