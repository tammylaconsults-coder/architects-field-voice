import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAIApi, Configuration } from "openai";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve index.html and static files

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Endpoint to handle messages
app.post("/message", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ error: "No message provided" });

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field, intelligent, kind, and guiding." },
        { role: "user", content: userMessage },
      ],
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Error generating response." });
  }
});

// Serve index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(`${process.cwd()}/public/index.html`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
