import { useMemo, useState } from 'react';
import InputSection from './components/InputSection';
import TaskBlock from './components/TaskBlock';

const API_URL = 'http://localhost:3000/api/solve';

function TaskBoard({ tasks }) {
  if (tasks.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-gray-700 bg-gray-800/70 p-4 text-sm text-gray-400">
        Waiting for plan...
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {tasks.map((task) => (
        <TaskBlock
          key={task.id}
          task={task}
          status={task.status || 'pending'}
          content={task.content || ''}
        />
      ))}
    </section>
  );
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [systemStatus, setSystemStatus] = useState('idle');

  const summary = useMemo(() => {
    const done = tasks.filter((task) => task.status === 'done').length;
    return `${done}/${tasks.length} tasks completed`;
  }, [tasks]);

  const updateTask = (taskId, updater) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? updater(task) : task)));
  };

  const processSseMessage = (payload) => {
    if (payload.type === 'system') {
      setSystemStatus(payload.status || 'idle');
      return;
    }

    if (payload.type === 'plan') {
      setTasks(
        (payload.tasks || []).map((task) => ({
          ...task,
          status: 'pending',
          content: '',
        })),
      );
      return;
    }

    if (payload.type === 'start') {
      updateTask(payload.taskId, (task) => ({ ...task, status: 'running' }));
      return;
    }

    if (payload.type === 'token') {
      updateTask(payload.taskId, (task) => ({
        ...task,
        status: task.status === 'done' ? task.status : 'running',
        content: `${task.content || ''}${payload.content || ''}`,
      }));
      return;
    }

    if (payload.type === 'done') {
      updateTask(payload.taskId, (task) => ({ ...task, status: 'done' }));
      return;
    }

    if (payload.type === 'error') {
      if (payload.taskId != null) {
        updateTask(payload.taskId, (task) => ({ ...task, status: 'error' }));
      }
      setSystemStatus('error');
    }
  };

  const handleStart = async ({ files }) => {
    setIsRunning(true);
    setSystemStatus('starting');
    setTasks([]);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      (files || []).forEach((file) => formData.append('files', file));

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || '';

        for (const message of messages) {
          const line = message
            .split('\n')
            .find((entry) => entry.startsWith('data: '));

          if (!line) continue;

          const rawJson = line.replace(/^data:\s*/, '').trim();
          if (!rawJson) continue;

          try {
            const payload = JSON.parse(rawJson);
            processSseMessage(payload);
          } catch {
            // Ignore malformed chunks and continue reading stream.
          }
        }
      }

      setSystemStatus((prev) => (prev === 'error' ? prev : 'complete'));
    } catch (error) {
      setSystemStatus('error');
      console.error('Failed to run solve request:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 px-4 py-8 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <InputSection
          prompt={prompt}
          onPromptChange={setPrompt}
          onStart={handleStart}
          isRunning={isRunning}
        />

        <section className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Task Board</h2>
            <span className="text-xs text-gray-400">{summary}</span>
          </div>
          <p className="mb-4 text-sm text-gray-300">System status: {systemStatus}</p>
          <TaskBoard tasks={tasks} />
        </section>
      </div>
    </main>
  );
}

export default App;
