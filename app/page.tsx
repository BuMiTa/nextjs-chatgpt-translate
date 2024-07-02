"use client";
import React, { useState } from 'react';
import { generateDocx } from '../utils/generateDocx'; // Adjust the import path as necessary

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setText('');

        if (!file) {
            setError('Please select a file to upload.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setText(data.text);
                const translateResponse = await fetch('/api/translate', {
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({ text: data.text }),
                });
                const translateData = await translateResponse.json();
                if (translateResponse.ok) {
                    setTranslatedText(translateData.translation);

                    // Generate the .docx file with translated and original lines
                    const docxBlob = await generateDocx(translateData.split, translateData.translation);
                    const url = window.URL.createObjectURL(docxBlob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "translated.docx";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } else {
                    setText(translateData.error);
                }
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Upload PDF, DOC, or DOCX and Extract Text</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                <br />
                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload and Extract'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {text && (
                <div>
                    <h2>Extracted Text:</h2>
                    <pre className="pre">{text}</pre>
                    <pre className="translated">{translatedText}</pre>
                </div>
            )}
        </div>
    );
}
