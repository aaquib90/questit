import { useMemo, useState, useRef, useCallback } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  TextArea,
  Button,
  Tabs,
  ScrollArea,
  Separator,
  Badge,
  Callout
} from '@radix-ui/themes';
import Questit from '@questit/index.js';
import { renderTool } from '@questit/delivery/render-handler.js';
import { publishTool } from '@questit/core/publish.js';

const DEFAULT_PROMPT = 'Create a simple calculator';

function useWorkbenchConfig() {
  const params = new URLSearchParams(window.location.search);
  const endpoint = params.get('endpoint') || 'https://questit.cc/api/ai/proxy';
  const isLocalhost = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
  const fallbackApiBase = isLocalhost
    ? 'https://questit-publish-staging.aaquib-b71.workers.dev'
    : 'https://questit.cc/api';
  const apiBase = params.get('apiBase') || fallbackApiBase;
  return { endpoint, apiBase, isLocalhost };
}

function LogPanel({ entries }) {
  if (entries.length === 0) {
    return (
      <Box>
        <Text color="gray" size="2">
          Status updates will appear here.
        </Text>
      </Box>
    );
  }

  return (
    <ScrollArea type="auto" scrollbars="vertical" style={{ height: '168px' }}>
      <Flex direction="column" gap="2">
        {entries.map((entry) => (
          <Box key={entry.id} className="log-entry">
            <Text size="2" color="gray">
              {entry.timestamp}
            </Text>
            <Text size="3">{entry.message}</Text>
          </Box>
        ))}
      </Flex>
    </ScrollArea>
  );
}

function App() {
  const { endpoint, apiBase, isLocalhost } = useWorkbenchConfig();

  const questit = useMemo(
    () =>
      new Questit({
        endpoint
      }),
    [endpoint]
  );

  const previewRef = useRef(null);

  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [logEntries, setLogEntries] = useState([]);
  const [error, setError] = useState(null);
  const [tool, setTool] = useState(null);
  const [editedHtml, setEditedHtml] = useState('');
  const [editedCss, setEditedCss] = useState('');
  const [editedJs, setEditedJs] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);

  const appendLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogEntries((prev) => [
      ...prev,
      {
        id: `${timestamp}-${prev.length}`,
        timestamp,
        message
      }
    ]);
  }, []);

  const mountToolContainer = useCallback((container) => {
    const mountPoint = previewRef.current;
    if (!mountPoint) return;
    mountPoint.innerHTML = '';
    if (container) {
      mountPoint.appendChild(container);
    }
  }, []);

  const renderToolIntoPreview = useCallback(
    (toolData) => {
      const mountPoint = previewRef.current;
      if (!mountPoint) return;
      mountPoint.innerHTML = '';
      try {
        renderTool(toolData, { mountPoint });
      } catch (renderError) {
        console.error(renderError);
        setError(renderError);
        appendLog(`Preview render failed: ${renderError.message || renderError}`);
      }
    },
    [appendLog]
  );

  const handleGenerate = useCallback(
    async (event) => {
      event?.preventDefault();
      if (!prompt.trim() || isGenerating) return;
      setIsPublishing(false);
      setPublishResult(null);
      setIsGenerating(true);
      setError(null);
      setActiveTab('preview');
      appendLog('Submitting prompt to Questit...');
      try {
        const container = await questit.process(prompt.trim(), {}, 'render');
        const generatedTool = questit.currentTool;
        if (!generatedTool) {
          throw new Error('Questit did not return a tool payload.');
        }
        setTool(generatedTool);
        setEditedHtml(generatedTool.html || '');
        setEditedCss(generatedTool.css || '');
        setEditedJs(generatedTool.js || '');
        appendLog('Tool generated successfully.');
        if (generatedTool.metadata?.repo) {
          appendLog(`Using reference repo: ${generatedTool.metadata.repo.url}`);
        } else {
          appendLog('No reference repo available – building from scratch.');
        }
        if (generatedTool.metadata?.repoFetchErrors?.length) {
          generatedTool.metadata.repoFetchErrors.forEach((failure) => {
            appendLog(`Repo skipped: ${failure.url} (${failure.message})`);
          });
        }
        mountToolContainer(container);
      } catch (generationError) {
        console.error(generationError);
        setError(generationError);
        appendLog(`Generation failed: ${generationError.message || generationError}`);
      } finally {
        setIsGenerating(false);
      }
    },
    [appendLog, mountToolContainer, prompt, questit, isGenerating]
  );

  const handleApplyEdits = useCallback(() => {
    if (!tool) return;
    const updatedTool = {
      ...tool,
      html: editedHtml,
      css: editedCss,
      js: editedJs,
      executionBundle: ''
    };
    questit.currentTool = updatedTool;
    setTool(updatedTool);
    renderToolIntoPreview(updatedTool);
    appendLog('Applied edits to preview.');
  }, [appendLog, editedCss, editedHtml, editedJs, questit, renderToolIntoPreview, tool]);

  const handlePublish = useCallback(async () => {
    if (!tool || isPublishing) return;
    setIsPublishing(true);
    setPublishResult(null);
    setError(null);
    appendLog('Publishing tool to Workers for Platforms...');
    try {
      const result = await publishTool(tool, apiBase);
      setPublishResult(result);
      appendLog(`Publish complete: tool available at https://${result.name}.questit.cc/`);
    } catch (publishError) {
      console.error(publishError);
      setError(publishError);
      appendLog(`Publish failed: ${publishError.message || publishError}`);
    } finally {
      setIsPublishing(false);
    }
  }, [appendLog, apiBase, isPublishing, tool]);

  const handleReset = useCallback(() => {
    setPrompt(DEFAULT_PROMPT);
    setTool(null);
    setEditedHtml('');
    setEditedCss('');
    setEditedJs('');
    setLogEntries([]);
    setError(null);
    setPublishResult(null);
    const mountPoint = previewRef.current;
    if (mountPoint) {
      mountPoint.innerHTML = '';
    }
    appendLog('Workbench reset.');
  }, [appendLog]);

  const publishDisabled = !tool || isPublishing;

  return (
    <Box className="app-shell">
      <Flex justify="between" align="center" mb="4">
        <Flex align="center" gap="3">
          <Heading size="5">Questit Workbench</Heading>
          <Badge color="gray" variant="soft">
            {isLocalhost ? 'Local Sandbox' : 'Production'}
          </Badge>
        </Flex>
        <Flex align="center" gap="2">
          <Text size="2" color="gray">
            AI endpoint
          </Text>
          <Badge variant="surface" color="indigo">
            {endpoint.replace(/^https?:\/\//, '')}
          </Badge>
        </Flex>
      </Flex>

      <Flex gap="5" align="start" direction={{ initial: 'column', md: 'row' }}>
        <Box flexShrink="0" style={{ minWidth: '320px', maxWidth: '420px' }}>
          <form onSubmit={handleGenerate}>
            <Flex direction="column" gap="3">
              <Heading size="3">Prompt</Heading>
              <TextArea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                size="3"
                maxRows={12}
                minRows={6}
                placeholder="Describe the micro-tool you want to build..."
              />
              <Flex gap="2">
                <Button type="submit" disabled={isGenerating} highContrast>
                  {isGenerating ? 'Generating…' : 'Generate'}
                </Button>
                <Button type="button" variant="surface" color="gray" onClick={handleReset}>
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="surface"
                  color="teal"
                  disabled={publishDisabled}
                  onClick={handlePublish}
                >
                  {isPublishing ? 'Publishing…' : 'Publish'}
                </Button>
              </Flex>
            </Flex>
          </form>

          <Separator my="4" />

          <Heading size="3" mb="2">
            Activity
          </Heading>
          <LogPanel entries={logEntries} />
        </Box>

        <Box flexGrow="1" className="preview-panel">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Flex justify="between" align="center" mb="3">
              <Tabs.List>
                <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
                <Tabs.Trigger value="html">HTML</Tabs.Trigger>
                <Tabs.Trigger value="css">CSS</Tabs.Trigger>
                <Tabs.Trigger value="js">JavaScript</Tabs.Trigger>
              </Tabs.List>
              <Flex gap="2">
                <Button
                  variant="soft"
                  color="indigo"
                  disabled={!tool}
                  onClick={() => tool && renderToolIntoPreview(tool)}
                >
                  Refresh Preview
                </Button>
                <Button variant="solid" disabled={!tool} onClick={handleApplyEdits}>
                  Apply Edits
                </Button>
              </Flex>
            </Flex>

            <Tabs.Content value="preview">
              <Box className="preview-surface" ref={previewRef}>
                {!tool && (
                  <Flex
                    className="preview-placeholder"
                    align="center"
                    justify="center"
                    direction="column"
                    gap="2"
                  >
                    <Heading size="4" color="gray">
                      Generate a tool to preview it here
                    </Heading>
                    <Text color="gray">
                      Once generated, you can adjust HTML/CSS/JS in the adjacent tabs.
                    </Text>
                  </Flex>
                )}
              </Box>
            </Tabs.Content>

            <Tabs.Content value="html">
              <TextArea
                value={editedHtml}
                onChange={(event) => setEditedHtml(event.target.value)}
                size="3"
                minRows={20}
                spellCheck={false}
              />
            </Tabs.Content>

            <Tabs.Content value="css">
              <TextArea
                value={editedCss}
                onChange={(event) => setEditedCss(event.target.value)}
                size="3"
                minRows={20}
                spellCheck={false}
              />
            </Tabs.Content>

            <Tabs.Content value="js">
              <TextArea
                value={editedJs}
                onChange={(event) => setEditedJs(event.target.value)}
                size="3"
                minRows={20}
                spellCheck={false}
              />
            </Tabs.Content>
          </Tabs.Root>

          {publishResult && (
            <Callout.Root color="green" mt="4">
              <Callout.Text>
                Published! View it at{' '}
                <a href={`https://${publishResult.name}.questit.cc/`} target="_blank" rel="noreferrer">
                  https://{publishResult.name}.questit.cc/
                </a>
              </Callout.Text>
            </Callout.Root>
          )}

          {error && (
            <Callout.Root color="red" mt="4">
              <Callout.Text>
                {error.message || 'An unexpected error occurred.'}
              </Callout.Text>
              {error.details && (
                <Callout.Text color="gray" size="2">
                  {typeof error.details === 'string' ? error.details : JSON.stringify(error.details)}
                </Callout.Text>
              )}
            </Callout.Root>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

export default App;
