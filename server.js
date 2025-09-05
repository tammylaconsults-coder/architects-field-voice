import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import OpenAI from "openai";

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Handle text messages
app.post("/message", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field, speaking with collective resonance." },
        { role: "user", content: userMessage }
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing message.");
  }
});

// Handle text-to-speech
app.post("/speak", async (req, res) => {
  const text = req.body.text;

  try {
    const response = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "verse", // clean + resonant
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating speech.");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
