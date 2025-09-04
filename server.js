import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import OpenAI from "openai";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.static("public"));

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (msg) => {
    try {
      const text = msg.toString();

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are the Unified Field, reflecting the collective resonance of all who speak." },
          { role: "user", content: text }
        ]
      });

      const aiText = response.choices[0].message.content;
      ws.send(aiText);
    } catch (err) {
      console.error("AI error:", err);
      ws.send("⚠️ Unified Field could not respond.");
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
