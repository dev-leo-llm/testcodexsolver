import { useRef, useState } from 'react';

function InputSection({ prompt, onPromptChange, onStart, isRunning }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleStart = () => {
    onStart({ files: selectedFiles });
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-lg">
      <h1 className="mb-3 text-xl font-semibold">Local LLM Solver</h1>

      <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="solver-prompt">
        Prompt
      </label>
      <textarea
        id="solver-prompt"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Describe what you want solved..."
        className="mb-4 h-36 w-full rounded-lg border border-gray-600 bg-gray-900 p-3 text-sm text-white outline-none ring-cyan-500 transition focus:ring"
      />

      <div className="mb-3">
        <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="solver-files">
          Attach files (PDF / Images)
        </label>
        <input
          ref={fileInputRef}
          id="solver-files"
          type="file"
          accept="application/pdf,image/*"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-cyan-500"
        />
      </div>

      <div className="mb-4 text-xs text-gray-400">
        {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'No files selected'}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleStart}
          disabled={isRunning}
          className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Start'}
        </button>

        <button
          type="button"
          onClick={clearFiles}
          disabled={isRunning}
          className="rounded-md border border-gray-600 px-4 py-2 text-sm text-gray-200 transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear files
        </button>
      </div>
    </section>
  );
}

export default InputSection;
