import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Share2, ExternalLink, Check, Copy } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import ToolViewer from '@/components/tool-viewer/ToolViewer.jsx';
import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient';
import { publishTool as publishSavedTool } from '@questit/core/publish.js';
import { generateTool } from './generateTool.js';
import WorkbenchHeader from '@/components/workbench/WorkbenchHeader.jsx';
import SaveToolDialog from '@/components/workbench/SaveToolDialog.jsx';
import PublishToolDialog from '@/components/workbench/PublishToolDialog.jsx';
import CreatorPortal from '@/components/account/CreatorPortal.jsx';
import {
  buildIframeHTML,
  COLOR_MODE_OPTIONS,
  DEFAULT_THEME_KEY,
  THEME_OPTIONS,
  useThemeManager
} from '@/lib/themeManager.js';
import { useModelManager } from '@/lib/modelManager.js';
import { Shell } from '@/components/layout';
import WorkbenchComposerPanel from '@/components/workbench/WorkbenchComposerPanel.jsx';
import WorkbenchInspector from '@/components/workbench/WorkbenchInspector.jsx';
import { scopeGateRequest } from '@/lib/scopeGatePreview.js';
import TemplatesView from '@/components/templates/TemplatesView.jsx';
import { TEMPLATE_COLLECTIONS, getTemplateById } from '@/data/templates.js';
import SyncBanner from '@/components/workbench/SyncBanner.jsx';
import Landing from '@/components/landing/Landing.jsx';
// LeftRail removed from workbench two-column layout
import { trackEvent } from '@/lib/utils.js';
import PrePromptPreview from '@/components/workbench/PrePromptPreview.jsx';
import GeneratingAnimation from '@/components/workbench/GeneratingAnimation.jsx';
import { resolveApiBase } from '@/lib/api.js';

const DEFAULT_PROMPT = 'Create a simple calculator';

function buildShareUrl(workerName, apiBase) {
  if (!workerName) return '';
  try {
    const url = new URL(apiBase);
    const host = url.hostname;
    if (host.includes('localhost') || host.startsWith('127.') || host.startsWith('0.')) {
      return '';
    }
    return `${url.origin}/tools/${encodeURIComponent(workerName)}/`;
  } catch {
    return '';
  }
}

function summarizeCodeBundle({ html = '', css = '', js = '' }) {
  const parts = [];
  if (html) parts.push(`HTML ${html.length.toLocaleString()} chars`);
  if (css) parts.push(`CSS ${css.length.toLocaleString()} chars`);
  if (js) parts.push(`JS ${js.length.toLocaleString()} chars`);
  if (!parts.length) {
    return '';
  }
  return `Updated ${parts.join(' · ')}`;
}

const MEMORY_MODE_LABELS = {
  none: 'Off',
  device: 'This device',
  account: 'Signed-in users'
};

function formatMemoryModeLabel(value) {
  if (!value) return 'Off';
  return MEMORY_MODE_LABELS[value] || value.charAt(0).toUpperCase() + value.slice(1);
}

function detectViewerSlug() {
  if (typeof window === 'undefined') return null;
  try {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments[0] === 'tools' && segments[1]) {
      return decodeURIComponent(segments[1]);
    }
    return null;
  } catch {
    return null;
  }
}

function App() {
  const viewerSlug = detectViewerSlug();

  if (viewerSlug) {
    const endpointOverride =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('endpoint')
        : null;
    const viewerApiBase = resolveApiBase(
      endpointOverride || 'https://questit.cc/api/ai/proxy'
    );
    return <ToolViewer slug={viewerSlug} apiBase={viewerApiBase} />;
  }

  return <WorkbenchApp />;
}

function WorkbenchApp() {
  const [composerValue, setComposerValue] = useState(DEFAULT_PROMPT);
  const [sessionEntries, setSessionEntries] = useState([]);
  const [sessionStatus, setSessionStatus] = useState({
    state: 'idle',
    message: ''
  });
  const [templatesPreview, setTemplatesPreview] = useState(null);
  const [toolCode, setToolCode] = useState({ html: '', css: '', js: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authStatus, setAuthStatus] = useState({ state: 'idle', message: '' });
  const [saveStatus, setSaveStatus] = useState({ state: 'idle', message: '' });
  const [saveDraft, setSaveDraft] = useState({ title: '', summary: '' });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState('workbench');
  const [myTools, setMyTools] = useState([]);
  const [isLoadingMyTools, setIsLoadingMyTools] = useState(false);
  const [myToolsError, setMyToolsError] = useState('');
  const [toolActionStatus, setToolActionStatus] = useState({});
  const [myToolsRefreshKey, setMyToolsRefreshKey] = useState(0);
  const [publishDialogState, setPublishDialogState] = useState({
    open: false,
    toolId: null,
    visibility: 'public'
  });
  const [publishDialogStatus, setPublishDialogStatus] = useState({
    state: 'idle',
    message: ''
  });
  const [publishVisibilityByTool, setPublishVisibilityByTool] = useState({});
  const [memorySettings, setMemorySettings] = useState({
    mode: 'none',
    retention: 'indefinite'
  });
  const composerRef = useRef(null);
  const { selectedTheme, setSelectedTheme, colorMode, setColorMode, resolvedMode } =
    useThemeManager(DEFAULT_THEME_KEY);
  const { modelId, setModelId, selectedModelOption, options: modelOptions } = useModelManager();

  const endpoint = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('endpoint') || 'https://questit.cc/api/ai/proxy';
  }, []);
  const apiBase = useMemo(() => resolveApiBase(endpoint), [endpoint]);
  const publishDialogTool = useMemo(() => {
    if (!publishDialogState.toolId) return null;
    return myTools.find((tool) => tool.id === publishDialogState.toolId) || null;
  }, [publishDialogState.toolId, myTools]);
  const handleOpenDocs = useCallback(() => {
    window.open('https://github.com/aaquib90/questit#readme', '_blank', 'noopener,noreferrer');
  }, []);
  const { html: currentHtml, css: currentCss, js: currentJs } = toolCode;
  const hasGenerated = Boolean(currentHtml || currentCss || currentJs);
  const iframeDoc = useMemo(
    () =>
      hasGenerated
        ? buildIframeHTML(
            { html: currentHtml, css: currentCss, js: currentJs },
            selectedTheme,
            resolvedMode
          )
        : '',
    [currentCss, currentHtml, currentJs, hasGenerated, resolvedMode, selectedTheme]
  );
  const userLabel = user?.email || user?.user_metadata?.full_name || 'Signed in';
  const sessionStepCount = sessionEntries.length;
  const hasHistory = sessionStepCount > 0;
  const sessionState = sessionStatus?.state || 'idle';
  const sessionStateLabel =
    sessionState === 'loading'
      ? 'Working on it…'
      : sessionState === 'success'
        ? 'All set'
        : sessionState === 'error'
          ? 'Needs a quick fix'
          : 'Waiting';
  const sessionStateClass =
    sessionState === 'error'
      ? 'text-destructive'
      : sessionState === 'success'
        ? 'text-emerald-500'
        : sessionState === 'loading'
          ? 'text-primary'
          : 'text-muted-foreground';

  const scopeGate = useMemo(() => scopeGateRequest(composerValue || ''), [composerValue]);
  const scopeDecision = scopeGate.decision;
  const scopeReasons = scopeGate.reasons;
  const scopeMetrics = scopeGate.metrics;
  const scopeDecisionLabel =
    scopeDecision === 'allow'
      ? 'Looks good'
      : scopeDecision === 'refine'
        ? 'May need a tweak'
        : 'Too big for now';
  const scopeDecisionClasses =
    scopeDecision === 'allow'
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : scopeDecision === 'refine'
        ? 'bg-amber-100 text-amber-700 border border-amber-200'
        : 'bg-rose-100 text-rose-700 border border-rose-200';
  const handleRequestLogin = useCallback(() => {
    setAuthDialogOpen(true);
    setAuthStatus({ state: 'idle', message: '' });
  }, []);

  const createEntryId = useCallback(
    () =>
      crypto.randomUUID?.() ??
      `entry-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    []
  );

  const executePrompt = async ({ promptText, reuseEntryId = null } = {}) => {
    const trimmed = (promptText || '').trim();
    if (!trimmed || isGenerating) return;

    const entryId = reuseEntryId || createEntryId();
    const timestamp = new Date().toISOString();
    const modelLabel = selectedModelOption.label;

    setSessionEntries((previous) => {
      if (reuseEntryId) {
        return previous.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                prompt: trimmed,
                status: 'pending',
                error: null,
                responseSummary: '',
                createdAt: timestamp,
                modelLabel
              }
            : entry
        );
      }
      return [
        ...previous,
        {
          id: entryId,
          prompt: trimmed,
          status: 'pending',
          createdAt: timestamp,
          modelId: selectedModelOption.id,
          modelLabel,
          error: null,
          responseSummary: ''
        }
      ];
    });

    if (!reuseEntryId) {
      setComposerValue('');
    }

    setIsGenerating(true);
    setSessionStatus({ state: 'loading', message: '' });

    try {
      const modelConfig = {
        provider: selectedModelOption.provider,
        model: selectedModelOption.model
      };
      const previousCode = hasGenerated ? toolCode : undefined;
      const result = await generateTool(trimmed, endpoint, previousCode, {
        modelConfig,
        memoryConfig: memorySettings
      });

      setToolCode(result);
      setSessionEntries((previous) =>
        previous.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                status: 'success',
                responseSummary: summarizeCodeBundle(result),
                error: null
              }
            : entry
        )
      );
      setSessionStatus({ state: 'success', message: '' });
      setSaveDraft((draft) => ({
        title: draft.title || trimmed.slice(0, 80),
        summary: draft.summary
      }));
    } catch (error) {
      console.error('Generation error:', error);
      const message = error?.message || 'Failed to generate tool.';
      setSessionEntries((previous) =>
        previous.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                status: 'error',
                error: message
              }
            : entry
        )
      );
      setSessionStatus({ state: 'error', message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptSubmit = () => {
    trackEvent('generate_clicked', { hasHistory, model: selectedModelOption.id });
    executePrompt({ promptText: composerValue });
  };

  const handleRetryEntry = (entry) => {
    executePrompt({ promptText: entry?.prompt || '', reuseEntryId: entry?.id });
  };

  const handleUsePrompt = (promptText) => {
    setComposerValue(promptText);
    setActiveView('workbench');
    composerRef.current?.focus();
  };

  const handleApplyTemplate = (template) => {
    if (!template) return;
    trackEvent('template_applied', { id: template.id, title: template.title });
    const promptText = template.prompt || '';
    const createdAt = new Date().toISOString();
    const templateEntry = {
      id: createEntryId(),
      prompt: promptText,
      status: 'draft',
      createdAt,
      responseSummary: `Template “${template.title}” loaded. Adjust the prompt or generate when you're ready.`,
      modelLabel: selectedModelOption.label,
      templateId: template.id
    };

    setComposerValue(promptText);
    setSessionEntries([templateEntry]);
    setToolCode({
      html: template.preview?.html || '',
      css: template.preview?.css || '',
      js: template.preview?.js || ''
    });
    setSessionStatus({
      state: 'success',
      message: `Template “${template.title}” is ready in the workbench. Ask Questit for any tweaks.`
    });
    setSaveStatus({ state: 'idle', message: '' });
    setSaveDraft({ title: template.title || '', summary: template.summary || '' });
    setMemorySettings({ mode: 'none', retention: 'indefinite' });
    setActiveView('workbench');
    setTimeout(() => {
      composerRef.current?.focus();
    }, 80);
  };

  const handleResetSession = () => {
    setSessionEntries([]);
    setToolCode({ html: '', css: '', js: '' });
    setComposerValue(DEFAULT_PROMPT);
    setSessionStatus({
      state: 'idle',
      message: ''
    });
    setSaveStatus({ state: 'idle', message: '' });
    setSaveDraft({ title: '', summary: '' });
    setMemorySettings({ mode: 'none', retention: 'indefinite' });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    // Deep-link: /templates/:slug opens the template detail modal
    const { pathname } = window.location;
    const templateMatch = pathname.match(/^\/templates\/([^/]+)\/?$/i);
    if (templateMatch && templateMatch[1]) {
      const slug = decodeURIComponent(templateMatch[1]);
      const template = getTemplateById(slug, TEMPLATE_COLLECTIONS);
      if (template) {
        setActiveView('templates');
        setTemplatesPreview(template);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const remixSlug = params.get('remix');
    if (!remixSlug) return undefined;

    const sanitizedSlug = remixSlug.trim().toLowerCase();
    if (!sanitizedSlug) return undefined;

    const loadRemix = async () => {
      try {
        setSessionStatus({ state: 'loading', message: 'Loading shared tool for remix…' });
        const origin = window.location.origin || '';
        const isLocalOrigin =
          origin.includes('localhost') || origin.includes('127.') || origin.includes('0.0.0.0');
        const canonicalOrigin = isLocalOrigin ? 'https://questit.cc' : origin;
        const metadataCandidates = [
          `${canonicalOrigin.replace(/\/$/, '')}/tools/${encodeURIComponent(sanitizedSlug)}/metadata`,
          `https://${sanitizedSlug}.questit.cc/metadata`
        ];

        let response;
        let lastError = null;

        for (const candidate of metadataCandidates) {
          try {
            response = await fetch(candidate, {
              headers: { Accept: 'application/json' }
            });
            if (response.ok) {
              lastError = null;
              break;
            }
            lastError = new Error(`Unable to fetch shared tool (status ${response.status})`);
          } catch (error) {
            lastError = error;
          }
        }

        if (!response || !response.ok) {
          throw lastError || new Error('Unable to fetch shared tool metadata.');
        }

        const data = await response.json();
        const html = data.html || '';
        const css = data.css || '';
        const js = data.js || '';
        setToolCode({ html, css, js });
        setSessionEntries([
          {
            id: createEntryId(),
            prompt: data.prompt || 'Remixed from shared tool',
            status: 'success',
            createdAt: new Date().toISOString(),
            responseSummary: 'Loaded shared bundle.',
            modelLabel:
              data.model_provider && data.model_name
                ? `${data.model_provider} · ${data.model_name}`
                : selectedModelOption.label,
            error: null
          }
        ]);
        if (data.theme) {
          setSelectedTheme(data.theme);
        }
        if (data.color_mode) {
          setColorMode(data.color_mode);
        }
        if (data.model_provider && data.model_name) {
          const match = modelOptions.find(
            (option) =>
              option.provider === data.model_provider && option.model === data.model_name
          );
          if (match) {
            setModelId(match.id);
          }
        }
        setSaveDraft({
          title: data.title || data.prompt?.slice(0, 80) || '',
          summary: data.public_summary || ''
        });
        setSessionStatus({
          state: 'success',
          message: 'Shared tool loaded. Iterate or publish as needed.'
        });
        setComposerValue('');
        setActiveView('workbench');
      } catch (error) {
        console.error('Failed to load remix tool:', error);
        setSessionStatus({
          state: 'error',
          message: error?.message || 'Unable to load shared tool for remix.'
        });
      } finally {
        params.delete('remix');
        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
        window.history.replaceState(null, '', nextUrl);
      }
    };

    loadRemix();
    return undefined;
  }, [
    createEntryId,
    modelOptions,
    selectedModelOption.label,
    setActiveView,
    setColorMode,
    setComposerValue,
    setModelId,
    setSaveDraft,
    setSelectedTheme,
    setSessionEntries,
    setSessionStatus,
    setToolCode
  ]);

  const updateToolActionStatus = useCallback((toolId, updates) => {
    setToolActionStatus((previous) => {
      const existing = previous[toolId] || {};
      return {
        ...previous,
        [toolId]: { ...existing, ...updates }
      };
    });
  }, []);

  const fetchToolDetails = async (toolId) => {
    const { data, error } = await supabase
      .from('user_tools')
      .select(
        'id, title, prompt, public_summary, model_provider, model_name, theme, color_mode, memory_mode, memory_retention, html, css, js, created_at, updated_at'
      )
      .eq('id', toolId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error('Saved tool not found.');
    }

    setMyTools((previous) =>
      previous.map((tool) => (tool.id === toolId ? { ...tool, ...data } : tool))
    );
    setMemorySettings({
      mode: data.memory_mode || 'none',
      retention: data.memory_retention || 'indefinite'
    });
    return data;
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    if (!hasSupabaseConfig) {
      setAuthStatus({
        state: 'error',
        message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      });
      return;
    }
    if (!authEmail.trim()) {
      setAuthStatus({ state: 'error', message: 'Enter an email address to continue.' });
      return;
    }

    setAuthStatus({ state: 'loading', message: 'Sending magic link…' });
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      setAuthStatus({ state: 'error', message: error.message });
      return;
    }

    setAuthStatus({
      state: 'success',
      message: 'Magic link sent. Check your inbox to finish signing in.'
    });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setAuthStatus({ state: 'idle', message: '' });
      setSaveStatus({ state: 'idle', message: '' });
      setAuthEmail('');
      handleResetSession();
      setMyTools([]);
      setMyToolsError('');
      setIsLoadingMyTools(false);
      setToolActionStatus({});
    } catch (error) {
      console.warn('Sign out failed:', error);
    }
  };

  const handleLoadSavedTool = async (toolId) => {
    if (!user) {
      handleRequestLogin();
      return;
    }
    if (!hasSupabaseConfig) {
      setMyToolsError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    updateToolActionStatus(toolId, { loading: true, error: '' });
    try {
      let toolRecord = myTools.find((tool) => tool.id === toolId);
      const hasCode =
        toolRecord &&
        (typeof toolRecord.html === 'string' ||
          typeof toolRecord.css === 'string' ||
          typeof toolRecord.js === 'string');
      if (!hasCode) {
        toolRecord = await fetchToolDetails(toolId);
      }
      if (!toolRecord) {
        throw new Error('Saved tool not found.');
      }

      const html = toolRecord.html || '';
      const css = toolRecord.css || '';
      const js = toolRecord.js || '';
      setToolCode({ html, css, js });
      const modelLabelFromRecord =
        toolRecord.model_provider && toolRecord.model_name
          ? `${toolRecord.model_provider} · ${toolRecord.model_name}`
          : selectedModelOption.label;

      setSessionEntries([
        {
          id: createEntryId(),
          prompt: toolRecord.prompt || 'Loaded from Supabase',
          status: 'success',
          createdAt: toolRecord.updated_at || new Date().toISOString(),
          responseSummary: 'Loaded saved bundle.',
          modelLabel: modelLabelFromRecord,
          error: null
        }
      ]);
      setSessionStatus({
        state: 'success',
        message: 'Loaded saved tool into the workbench.'
      });
      setComposerValue('');
      setSaveDraft({
        title: toolRecord.title || '',
        summary: toolRecord.public_summary || ''
      });
      if (toolRecord.theme) {
        setSelectedTheme(toolRecord.theme);
      }
      if (toolRecord.color_mode) {
        setColorMode(toolRecord.color_mode);
      }
      setMemorySettings({
        mode: toolRecord.memory_mode || 'none',
        retention: toolRecord.memory_retention || 'indefinite'
      });
      if (toolRecord.model_provider && toolRecord.model_name) {
        const match = modelOptions.find(
          (option) =>
            option.provider === toolRecord.model_provider && option.model === toolRecord.model_name
        );
        if (match) {
          setModelId(match.id);
        }
      }
      setActiveView('workbench');
      setSaveStatus({ state: 'idle', message: '' });
      updateToolActionStatus(toolId, { loading: false, error: '' });
    } catch (error) {
      console.error('Failed to load saved tool:', error);
      updateToolActionStatus(toolId, {
        loading: false,
        error: error?.message || 'Failed to load saved tool.'
      });
    }
  };

  const handleCopyShareLink = useCallback(async (shareUrl, toolId) => {
    if (!shareUrl || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      updateToolActionStatus(toolId, { linkCopied: true });
      setTimeout(() => {
        updateToolActionStatus(toolId, { linkCopied: false });
      }, 3000);
    } catch (error) {
      console.warn('Failed to copy link to clipboard:', error);
    }
  }, [updateToolActionStatus]);

  const handleOpenPublishDialog = (toolId) => {
    if (!user) {
      handleRequestLogin();
      return;
    }
    if (!hasSupabaseConfig) {
      setMyToolsError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }
    const status = toolActionStatus[toolId];
    if (status?.publishing) {
      return;
    }
    const savedVisibility = status?.visibility || publishVisibilityByTool[toolId] || 'public';
    setPublishDialogState({
      open: true,
      toolId,
      visibility: savedVisibility
    });
    setPublishDialogStatus({ state: 'idle', message: '' });
  };

  const handlePublishDialogOpenChange = (isOpen) => {
    if (!isOpen) {
      setPublishDialogState({ open: false, toolId: null, visibility: 'public' });
      setPublishDialogStatus({ state: 'idle', message: '' });
    }
  };

  const handleSubmitPublishDialog = async ({ visibility, passphrase }) => {
    const toolId = publishDialogState.toolId;
    if (!toolId) return;
    setPublishDialogStatus({ state: 'loading', message: 'Publishing your tool…' });
    const response = await handlePublishSavedTool(toolId, { visibility, passphrase });
    if (response.ok) {
      setPublishVisibilityByTool((previous) => ({
        ...previous,
        [toolId]: visibility
      }));
      setPublishDialogState({ open: false, toolId: null, visibility: 'public' });
      setPublishDialogStatus({ state: 'idle', message: '' });
    } else {
      setPublishDialogStatus({
        state: 'error',
        message: response.error || 'Failed to publish tool.'
      });
    }
  };

  const handlePublishSavedTool = async (toolId, options = {}) => {
    if (!user) {
      handleRequestLogin();
      return { ok: false, error: 'Sign in to publish tools.' };
    }
    if (!hasSupabaseConfig) {
      setMyToolsError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      updateToolActionStatus(toolId, { publishing: false, error: '' });
      return { ok: false, error: 'Supabase is not configured.' };
    }
    updateToolActionStatus(toolId, { publishing: true, error: '' });

    try {
      let toolRecord = myTools.find((tool) => tool.id === toolId);
      const hasCode =
        toolRecord &&
        (typeof toolRecord.html === 'string' ||
          typeof toolRecord.css === 'string' ||
          typeof toolRecord.js === 'string');
      if (!hasCode) {
        toolRecord = await fetchToolDetails(toolId);
      }
      if (!toolRecord) {
        throw new Error('Saved tool not found.');
      }

      if (!toolRecord.html && !toolRecord.css && !toolRecord.js) {
        throw new Error('Saved tool is missing code content.');
      }

      const visibility = options.visibility || 'public';
      const trimmedPassphrase =
        typeof options.passphrase === 'string' ? options.passphrase.trim() : '';

      const memoryMode = toolRecord.memory_mode || memorySettings.mode;
      const memoryRetention = toolRecord.memory_retention || memorySettings.retention;

      const publishPayload = {
        id: toolRecord.id,
        tool_id: toolRecord.id,
        owner_id: user.id,
        visibility,
        memory_mode: memoryMode,
        memory_retention: memoryRetention,
        title: toolRecord.title,
        public_summary: toolRecord.public_summary || saveDraft.summary || '',
        theme: toolRecord.theme || selectedTheme || DEFAULT_THEME_KEY,
        color_mode: toolRecord.color_mode || colorMode || resolvedMode,
        model_provider: toolRecord.model_provider || selectedModelOption.provider,
        model_name: toolRecord.model_name || selectedModelOption.model,
        html: toolRecord.html || '',
        css: toolRecord.css || '',
        js: toolRecord.js || ''
      };

      if (visibility === 'passphrase' && trimmedPassphrase) {
        publishPayload.passphrase = trimmedPassphrase;
      }

      const result = await publishSavedTool(publishPayload, apiBase);
      const shareUrl = buildShareUrl(result?.name, apiBase);

      updateToolActionStatus(toolId, {
        publishing: false,
        error: '',
        shareUrl,
        publishedName: result?.name || '',
        publishedNamespace: result?.namespace || '',
        visibility,
        memoryMode,
        memoryRetention
      });

      // Copy link to clipboard automatically
      if (shareUrl) {
        await handleCopyShareLink(shareUrl, toolId);
      }
      return { ok: true, result };
    } catch (error) {
      console.error('Failed to publish saved tool:', error);
      updateToolActionStatus(toolId, {
        publishing: false,
        error: error?.message || 'Failed to publish tool.'
      });
      return { ok: false, error: error?.message || 'Failed to publish tool.' };
    }
  };

  const handleOpenSaveDialog = () => {
    if (!user) {
      handleRequestLogin();
      return;
    }
    if (!hasSupabaseConfig) {
      setSaveStatus({
        state: 'error',
        message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      });
      return;
    }
    if (!hasGenerated) {
      setSaveStatus({
        state: 'error',
        message: 'Generate a tool before saving.'
      });
      return;
    }

    const latestPrompt = sessionEntries.at(-1)?.prompt || composerValue || DEFAULT_PROMPT;
    setSaveDraft((draft) => ({
      title: draft.title || latestPrompt.slice(0, 80),
      summary: draft.summary || ''
    }));
    setSaveStatus({ state: 'idle', message: '' });
    setSaveDialogOpen(true);
  };

  const handleSaveTool = async ({ title, summary }) => {
    if (!user || !hasSupabaseConfig) {
      setSaveStatus({
        state: 'error',
        message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      });
      return;
    }

    setSaveStatus({ state: 'loading', message: 'Saving to Supabase…' });
    const sourcePrompt = sessionEntries[0]?.prompt || composerValue || null;

    const { error } = await supabase.from('user_tools').insert({
      user_id: user.id,
      title,
      prompt: sourcePrompt,
      theme: selectedTheme,
      color_mode: colorMode,
      memory_mode: memorySettings.mode,
      memory_retention: memorySettings.retention,
      public_summary: summary || null,
      model_provider: selectedModelOption.provider,
      model_name: selectedModelOption.model,
      html: currentHtml,
      css: currentCss,
      js: currentJs
    });

    if (error) {
      setSaveStatus({ state: 'error', message: error.message });
      return;
    }

    setSaveDialogOpen(false);
    setSaveDraft({ title, summary });
    setMyToolsRefreshKey((value) => value + 1);
    setSaveStatus({ state: 'success', message: 'Tool saved to Supabase.' });
  };

  useEffect(() => {
    if (!hasSupabaseConfig) return undefined;
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setUser(data.session?.user ?? null);
        }
      })
      .catch((error) => {
        console.warn('Failed to load Supabase session:', error);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!['my-tools', 'creator-portal'].includes(activeView)) return undefined;
    if (!hasSupabaseConfig || !user) {
      setIsLoadingMyTools(false);
      return undefined;
    }

    let isActive = true;
    setIsLoadingMyTools(true);
    setMyToolsError('');

    supabase
      .from('user_tools')
      .select(
        'id, title, prompt, public_summary, model_provider, model_name, theme, color_mode, memory_mode, memory_retention, created_at, updated_at'
      )
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isActive) return;
        if (error) {
          setMyToolsError(error.message);
          setMyTools([]);
          return;
        }
        setMyTools(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (!isActive) return;
        setMyToolsError(error?.message || 'Failed to load saved tools.');
        setMyTools([]);
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoadingMyTools(false);
      });

    return () => {
      isActive = false;
    };
  }, [activeView, user, myToolsRefreshKey]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Shell as="main" className="py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col gap-6 lg:gap-8">
          <WorkbenchHeader
            activeView={activeView}
            onSelectView={setActiveView}
            user={user}
            userLabel={userLabel}
            onLogin={handleRequestLogin}
            onSignOut={handleSignOut}
            onNavigateHome={() => setActiveView('workbench')}
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
            themeOptions={THEME_OPTIONS}
            colorMode={colorMode}
            onColorModeChange={setColorMode}
            colorModeOptions={COLOR_MODE_OPTIONS}
          />
          <SyncBanner
            state={sessionState}
            message={sessionStatus.message}
            className="mx-auto w-full max-w-5xl"
          />

          {activeView === 'templates' ? (
            <TemplatesView
              collections={TEMPLATE_COLLECTIONS}
              onApplyTemplate={handleApplyTemplate}
              externalPreviewTemplate={templatesPreview}
              onPreviewChange={setTemplatesPreview}
            />
          ) : null}

          {activeView === 'workbench' ? (
            !hasHistory && !hasGenerated ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:items-start">
                <WorkbenchComposerPanel
                  ref={composerRef}
                  composerValue={composerValue}
                  setComposerValue={setComposerValue}
                  onSubmit={handlePromptSubmit}
                  isGenerating={isGenerating}
                  hasGenerated={hasGenerated}
                  onSaveTool={handleOpenSaveDialog}
                  modelId={modelId}
                  setModelId={setModelId}
                  modelOptions={modelOptions}
                  memorySettings={memorySettings}
                  onChangeMemorySettings={setMemorySettings}
                />
                {isGenerating ? (
                  <GeneratingAnimation />
                ) : (
                  <PrePromptPreview
                    onUsePrompt={(promptText) => {
                      setComposerValue(promptText);
                      setTimeout(() => composerRef.current?.focus(), 50);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:items-start">
                <WorkbenchComposerPanel
                  ref={composerRef}
                  composerValue={composerValue}
                  setComposerValue={setComposerValue}
                  onSubmit={handlePromptSubmit}
                  isGenerating={isGenerating}
                  hasGenerated={hasGenerated}
                  onSaveTool={handleOpenSaveDialog}
                  modelId={modelId}
                  setModelId={setModelId}
                  modelOptions={modelOptions}
                  memorySettings={memorySettings}
                  onChangeMemorySettings={setMemorySettings}
                />
                <WorkbenchInspector
                  hasGenerated={hasGenerated}
                  iframeDoc={iframeDoc}
                  saveStatus={saveStatus}
                  toolCode={toolCode}
                  isGenerating={isGenerating}
                  onReset={handleResetSession}
                  onSaveTool={handleOpenSaveDialog}
                  sidebarProps={{
                    modelId,
                    setModelId,
                    modelOptions,
                    onResetSession: handleResetSession,
                    canReset: hasHistory || hasGenerated,
                    sessionStateLabel,
                    sessionStateClass,
                    sessionStepCount,
                    selectedModelLabel: selectedModelOption.label,
                    scopeDecisionLabel,
                    scopeDecisionClasses,
                    scopeReasons,
                    scopeMetrics
                  }}
                  sessionEntries={sessionEntries}
                  onUsePrompt={handleUsePrompt}
                  onRetryEntry={handleRetryEntry}
                />
              </div>
            )
          ) : null}

          {activeView === 'my-tools' ? (
          <section className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">My Tools</h2>
                <p className="text-sm text-muted-foreground">
                  Review the tools you have saved to Supabase.
                </p>
              </div>
            </div>

            {!hasSupabaseConfig ? (
              <Card className="border border-primary/20 bg-muted/40">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Supabase environment variables are not configured. Set <code>VITE_SUPABASE_URL</code>{' '}
                  and <code>VITE_SUPABASE_ANON_KEY</code> to enable saving and viewing tools.
                </CardContent>
              </Card>
            ) : !user ? (
              <Card className="border border-primary/20 bg-muted/40">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sign in with a magic link to view your saved tools.
                  </p>
                  <Button className="mt-4" onClick={handleRequestLogin}>
                    Send magic link
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {myToolsError ? (
                  <Card className="border border-destructive/30 bg-destructive/10 text-destructive">
                    <CardContent className="py-6 text-sm">{myToolsError}</CardContent>
                  </Card>
                ) : null}

                {isLoadingMyTools && myTools.length === 0 ? (
                  <Card className="border border-primary/30 bg-muted/40">
                    <CardContent className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                      Loading your saved tools…
                    </CardContent>
                  </Card>
                ) : null}

                {myTools.length === 0 && !isLoadingMyTools ? (
                  <Card className="border border-primary/20 bg-muted/30">
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                      You have not saved any tools yet. Generate one in the workbench and save it to
                      see it here.
                    </CardContent>
                  </Card>
                ) : null}

                {myTools.map((tool) => {
                  const status = toolActionStatus[tool.id] || {};
                  const visibilityLabel = (status.visibility || 'public').replace(
                    /^\w/,
                    (char) => char.toUpperCase()
                  );
                  return (
                    <Card key={tool.id} className="border border-primary/20 bg-card shadow-sm">
                      <CardHeader className="space-y-2">
                        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
                          <div className="w-full">
                            <CardTitle className="text-lg">
                              {tool.title || 'Untitled Questit Tool'}
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                              Saved on{' '}
                              {new Date(tool.created_at || tool.updated_at).toLocaleString()}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide">
                            {tool.model_provider ? `${tool.model_provider}` : 'Model'}
                          </Badge>
                        </div>
                        {tool.public_summary ? (
                          <p className="text-sm text-muted-foreground">{tool.public_summary}</p>
                        ) : null}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{tool.theme ? `Theme: ${tool.theme}` : 'Default theme'}</span>
                          <span>•</span>
                          <span>{tool.color_mode ? `Mode: ${tool.color_mode}` : 'Mode: light'}</span>
                          <span>•</span>
                          <span>
                            Memory: {formatMemoryModeLabel(tool.memory_mode || 'none')}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleLoadSavedTool(tool.id)}
                            disabled={!!status.loading}
                            className="w-full sm:w-auto"
                          >
                            {status.loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                                Loading…
                              </>
                            ) : (
                              'Load in workbench'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenPublishDialog(tool.id)}
                            disabled={!!status.publishing}
                            className="w-full sm:w-auto"
                          >
                            {status.publishing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                                Publishing…
                              </>
                            ) : (
                              <>
                                <Share2 className="mr-2 h-4 w-4" aria-hidden />
                                Publish share link
                              </>
                            )}
                          </Button>
                        </div>
                        {status.shareUrl ? (
                          <div className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30 sm:flex-row sm:items-center sm:gap-2">
                            {status.linkCopied ? (
                              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <Check className="h-4 w-4" aria-hidden />
                                Link copied to clipboard
                              </div>
                            ) : (
                              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <a
                                  href={status.shareUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
                                >
                                  {status.shareUrl}
                                  <ExternalLink className="h-3 w-3" aria-hidden />
                                </a>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 gap-1.5 px-2 text-xs sm:h-7"
                                  onClick={() => handleCopyShareLink(status.shareUrl, tool.id)}
                                >
                                  <Copy className="h-3 w-3" aria-hidden />
                                  Copy
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : status.publishedName ? (
                          <p className="text-xs text-muted-foreground">
                            Published worker: {status.publishedName}
                          </p>
                        ) : null}
                        {status.shareUrl || status.publishedName ? (
                          <p className="text-[11px] text-muted-foreground">
                            Visibility: {visibilityLabel}
                          </p>
                        ) : null}
                        {status.error ? (
                          <p className="text-xs text-destructive">{status.error}</p>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

          {activeView === 'creator-portal' ? (
            <CreatorPortal
              user={user}
              userLabel={userLabel}
              onLogin={handleRequestLogin}
              toolsError={myToolsError}
              hasSupabaseConfig={hasSupabaseConfig}
              myTools={myTools}
              selectedTheme={selectedTheme}
              colorMode={colorMode}
              selectedModelLabel={selectedModelOption.label}
              sessionEntries={sessionEntries}
              onUsePrompt={handleUsePrompt}
              onOpenDocs={handleOpenDocs}
            />
          ) : null}
        <SaveToolDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          initialTitle={saveDraft.title || sessionEntries[0]?.prompt?.slice(0, 80) || ''}
          initialSummary={saveDraft.summary || ''}
          onSubmit={handleSaveTool}
          status={saveStatus}
        />

          <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
          <DialogContent className="w-full max-w-md gap-6 p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle>Sign in to Questit</DialogTitle>
              <DialogDescription>
                We’ll email you a magic link so you can save tools to Supabase.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email address</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {authStatus.message && (
                <p
                  className={`text-sm ${
                    authStatus.state === 'error'
                      ? 'text-destructive'
                      : authStatus.state === 'success'
                        ? 'text-emerald-500'
                        : 'text-muted-foreground'
                  }`}
                >
                  {authStatus.message}
                </p>
              )}
              <DialogFooter>
                <Button type="submit" disabled={authStatus.state === 'loading'}>
                  {authStatus.state === 'loading' ? 'Sending…' : 'Send magic link'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <PublishToolDialog
        open={publishDialogState.open}
        onOpenChange={handlePublishDialogOpenChange}
        initialVisibility={publishDialogState.visibility}
        onSubmit={handleSubmitPublishDialog}
        status={publishDialogStatus}
        toolTitle={publishDialogTool?.title}
      />
    </Shell>
  </div>
);
}

export default App;
