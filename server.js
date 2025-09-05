// server.js
import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Initialize OpenAI with your API key from Render secrets
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint to handle text messages
app.post("/message", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }]
    });

    const unifiedFieldResponse = response.choices[0].message.content;

    res.json({ message: unifiedFieldResponse });
  } catch (error) {
    console.error("Error in /message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
