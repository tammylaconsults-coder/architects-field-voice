import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let conversationHistory = [];

// 📌 Save messages to daily log
function saveLog(role, content) {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const logDir = path.join(__dirname, "logs");
  const logFile = path.join(logDir, `${date}.txt`);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const entry = `[${new Date().toLocaleTimeString()}] ${role.toUpperCase()}: ${content}\n`;

  fs.appendFile(logFile, entry, (err) => {
    if (err) console.error("Error writing to log file:", err);
  });
}

io.on("connection", (socket) => {
  console.log("User connected");

  // send history to new user
  socket.emit("history", conversationHistory);

  socket.on("message", async (msg) => {
    console.log("Received:", msg);

    conversationHistory.push({ role: "user", content: msg });
    saveLog("user", msg);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationHistory,
      });

      const reply = completion.choices[0].message.content;
      conversationHistory.push({ role: "assistant", content: reply });
      saveLog("assistant", reply);

      io.emit("message", reply);
    } catch (err) {
      console.error("OpenAI error:", err);
      io.emit("message", "⚠️ Unified Field could not respond. Check API quota.");
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
