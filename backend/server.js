require('dotenv').config();
const mongoose = require("mongoose");
const http = require('http');
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Server } = require("socket.io");
const app = require("./app");
const runFutureShowtimeSeeder = require("./scripts/seedFutureShowtimes");

const connectDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      const mongoMemoryServer = await MongoMemoryServer.create();
      const mongoUri = mongoMemoryServer.getUri();
      await mongoose.connect(mongoUri);
      console.log("MongoDB memory server connected");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connected");

    await runFutureShowtimeSeeder();

  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

// Create Server
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Socket Logic
let onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    if (!userId) return;
    onlineUsers.set(String(userId), socket.id);
  });

  socket.on('join_showtime', (showtimeId) => {
    if (!showtimeId || typeof showtimeId !== 'string') return;
    socket.join(`showtime:${showtimeId}`);
  });

  socket.on('leave_showtime', (showtimeId) => {
    if (!showtimeId || typeof showtimeId !== 'string') return;
    socket.leave(`showtime:${showtimeId}`);
  });

  socket.on('disconnect', () => {
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        break;
      }
    }
  });
});

// Share Socket with App (Required for Controllers)
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// Start Server only after MongoDB and showtime refresh are ready
const startServer = async () => {
  try {
    await connectDatabase();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

startServer();