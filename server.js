import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
let db;
(async () => {
  db = await open({
    filename: "./conversations.db",
    driver: sqlite3.Database,
  });

  // Create table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint: fetch conversation history
app.get("/history", async (req, res) => {
  try {
    const rows = await db.all("SELECT sender, message, timestamp FROM messages ORDER BY id ASC LIMIT 50");
    res.json({ history: rows });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

// Endpoint: handle messages
app.post("/message", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    // Save user message
    await db.run("INSERT INTO messages (sender, message) VALUES (?, ?)", ["You", userMessage]);

    // Ask OpenAI for response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field Voice. Respond in a supportive, intelligent, and resonant way." },
        { role: "user", content: userMessage },
      ],
    });

    const reply = completion.choices[0].message.content || "…";

    // Save reply
    await db.run("INSERT INTO messages (sender, message) VALUES (?, ?)", ["Unified Field", reply]);

    res.json({ reply });
  } catch (err) {
    console.error("Error in /message:", err);
    res.status(500).json({ error: "Failed to process message" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
