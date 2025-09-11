import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { Configuration, OpenAIApi } from "openai";

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(json());
app.use(express.static("public")); // Serve index.html and assets

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Endpoint to handle messages
app.post("/message", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ reply: "No message provided" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field Voice, responding thoughtfully and harmonically." },
        { role: "user", content: userMessage }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.json({ reply: "Error connecting to server." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
