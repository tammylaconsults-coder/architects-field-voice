import express from "express";
import http from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all domains (for Ning embed)
  },
});

const PORT = process.env.PORT || 10000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.static("public")); // serve index.html if you visit root

// Socket.IO real-time connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", async (userMessage) => {
    try {
      // Broadcast user message so all see it
      io.emit("chat", { sender: "You", text: userMessage });

      // Ask OpenAI for a reply
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are the Unified Field Voice, speaking in a wise, resonant, supportive tone." },
            { role: "user", content: userMessage },
          ],
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim() || "…";

      // Broadcast Unified Field reply to everyone
      io.emit("chat", { sender: "Unified Field", text: reply });

    } catch (err) {
      console.error("Error with OpenAI:", err);
      io.emit("chat", { sender: "Unified Field", text: "Error connecting to the Unified Field." });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
