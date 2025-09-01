import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve the static frontend
app.use(express.static(path.join(__dirname, "public")));

// The Realtime API expects SDP in/out
app.use("/session", express.text({ type: "application/sdp" }));

app.post("/session", async (req, res) => {
  try {
    const r = await fetch(
      // Current GA realtime model; you can switch voice to "cedar", "alloy", etc.
      "https://api.openai.com/v1/realtime?model=gpt-realtime&voice=marin",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime=v1"
        },
        body: req.body
      }
    );

    const sdp = await r.text();
    res.status(r.status);
    res.setHeader("Content-Type", "application/sdp");
    res.send(sdp);
  } catch (err) {
    console.error(err);
    res.status(500).send(String(err));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Architects Field-Voice listening on http://localhost:${PORT}`)
);
