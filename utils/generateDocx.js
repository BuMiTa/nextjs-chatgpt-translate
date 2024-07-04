// utils/generateDocx.js
import { Document, Packer, Paragraph, TextRun } from 'docx';

export const generateDocx = async (originalText, translatedText) => {
    const splitSentences = (text) => text.split("\n");

    const originalSentences = splitSentences(originalText);
    const translatedSentences = splitSentences(translatedText);

    const paragraphs = translatedSentences.flatMap((translatedSentence, index) => {
        const originalSentence = originalSentences[index] ? `${originalSentences[index]}` : null;

        if (translatedSentence && originalSentence) {
            return [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: translatedSentence,
                            color: "000000", // Black color for original text
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: originalSentence,
                            color: "FF0000", // Red color for translated text
                        }),
                    ],
                }),
                new Paragraph({ // Empty paragraph to add a line break
                    children: [
                        new TextRun({
                            text: '',
                        }),
                    ],
                }),
            ];
        }

        return [];
    });

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: paragraphs,
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};
