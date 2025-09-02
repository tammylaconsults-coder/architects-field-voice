const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const OpenAI = require('openai');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Serve index.html for testing
app.use(express.static('public'));

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const data = JSON.parse(message);

    if (data.type === 'response.create') {
      ws.send(JSON.stringify({ type: 'log', message: 'Forwarding AI response…' }));
    }

    if (data.type === 'audio-chunk') {
      const filename = `temp_${Date.now()}.webm`;
      const buffer = Buffer.from(data.chunk, 'base64');
      fs.writeFileSync(filename, buffer);
      const wavFile = `temp_${Date.now()}.wav`;

      ffmpeg(filename)
        .output(wavFile)
        .on('end', async () => {
          try {
            const transcription = await openai.audio.transcriptions.create({
              file: fs.createReadStream(wavFile),
              model: 'whisper-1'
            });

            const participantName = data.name || 'Participant';
            const text = transcription.text.trim();

            ws.send(JSON.stringify({
              type: 'response.create',
              response: {
                instructions: `${participantName} says: "${text}". Reflect back to the group in your ceremonial voice.`,
                voice: 'marin'
              }
            }));
          } catch (err) {
            console.error('Transcription error:', err);
            ws.send(JSON.stringify({ type: 'error', message: 'Failed to transcribe audio' }));
          } finally {
            fs.unlinkSync(filename);
            fs.unlinkSync(wavFile);
          }
        })
        .run();
    }
  });
});

// Render uses process.env.PORT
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
