import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAIApi, Configuration } from "openai";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve index.html from public folder

// OpenAI configuration using Render secret
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
    console.error("ERROR: OPENAI_API_KEY not set in environment!");
    process.exit(1);
}

const configuration = new Configuration({ apiKey: openaiApiKey });
const openai = new OpenAIApi(configuration);

// Example endpoint for text responses
app.post("/api/message", async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "No message provided" });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: message }]
        });

        const responseText = completion.choices[0].message.content;
        res.json({ reply: responseText });
    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ error: "OpenAI request failed" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
