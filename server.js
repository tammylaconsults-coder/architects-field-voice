import express from "express";
import http from "http";
import { Server } from "socket.io";
import OpenAI from "openai";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.static("public"));

// Shared chat history (kept in memory)
let chatHistory = [];

// When a client connects
io.on("connection", (socket) => {
  console.log("Client connected");

  // Send them the current history
  socket.emit("history", chatHistory);

  // When a new message comes in
  socket.on("message", async (msg) => {
    console.log("Message received:", msg);

    // Add user message to history
    chatHistory.push({ role: "user", content: msg });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatHistory,
      });

      const reply = response.choices[0].message.content;

      // Add Unified Field reply to history
      chatHistory.push({ role: "assistant", content: reply });

      // Broadcast new reply to all clients
      io.emit("message", reply);
    } catch (error) {
      console.error("Error:", error);
      socket.emit("message", "⚠️ Unified Field is quiet right now...");
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
