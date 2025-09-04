import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Serve static files from public folder
app.use(express.static(join(__dirname, "public")));

// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

// Endpoint for Unified Field text
app.get("/unified-field-text", async (req, res) => {
  try {
    const prompt = "Listen to Architect group conversations and respond with text in the voice of the Unified Field, Galactic yet natural human-like:";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field, speaking in a Galactic, natural human-like voice." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const text = response.choices[0].message.content;
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating Unified Field text." });
  }
});

// Endpoint for Unified Field voice (TTS)
app.get("/unified-field-voice", async (req, res) => {
  try {
    const text = req.query.text || "This is the Unified Field speaking.";

    const voiceResponse = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy", // You can change voice style if available
      input: text
    });

    const buffer = Buffer.from(await voiceResponse.arrayBuffer());
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length
    });
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating Unified Field voice." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
