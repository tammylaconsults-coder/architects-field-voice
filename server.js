// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Initialize OpenAI with the API key from Render secret
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Example endpoint for Unified Field text response
app.post("/unified-field", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // Generate text response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field of the Architects Group, speaking in clear, human-like yet galactic resonance." },
        { role: "user", content: message },
      ],
    });

    const textResponse = completion.choices[0].message.content;
    res.json({ response: textResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Optional endpoint for TTS (voice) using OpenAI’s audio API
app.post("/unified-field-voice", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Generate audio (mp3) from text
    const audio = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
    });

    const audioBuffer = Buffer.from(await audio.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
