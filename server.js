const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * REAL AI Integration using Groq API
 * Super fast responses (1-2 seconds!)
 */
const generateAIResponse = async (prompt) => {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY not found in environment variables');
    }

    try {
        console.log('🤖 Calling Groq AI API...');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',  // Updated to supported model
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500,
                top_p: 1,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API Error:', errorText);
            throw new Error(`Groq API request failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ AI Response received!');

        return data.choices[0].message.content;

    } catch (error) {
        console.error('Error calling Groq API:', error.message);
        throw error;
    }
};

// Routes
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (prompt.length > 500) {
            return res.status(400).json({ error: 'Prompt is too long (max 500 characters)' });
        }

        console.log(`📝 Received prompt: ${prompt}`);

        const response = await generateAIResponse(prompt);

        res.json({
            response,
            timestamp: new Date().toISOString(),
            provider: 'Groq AI'
        });

    } catch (error) {
        console.error('❌ Error generating response:', error.message);
        res.status(500).json({
            error: 'Failed to generate response',
            details: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'AI Chat Backend with Groq API',
        endpoints: {
            chat: 'POST /api/chat',
            health: 'GET /'
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   🚀 AI Chat Server Started!          ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║   Port: ${PORT}                            ║`);
    console.log('║   AI Provider: Groq (Super Fast!)     ║');
    console.log('║   Status: ✅ Ready                      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n📡 API Endpoint: http://localhost:${PORT}/api/chat\n`);
});