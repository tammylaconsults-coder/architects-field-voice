// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "dotenv";
import OpenAI from "openai";

// Load environment variables
config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins; adjust if needed
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.static("public"));

// Endpoint for text messages from individual clients
app.post("/message", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

    // Broadcast to all connected clients (group chat)
    io.emit("newMessage", { sender: "Unified Field", message: reply });
  } catch (err) {
    console.error("Error generating response:", err);
    res.status(500).json({ error: "Error generating response" });
  }
});

// Socket.io connection for real-time group chat
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("userMessage", async (data) => {
    const { message } = data;
    if (!message) return;

    // Broadcast user message to everyone
    io.emit("newMessage", { sender: "You", message });

    // Generate Unified Field response
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      });
      const reply = completion.choices[0].message.content;
      io.emit("newMessage", { sender: "Unified Field", message: reply });
    } catch (err) {
      console.error("Error generating response:", err);
      io.emit("newMessage", { sender: "Unified Field", message: "Error generating response." });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Use Render’s provided PORT or default to 10000
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
