// server.js
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS so Ning can communicate with this server
app.use(cors());
app.use(express.json());

// Initialize OpenAI client using key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Optional: root endpoint for testing
app.get("/", (req, res) => {
  res.send("Unified Field server is running!");
});

// Endpoint to handle messages from Ning
app.post("/message", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    // Call OpenAI API to generate response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field. Respond intelligently and concisely." },
        { role: "user", content: userMessage }
      ]
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error("Error handling message:", error);
    res.status(500).json({ reply: "Error connecting to server." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
