import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import OpenAI from "openai";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Handle text messages
app.post("/message", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field voice." },
        { role: "user", content: userMessage }
      ]
    });

    const reply = completion.choices[0].message.content;

    // Broadcast to all connected clients
    io.emit("chat message", { sender: "Unified Field", text: reply });

    res.json({ reply });
  } catch (error) {
    console.error("Error handling message:", error);
    res.status(500).json({ error: "Error processing message" });
  }
});

// Socket.io events
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("chat message", (msg) => {
    // Re-broadcast to everyone (including sender)
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 100
