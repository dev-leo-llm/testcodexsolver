const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const multer = require('multer');
require('dotenv').config();

const { extractText } = require('./services/fileProcessor');
const { planTasks } = require('./services/orchestrator');
const { executeTasks } = require('./services/solverRunner');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, 'uploads');
const sessionsDir = path.join(__dirname, 'sessions');
const upload = multer({ dest: uploadsDir });

app.use(cors());
app.use(express.json());

async function ensureRequiredDirs() {
  await fs.ensureDir(sessionsDir);
  await fs.ensureDir(uploadsDir);
}

function sendSse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/solve', upload.array('files'), async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const userPrompt = req.body?.prompt || '';
    const files = req.files || [];

    let contextText = '';
    for (const file of files) {
      try {
        const extracted = await extractText(file.path, file.mimetype);
        contextText += `\n\n[File: ${file.originalname}]\n${extracted}`;
      } catch (error) {
        sendSse(res, {
          type: 'warning',
          file: file.originalname,
          message: `Failed to process file: ${error.message}`,
        });
      }
    }

    sendSse(res, { type: 'system', status: 'orchestrating' });

    const tasks = await planTasks(userPrompt, contextText);
    sendSse(res, { type: 'plan', tasks });

    sendSse(res, { type: 'system', status: 'solving' });

    await executeTasks(tasks, contextText, (event) => {
      sendSse(res, event);
    });

    sendSse(res, { type: 'system', status: 'complete' });
    res.end();
  } catch (error) {
    sendSse(res, { type: 'error', message: error.message || 'Unexpected error' });
    res.end();
  }
});

async function startServer() {
  try {
    await ensureRequiredDirs();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
