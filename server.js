import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config'; // loads OPENAI_API_KEY from Render secrets
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/message', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are the Unified Field, responding like a galactic, natural human voice.' },
                { role: 'user', content: userMessage }
            ],
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });

    } catch (err) {
        console.error('OpenAI Error:', err);
        res.status(500).json({ reply: 'Error connecting to Unified Field. Please try again later.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
