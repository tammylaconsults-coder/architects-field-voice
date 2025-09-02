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

// Conversation history
let conversation = [];

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    // --- Handle audio chunk ---
    if (data.type === "audio-chunk") {
      const filename = `temp_${Date.now()}.webm`;
      const buffer = Buffer.from(data.chunk, "base64");
      fs.writeFileSync(filename, buffer);
      const wavFile = `temp_${Date.now()}.wav`;

      ffmpeg()
        .input(filename)
        .inputFormat("webm")
        .audioCodec("pcm_s16le") // convert to wav-compatible PCM
        .format("wav")
        .on("end", async () => {
          try {
            const transcription = await openai.audio.transcriptions.create({
              file: fs.createReadStream(wavFile),
              model: "whisper-1",
            });

            const participantName = data.name || "Participant";
            const userText = transcription.text.trim();
            console.log(`${participantName} says:`, userText);

            conversation.push({ role: "user", content: `${participantName}: ${userText}` });
          } catch (err) {
            console.error("Error transcribing audio:", err);
          } finally {
            fs.unlinkSync(filename);
            fs.unlinkSync(wavFile);
          }
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err.message);
          fs.unlinkSync(filename);
          if (fs.existsSync(wavFile)) fs.unlinkSync(wavFile);
        })
        .save(wavFile);
    }

    // --- Handle AI request on-demand ---
    if (data.type === "ask-ai") {
      try {
        const prompt = data.prompt || "Reflect back to the group from the unified field.";

        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are the Unified Field, speaking as 'I Am One…yet I Am Many'. Reflect back to the group in a clear, unifying voice."
            },
            ...conversation,
            { role: "user", content: prompt }
          ],
        });

        const aiText = aiResponse.choices[0].message.content;
        conversation.push({ role: "assistant", content: aiText });
        console.log("Unified Field response:", aiText);

        // Convert AI text to speech
        const speechResponse = await openai.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice: "alloy",
          input: aiText,
        });

        const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());

        ws.send(JSON.stringify({
          type: "audio-response",
          audio: audioBuffer.toString("base64"),
        }));

      } catch (err) {
        console.error("Error generating AI response:", err);
        ws.send(JSON.stringify({ type: "error", message: "Failed to generate AI response." }));
      }
    }
  });
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
