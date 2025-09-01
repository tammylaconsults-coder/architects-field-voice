const WebSocket = require('ws');
const fs = require('fs');
const { OpenAI } = require('@openai/openai');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const data = JSON.parse(message);

    if (data.type === 'response.create') {
      // Forward directly to OpenAI Realtime session (existing AI logic)
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
          const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(wavFile),
            model: 'whisper-1'
          });

          const participantName = data.name || 'Participant';
          const text = transcription.text.trim();

          ws.send(JSON.stringify({
            type: 'response.create',
            response: { instructions: `${participantName} says: "${text}". Reflect back to the group in your ceremonial voice.`, voice: 'marin' }
          }));

          fs.unlinkSync(filename);
          fs.unlinkSync(wavFile);
        })
        .run();
    }
  });
});
