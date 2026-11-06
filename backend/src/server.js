import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './config/database.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { verifyToken, attachUserIdIfExists } from './middlewares/authMiddleware.js';
import setupSocketHandlers from './sockets/socketHandlers.js';
import { getAuthCookie } from './utils/authCookie.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

// Parse configured CORS origins. Development accepts any frontend port so Vite
// can move between ports without requiring a backend restart or .env change.
const corsOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.CLIENT_URL_MOBILE || 'http://10.244.61.200:5173',
].filter(Boolean).map((origin) => origin.replace(/\/$/, ''));

const isAllowedOrigin = (origin) => (
  !origin ||
  process.env.NODE_ENV !== 'production' ||
  corsOrigins.includes(origin.replace(/\/$/, ''))
);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Socket.IO middleware - verify token
io.use((socket, next) => {
  const token = socket.handshake.auth.token || getAuthCookie({ headers: socket.handshake.headers });
  if (!token) {
    return next(new Error('Missing authentication token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.handshake.auth.userId = decoded.userId;
    socket.handshake.auth.user = decoded;
    next();
  } catch (error) {
    return next(new Error('Invalid token'));
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`✓ New user connected: ${socket.id}`);
  setupSocketHandlers(io, socket);
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { io };
export default app;
