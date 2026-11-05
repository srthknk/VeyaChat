# ChatApp - Quick Start Guide

## ✅ EVERYTHING READY TO USE!

Your **ChatApp Real-Time Chat Platform** is now fully operational!

---

## 🚀 How to Use

### 1. Access the Application
- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:5000/
- **Database**: MongoDB Atlas (connected)

### 2. Register & Login

1. Go to http://localhost:5173/
2. Click "Register"
3. Enter:
   - **Username**: Any name (4-20 chars, letters/numbers/underscore)
   - **Mobile**: E.164 format (e.g., +11234567890)
   - **Password**: Min 8 characters
   - **Bio**: Optional
4. Click "Register" → You're in!

**Tip**: Register 2+ accounts to test messaging (use different phones/browsers)

### 3. Find & Chat with Users

1. On **Home page**, use the search box
2. Search by **username** or **phone number**
3. Click on a user to start chatting
4. Type a message and press **Send**

### 4. Live Draft Preview (Core Feature!)

When you type a message:
- The recipient sees **real-time text** as you type
- Shows: "User is typing: [your exact text]"
- It's like seeing someone's drafts **live!**
- **Never stored** - just real-time preview
- Disappears when you send or clear

### 5. Check Your Profile

- Click **Profile** → View/update bio
- See online status
- See when you joined

---

## 📁 Project Structure

```
ChatApp/
├── Backend (Node.js + Express)
│   ├── Port: 5000
│   ├── Database: MongoDB Atlas
│   └── Real-time: Socket.IO
│
└── Frontend (React 18 + Vite)
    ├── Port: 5173
    ├── Styling: Tailwind CSS
    └── State: Zustand
```

---

## 🎯 Key Features

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Working |
| Real-Time Messaging | ✅ Working |
| Live Draft Preview | ✅ Working |
| User Search | ✅ Working |
| Online Status | ✅ Working |
| Message Status (delivered/seen) | ✅ Working |
| Responsive UI | ✅ Working |
| Error Handling | ✅ Working |

---

## 🔧 For Developers

### Stop Servers
```powershell
# Backend: Ctrl+C in backend terminal
# Frontend: Ctrl+C in frontend terminal
```

### Restart Servers
```powershell
# Backend
cd d:\Coding\Chatapp\backend
npm run dev

# Frontend (in new terminal)
cd d:\Coding\Chatapp\frontend
npm run dev
```

### View Logs
- **Backend**: Terminal shows all API calls & Socket events
- **Frontend**: Browser console (F12) shows Socket connections

### Database
- MongoDB Atlas connection in `backend/.env`
- Collections auto-created: users, chats, messages

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users
- `POST /api/users/search` - Search users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/profile` - Update profile

### Chats
- `GET /api/chats` - Get all chats
- `POST /api/chats/create` - Create/get chat

### Messages
- `GET /api/messages/:chatId` - Get messages
- `POST /api/messages/send` - Send message
- `DELETE /api/messages/:id` - Delete message
- `PATCH /api/messages/:id` - Edit message

---

## 🔌 Socket Events (Real-Time)

### Presence
- `userOnline` - User comes online
- `userOffline` - User goes offline

### Draft Preview
- `draftStart` - User starts typing
- `draftUpdate` - Real-time text (debounced 300ms)
- `draftClear` - Draft cleared
- `draftStop` - User stopped typing

### Messaging
- `messageSend` - Send message
- `messageReceive` - Receive message
- `messageDelivered` - Message delivered
- `messageSeen` - Message seen

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Then restart servers
```

### MongoDB Connection Failed
- Check `.env` file has correct MongoDB URI
- Ensure IP is whitelisted in MongoDB Atlas

### Frontend Won't Connect to Backend
- Both servers must be running
- Check `.env` URLs match (localhost:5000 & localhost:5173)

### Live Draft Not Showing
- Both users must be online
- Socket connection must be active (check browser console)

---

## 📚 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB Atlas
- **Auth**: JWT + Bcrypt
- **Real-Time**: Socket.IO
- **Validation**: Zod + express-validator

---

## 🎓 What You Can Do

1. ✅ Register multiple users
2. ✅ Search and find other users
3. ✅ Send & receive messages in real-time
4. ✅ See draft previews as users type
5. ✅ Check delivery/seen status
6. ✅ Update your profile
7. ✅ See online status

---

## 🚀 Next Steps (Future)

These features can be added later:
- Group chats
- Voice/video calls
- Message reactions
- File uploads (Cloudinary ready)
- Message search
- Notifications
- Dark mode
- User blocking

---

## 📞 Support

All code is documented and follows clean architecture. Check:
- `backend/README.md` - Backend details
- `frontend/src/` - Component documentation
- `.env.example` - Configuration help

---

**🎉 YOU'RE ALL SET! START CHATTING!**

Visit: http://localhost:5173/
