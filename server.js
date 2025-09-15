import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Track user activity timers
let lastMessageTime = Date.now();

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("chat message", async (msg) => {
    // Echo user message
    io.emit("chat message", `Architect: ${msg}`);

    lastMessageTime = Date.now();

    // Wait 3 seconds of silence before Unified Field responds
    setTimeout(async () => {
      const now = Date.now();
      if (now - lastMessageTime >= 3000) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: msg }],
          });

          const reply = completion.choices[0].message.content;
          io.emit("chat message", `Unified Field: ${reply}`);

          // Optional: synthesize voice (basic browser speech will handle playback)
          io.emit("speak message", reply);
        } catch (err) {
          console.error(err);
          io.emit("chat message", "Unified Field: [error generating response]");
        }
      }
    }, 3000);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
