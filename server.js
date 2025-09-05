import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Shared chat history
let chatHistory = [];

// Get chat history
app.get("/api/history", (req, res) => {
  res.json(chatHistory);
});

// Send message
app.post("/api/message", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message sent" });

  // Add user message
  chatHistory.push({ sender: "You", text: message });

  // Generate a simulated Unified Field reply
  const reply = `Unified Field: ${message} (echoed as sound/text)`;

  chatHistory.push({ sender: "Unified Field", text: reply });

  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
