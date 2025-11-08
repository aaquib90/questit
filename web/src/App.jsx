import { useMemo, useRef, useState } from 'react';
import Questit from '@questit/index.js';
import { publishTool } from '@questit/core/publish.js';

const DEFAULT_PROMPT = 'Create a simple calculator';

function App() {
  const questit = useMemo(() => new Questit(), []);
  const outputRef = useRef(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTool, setCurrentTool] = useState(null);
  const [publishMessage, setPublishMessage] = useState('');
  const [apiBase] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const fallback = window.location.hostname.includes('localhost')
      ? 'https://questit-publish-staging.aaquib-b71.workers.dev'
      : 'https://questit.cc/api';
    return params.get('apiBase') || fallback;
  });

  const handleGenerate = async (event) => {
    event?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage('');
    setPublishMessage('');
    setStatusMessage('Generating tool…');

    try {
      const container = await questit.process(prompt.trim(), {}, 'render');
      const tool = questit.currentTool;
      if (!container || !tool) {
        throw new Error('Tool generation did not return a usable result.');
      }

      if (outputRef.current) {
        outputRef.current.innerHTML = '';
        outputRef.current.appendChild(container);
      }

      setCurrentTool(tool);
      setStatusMessage('✅ Tool generated. Review the preview below.');
    } catch (error) {
      console.error('Generation error:', error);
      setErrorMessage(error?.message || 'Failed to generate tool.');
      setStatusMessage('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!currentTool) {
      setErrorMessage('Generate a tool before publishing.');
      return;
    }
    setPublishMessage('');
    setErrorMessage('');
    setStatusMessage('Publishing tool…');
    try {
      const result = await publishTool(currentTool, apiBase);
      const url = `https://${result.name}.questit.cc/`;
      setPublishMessage(`✅ Tool published! Open ${url}`);
      setStatusMessage('');
    } catch (error) {
      console.error('Publish error:', error);
      setErrorMessage(error?.message || 'Publish failed.');
      setStatusMessage('');
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Questit Workbench</h1>
        <p>Enter a prompt to generate a micro-tool. Use the publish button after you are satisfied with the preview.</p>
      </header>

      <form onSubmit={handleGenerate} className="form">
        <label htmlFor="prompt">
          Prompt
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe the tool you want to build…"
            rows={4}
          />
        </label>
        <div className="buttons">
          <button type="submit" disabled={isGenerating}>
            {isGenerating ? 'Generating…' : 'Generate Tool'}
          </button>
          <button type="button" disabled={!currentTool || isGenerating} onClick={handlePublish}>
            Publish Tool
          </button>
        </div>
      </form>

      {statusMessage && <div className="status">{statusMessage}</div>}
      {errorMessage && (
        <div className="error">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}
      {publishMessage && (
        <div className="success">
          {publishMessage}
        </div>
      )}

      <section className="preview">
        <h2>Preview</h2>
        <div className="preview-surface" ref={outputRef}>
          {!currentTool && <p className="placeholder">Generated tool will appear here.</p>}
        </div>
      </section>
    </div>
  );
}

export default App;
