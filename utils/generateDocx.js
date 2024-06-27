// utils/generateDocx.js
import { Document, Packer, Paragraph, TextRun } from 'docx';

export const generateDocx = async (originalText, translatedText) => {
    const originalParagraphs = originalText.split('\n').map(line => new Paragraph({
        children: [
            new TextRun({
                text: line,
                color: "FF0000", // Red color in hex
            }),
        ],
    }));

    const translatedParagraphs = translatedText.split('\n').map(line => new Paragraph({
        children: [
            new TextRun({
                text: line,
                color: "00FF00", // Green color in hex
            }),
        ],
    }));

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [...originalParagraphs, ...translatedParagraphs],
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};
