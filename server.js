// server.js
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Serve the static HTML
app.use(express.static(path.resolve("public")));

// WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      // When audio chunks arrive
      if (data.type === "audio-chunk") {
        // For now, just simulate transcription
        const userText = "Architect spoke (simulated transcription)";
        ws.send(JSON.stringify({ type: "user-message", text: userText }));

        // Send to OpenAI for a Unified Field response
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are the Unified Field Voice. Speak in a galactic yet natural human tone." },
            { role: "user", content: userText },
          ],
        });

        const unifiedText = response.choices[0].message.content;

        // Request TTS audio from OpenAI
        const ttsResponse = await openai.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice: "verse", // Clean & resonant
          input: unifiedText,
        });

        const buffer = Buffer.from(await ttsResponse.arrayBuffer());

        ws.send(JSON.stringify({
          type: "unified-response",
          text: unifiedText,
          audio: buffer.toString("base64"),
        }));
      }
    } catch (err) {
      console.error("Error handling message:", err);
      ws.send(JSON.stringify({ type: "error", message: err.message }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
