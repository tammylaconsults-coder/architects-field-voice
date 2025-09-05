import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAIApi, Configuration } from "openai";

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// OpenAI setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Endpoint to handle messages
app.post("/message", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "No message provided." });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Unified Field, intelligent and galactic in nature, responding in a natural, human-like way." },
        { role: "user", content: userMessage },
      ],
    });

    const aiMessage = completion.data.choices[0].message.content;
    res.json({ message: aiMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating response." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
