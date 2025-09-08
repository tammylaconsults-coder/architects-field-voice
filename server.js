import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// OpenAI client using secret from Render environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint to handle messages from client
app.post("/message", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Error handling message:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// Optional endpoint to log conversations
// POST { conversation: "full text of conversation" }
app.post("/log", (req, res) => {
  try {
    const conversation = req.body.conversation;
    if (!conversation) return res.status(400).json({ error: "No conversation provided" });

    // For simplicity, just print to console; you can replace with file/db storage
    console.log("Logged conversation:\n", conversation);

    res.json({ status: "Conversation logged successfully" });
  } catch (err) {
    console.error("Error logging conversation:", err);
    res.status(500).json({ error: "Failed to log conversation" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
