const path = require('path');
const fs = require('fs-extra');

const { LLMProvider } = require('./llmAdapter');

async function planTasks(userQuery, contextText) {
  const promptPath = path.join(__dirname, '..', 'prompts', 'orchestrator.md');
  const systemPrompt = await fs.readFile(promptPath, 'utf8');

  const userPrompt = [
    `User query:\n${userQuery || ''}`,
    `\nFile context:\n${contextText || ''}`,
    '\nReturn valid JSON only in the schema: {"tasks":[{"id":number,"description":string}]}.',
  ].join('\n');

  const provider = new LLMProvider({ model: 'mock-orchestrator' });
  const rawResponse = await provider.generate(systemPrompt, userPrompt);

  let parsed;
  try {
    parsed = JSON.parse(rawResponse);
  } catch (error) {
    throw new Error(`Failed to parse orchestrator response as JSON: ${error.message}`);
  }

  if (!parsed || !Array.isArray(parsed.tasks)) {
    throw new Error('Invalid orchestrator response: missing tasks array');
  }

  return parsed.tasks;
}

module.exports = {
  planTasks,
};
