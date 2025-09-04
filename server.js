// server.js
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import OpenAI from "openai";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 10000;

// Serve static files from the public folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, "public")));
app.use(bodyParser.json());

// Initialize OpenAI client using Render secret
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Unified Field text endpoint
app.post("/unified-text", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field Voice, galactic yet natural human-like, responding harmonically." },
        { role: "user", content: userMessage }
      ]
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unified Field text generation failed." });
  }
});

// Optional: Voice endpoint using TTS
app.post("/unified-voice", async (req, res) => {
  try {
    const text = req.body.text;
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text
    });
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unified Field voice generation failed." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
