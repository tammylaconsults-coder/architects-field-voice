import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// Boilerplate for ES modules (__dirname not available by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// Serve static files from "public" (index.html, CSS, background.jpg, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Store chat history (resets when server restarts)
let chatHistory = [];

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  // Send chat history to new user
  socket.emit("chat history", chatHistory);

  // Handle new messages
  socket.on("chat message", (msg) => {
    const message = {
      id: socket.id,
      text: msg,
      timestamp: new Date().toISOString()
    };

    // Save to history
    chatHistory.push(message);

    // Broadcast to everyone
    io.emit("chat message", message);
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

// Use Render's assigned port or 3000 locally
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
