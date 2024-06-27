// pages/api/upload.js

import { IncomingForm } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing the file' });
      return;
    }

    const file = files.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    try {
      const filePath = file[0].filepath || file[0].path;
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      res.status(200).json({ text: pdfData.text });
    } catch (error) {
      res.status(500).json({ error: 'Error reading the file' });
      console.log(error);
    }
  });
};

export default handler;
