const pLimit = require('p-limit');
const config = require('../../config.json');

const { LLMProvider } = require('./llmAdapter');

async function executeTasks(tasks, contextText, onEvent = () => {}) {
  const solverConfig = config.solvers?.[0] || {};
  const concurrency = Number(solverConfig.maxConcurrent) || 1;
  const limit = pLimit(concurrency);

  const runTask = async (task) => {
    const taskId = task?.id;
    try {
      onEvent({ taskId, type: 'start' });

      const provider = new LLMProvider(solverConfig);
      const systemPrompt = 'You are a solver model. Produce a concise answer for the assigned task.';
      const userPrompt = [
        `Task: ${task?.description || ''}`,
        `\nContext:\n${contextText || ''}`,
      ].join('\n');

      await provider.stream(systemPrompt, userPrompt, (token) => {
        onEvent({ taskId, type: 'token', content: token });
      });

      onEvent({ taskId, type: 'done' });
    } catch (error) {
      onEvent({ taskId, type: 'error', error: error.message });
    }
  };

  await Promise.all((tasks || []).map((task) => limit(() => runTask(task))));
}

module.exports = {
  executeTasks,
};
