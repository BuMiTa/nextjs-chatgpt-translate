// pages/api/translate.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'google/gemini-flash-1.5', 
                prompt: `Translate all of the content to Vietnamese, don't output anything else.: ${text}`
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: errorData.error });
        }

        const data = await response.json();
        const translation = data.choices[0].text.trim();
        res.status(200).json({ translation });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', reason: error });
    }
}
