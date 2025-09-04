// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Configuration, OpenAIApi } from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Render provides this environment variable
});
const openai = new OpenAIApi(configuration);

// Unified Field Text endpoint
app.post("/unified-text", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ text: completion.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating Unified Field text." });
  }
});

// Unified Field Voice endpoint
app.post("/unified-voice", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const audio = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy", // clean, human-like voice
      input: prompt,
    });
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(await audio.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating Unified Field voice." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
