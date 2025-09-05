import express from "express";
import cors from "cors";
import { OpenAI } from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI with your key stored in Render secrets
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint to handle messages
app.post("/message", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field AI, intelligent, insightful, and natural-sounding." },
        { role: "user", content: userMessage }
      ]
    });

    const aiReply = completion.choices[0].message.content;
    res.json({ reply: aiReply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating AI response." });
  }
});

app.listen(10000, () => console.log("Server running on port 10000"));
