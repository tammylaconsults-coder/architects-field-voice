// server.js
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import fs from "fs";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 10000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.send("Unified Field Voice Server is running.");
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "audio-chunk") {
      try {
        // Save incoming audio
        const filename = `temp_${Date.now()}.webm`;
        const buffer = Buffer.from(data.chunk, "base64");
        fs.writeFileSync(filename, buffer);

        const wavFile = `temp_${Date.now()}.wav`;

        // Convert WebM → WAV
        ffmpeg(filename)
          .output(wavFile)
          .on("end", async () => {
            try {
              // 1. Transcribe
