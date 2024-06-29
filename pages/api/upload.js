// api/upload.js
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import pdfParse from 'pdf-parse';
import WordExtractor from 'word-extractor';

const extractor = new WordExtractor();

const uploadHandler = async (req, res) => {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(500).json({ error: 'Error parsing the files' });
            return;
        }

        const file = files.file[0];
        let text = '';

        if (file.mimetype === 'application/pdf') {
            const dataBuffer = await fs.readFile(file.filepath);
            const pdfDoc = await pdfParse(dataBuffer);
            text = pdfDoc.text;
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
            const doc = await extractor.extract(file.filepath);
            text = doc.getBody();
        } else {
            res.status(400).json({ error: 'Unsupported file type' });
            return;
        }

        res.status(200).json({ text });
    });
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default uploadHandler;
