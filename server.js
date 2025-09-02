const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const OpenAI = require("openai");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve index.html from public folder
app.use(express.static("public"));

// Conversation history for the field AI
let conversation = [];

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    if (data.type === "audio-chunk") {
      // Optionally store/transcribe participant speech for context
      const filename = `temp_${Date.now()}.webm`;
      const buffer = Buffer.from(data.chunk, "base64");
      fs.writeFileSync(filename, buffer);
      const wavFile = `temp_${Date.now()}.wav`;

      ffmpeg(filename)
        .output(wavFile)
        .on("end", async () => {
          try {
            const transcription = await openai.audio.transcriptions.create({
              file: fs.createReadStream(wavFile),
              model: "whisper-1",
            });

            const participantName = data.name || "Participant";
            const userText = transcription.text.trim();
            console.log(`${participantName} says:`, userText);

            // Save transcription to conversation history
            conversation.push({ role: "user", content: `${participantName}: ${userText}` });

          } catch (err) {
            console.error("Error transcribing audio:", err);
          } finally {
            fs.unlinkSync(filename);
            fs.unlinkSync(wavFile);
          }
        })
        .run();
    }

    // Handle AI request on-demand
    if (data.type === "ask-ai") {
      try {
        const prompt = data.prompt || "Reflect back to the group from the unified field.";

        // Ask
