// server.js
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import OpenAI from "openai";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files (your client-side index.html, etc.)
app.use(express.static("public"));

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in Render Dashboard
});

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    console.log("Received:", message.toString());

    try {
      // Ask OpenAI for a response
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are the voice of the Unified Field. Respond reflectively to the group." },
          { role: "user", content: message.toString() },
        ],
      });

      const reply = completion.choices[0].message.content;
      console.log("AI Reply:", reply);

      // Send response back to client
      ws.send(reply);
    } catch (err) {
      console.error("Error calling OpenAI:", err);
      ws.send("Error: Unable to connect to Unified Field right now.");
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Use Render’s assigned port (or 8080 locally)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
