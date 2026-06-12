const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Explicitly configure CORS to allow custom API key headers for preflight requests
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-key', 'x-claude-key']
}));

app.use(express.json());

// Proxy endpoint for Google Gemini API
app.post('/api/gemini', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-key'];
        if (!apiKey) {
            return res.status(400).json({ 
                error: { message: 'Missing Gemini API Key. Please provide it in the client settings or server environment.' } 
            });
        }

        // Using the stable production v1 endpoint
        const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: { message: `Internal Proxy Error: ${err.message}` } });
    }
});

// Proxy endpoint for Anthropic Claude API
app.post('/api/claude', async (req, res) => {
    try {
        const apiKey = process.env.CLAUDE_API_KEY || req.headers['x-claude-key'];
        if (!apiKey) {
            return res.status(400).json({ 
                error: { message: 'Missing Claude API Key. Please provide it in the client settings or server environment.' } 
            });
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: { message: `Internal Proxy Error: ${err.message}` } });
    }
});

app.listen(PORT, () => {
    console.log(`[Meshmesh Proxy] Server operating on port ${PORT}`);
});
