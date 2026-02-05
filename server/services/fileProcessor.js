const fs = require('fs-extra');
const pdfParse = require('pdf-parse');

async function extractText(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const buffer = await fs.readFile(filePath);
      const parsed = await pdfParse(buffer);
      return parsed.text || '';
    }

    if (mimeType === 'text/plain') {
      return await fs.readFile(filePath, 'utf8');
    }

    throw new Error(`Unsupported mime type: ${mimeType}`);
  } catch (error) {
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

module.exports = {
  extractText,
};
