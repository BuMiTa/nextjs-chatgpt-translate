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
                model: 'openai/gpt-4o', 
                prompt: `print this text, remove any line break if they are in the middle of the sentence, split each and every sentence using line break: ${text}`
            })
        });

        if (!splitResponse.ok) {
            const errorData = await splitResponse.json();
            return res.status(splitResponse.status).json({ error: errorData.error });
        }
        

        const splitData = await splitResponse.json();
        const split = splitData.choices[0].text.trim();
        console.log(split)

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o', 
                prompt: `Translate the content to Vietnamese.: ${split}`
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: errorData.error });
        }

        const data = await response.json();
        const translation = data.choices[0].text.trim();
        res.status(200).json({ split, translation });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', reason: error });
    }
}
