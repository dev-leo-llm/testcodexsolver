function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"
      aria-label="Loading"
    />
  );
}

function TaskBlock({ task, status = 'pending', content = '' }) {
  const statusMap = {
    pending: {
      container: 'opacity-60 border-gray-700 bg-gray-800',
      badge: 'bg-gray-700 text-gray-200',
      label: 'Pending',
    },
    running: {
      container: 'border-cyan-600/60 bg-gray-800',
      badge: 'bg-cyan-900 text-cyan-200',
      label: 'Running',
    },
    done: {
      container: 'border-emerald-600/60 bg-gray-800',
      badge: 'bg-emerald-900 text-emerald-200',
      label: 'Done',
    },
    error: {
      container: 'border-red-600/60 bg-gray-800',
      badge: 'bg-red-900 text-red-200',
      label: 'Error',
    },
  };

  const current = statusMap[status] || statusMap.pending;

  return (
    <article className={`rounded-xl border p-4 shadow ${current.container}`}>
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">
          #{task.id} {task.description}
        </h3>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${current.badge}`}>
          {current.label}
        </span>
      </header>

      {status === 'running' && (
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <Spinner />
          <span className="text-xs">Streaming response...</span>
        </div>
      )}

      <pre className="whitespace-pre-wrap break-words rounded-md bg-gray-900/70 p-3 text-sm text-gray-100">
        {content || (status === 'pending' ? 'Awaiting execution...' : '')}
      </pre>
    </article>
  );
}

export default TaskBlock;
