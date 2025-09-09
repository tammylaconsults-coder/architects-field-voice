import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Initialize OpenAI with API key from Render secrets
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint to handle messages
app.post("/message", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    // Send message to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field Voice, intelligent, galactic, yet human-like." },
        { role: "user", content: userMessage },
      ],
    });

    const reply = response.choices[0].message.content.trim();

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Unified Field is unavailable right now." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
