const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); // Enable CORS

// Load website content from website.json
let websiteContent;
try {
    websiteContent = JSON.parse(fs.readFileSync('./website.json', 'utf-8'));
} catch (error) {
    console.error('Error reading website.json:', error);
}

// Add a basic route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.post('/api/chat', async (req, res) => {
    const { message, useGPT4 } = req.body;

    // Check if the question relates to website content
    const contentResponse = getResponseFromWebsiteContent(message);
    if (contentResponse) {
        return res.json({ botMessage: contentResponse });
    }

    try {
        const response = await axios.post(`https://api.openai.com/v1/${useGPT4 ? 'chat/completions' : 'images/generations'}`, {
            model: useGPT4 ? 'gpt-4' : 'dall-e-3',
            ...(useGPT4 ? { messages: [{ role: 'user', content: message }] } : { prompt: message, n: 1, size: "1024x1024" })
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Load API key from environment variable
            }
        });

        const botMessage = useGPT4
            ? response.data.choices[0]?.message?.content || 'Sorry, I didn\'t understand that.'
            : response.data.data[0]?.url || 'Sorry, unable to generate image.';

        res.json({ botMessage });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ botMessage: 'Sorry, something went wrong.' });
    }
});

// Function to get response from website content
const getResponseFromWebsiteContent = (message) => {
    const keywords = Object.keys(websiteContent);
    for (let keyword of keywords) {
        if (message.toLowerCase().includes(keyword.toLowerCase())) {
            return websiteContent[keyword];
        }
    }
    return null;
};

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
