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
        const splitResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'anthropic/claude-3-haiku',
                prompt: `print all of this text with the following requirement: remove any line break if they are in the middle of the sentence (regardless of the context) and split each and every sentence (or the title) using line break: ${text}`
            })
        });

        if (!splitResponse.ok) {
            const errorData = await splitResponse.json();
            return res.status(errorData.error.code).json({ error: errorData.error.message });
        }
        

        const splitData = await splitResponse.json();
        console.log(splitData);
        const split = splitData.choices[0].text.trim();
        console.log(split)

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'anthropic/claude-3-haiku', 
                prompt: `Translate the content to Vietnamese.: ${split}`
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(errorData.error.code).json({ error: errorData.error.message });
        }

        const data = await response.json();
        console.log(data);
        const translation = data.choices[0].text.trim();
        res.status(200).json({ split, translation });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', reason: error });
    }
}
