import { useMemo, useState } from 'react';
import { generateTool } from './generateTool.js';

const DEFAULT_PROMPT = 'Create a simple calculator';

function buildIframeHTML({ html = '', css = '', js = '' }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<style>${css || ''}</style>
</head>
<body>
${html || '<p>No HTML returned.</p>'}
<script type="module">
${js || ''}
</script>
</body>
</html>`;
}

function App() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [toolCode, setToolCode] = useState({ html: '', css: '', js: '' });
  const [history, setHistory] = useState([]);
  const [iterationPrompt, setIterationPrompt] = useState('');
  const [iframeDoc, setIframeDoc] = useState('');
  const endpoint = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('endpoint') || 'https://questit.cc/api/ai/proxy';
  }, []);
  const hasGenerated = Boolean(toolCode.html || toolCode.css || toolCode.js);

  const handleGenerate = async (event) => {
    event?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setActiveAction('generate');
    setIsGenerating(true);
    setErrorMessage('');
    setStatusMessage('Generating tool…');

    try {
      const result = await generateTool(prompt.trim(), endpoint);
      setToolCode(result);
      setIframeDoc(buildIframeHTML(result));
      setHistory([{ type: 'initial', prompt: prompt.trim(), code: result }]);
      setIterationPrompt('');
      setStatusMessage('✅ Tool generated. Review the preview below.');
    } catch (error) {
      console.error('Generation error:', error);
      setErrorMessage(error?.message || 'Failed to generate tool.');
      setIframeDoc('');
      setStatusMessage('');
      setToolCode({ html: '', css: '', js: '' });
      setHistory([]);
    } finally {
      setActiveAction(null);
      setIsGenerating(false);
    }
  };

  const handleIterate = async (event) => {
    event?.preventDefault();
    if (!iterationPrompt.trim() || !hasGenerated || isGenerating) return;

    setActiveAction('iterate');
    setIsGenerating(true);
    setErrorMessage('');
    setStatusMessage('Applying iteration…');

    try {
      const updated = await generateTool(iterationPrompt.trim(), endpoint, toolCode);
      setToolCode(updated);
      setIframeDoc(buildIframeHTML(updated));
      setHistory((previous) => [
        ...previous,
        { type: 'iteration', prompt: iterationPrompt.trim(), code: updated }
      ]);
      setIterationPrompt('');
      setStatusMessage('✅ Iteration applied. Preview updated.');
    } catch (error) {
      console.error('Iteration error:', error);
      setErrorMessage(error?.message || 'Failed to apply iteration.');
      setStatusMessage('');
    } finally {
      setActiveAction(null);
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Questit Workbench</h1>
        <p>Describe the tool you want. We’ll ask the model to return HTML, CSS, and JS and render it below.</p>
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
        <button type="submit" disabled={isGenerating}>
          {isGenerating ? (activeAction === 'generate' ? 'Generating…' : 'Working…') : 'Generate Tool'}
        </button>
      </form>

      {statusMessage && <div className="status">{statusMessage}</div>}
      {errorMessage && (
        <div className="error">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <section className="preview">
        <h2>Preview</h2>
        <div className="preview-surface">
          {iframeDoc ? (
            <iframe
              title="Questit preview"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={iframeDoc}
            />
          ) : (
            <p className="placeholder">Generated tool will appear here.</p>
          )}
        </div>
      </section>

      {hasGenerated && (
        <section className="iteration">
          <h2>Iterate</h2>
          <p>Tell the model how to evolve the current tool. It will return a fresh HTML/CSS/JS bundle.</p>
          <form onSubmit={handleIterate} className="iterate-form">
            <label htmlFor="iteration">
              Update instructions
              <textarea
                id="iteration"
                className="compact"
                value={iterationPrompt}
                onChange={(event) => setIterationPrompt(event.target.value)}
                placeholder="For example: add keyboard shortcuts and a dark theme toggle."
                rows={3}
              />
            </label>
            <button type="submit" disabled={isGenerating || !iterationPrompt.trim()}>
              {isGenerating && activeAction === 'iterate' ? 'Applying…' : 'Apply Update'}
            </button>
          </form>
        </section>
      )}

      {hasGenerated && (
        <section className="code-output">
          <h2>Generated Code</h2>
          <details open>
            <summary>HTML</summary>
            <pre>{toolCode.html || '// No HTML returned'}</pre>
          </details>
          <details>
            <summary>CSS</summary>
            <pre>{toolCode.css || '// No CSS returned'}</pre>
          </details>
          <details>
            <summary>JavaScript</summary>
            <pre>{toolCode.js || '// No JS returned'}</pre>
          </details>
        </section>
      )}

      {history.length > 0 && (
        <section className="history">
          <h2>Session History</h2>
          <ol>
            {history.map((entry, index) => {
              const label = entry.type === 'initial' ? 'Initial prompt' : `Iteration ${index}`;
              return (
                <li key={`${entry.type}-${index}`}>
                  <span className="history-tag">{label}</span>
                  <p>{entry.prompt}</p>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}

export default App;
