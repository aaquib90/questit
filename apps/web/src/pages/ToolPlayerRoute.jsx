import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMemoryClient } from '@/lib/memoryClient.js';
import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient';
import SavedToolPlayer from '@/components/my-tools/SavedToolPlayer.jsx';
import { resolveApiBase } from '@/lib/api.js';
import { Surface } from '@/components/layout';
import { Button } from '@/components/ui/button';
import EmailPasswordForm from '@/components/auth/EmailPasswordForm.jsx';

export default function ToolPlayerRoute() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const apiBase = useMemo(() => resolveApiBase('https://questit.cc/api/ai/proxy'), []);
  const memoryClient = useMemo(
    () => createMemoryClient({ apiBase, supabase: hasSupabaseConfig ? supabase : null }),
    [apiBase]
  );

  const loadTool = useCallback(async () => {
    if (!hasSupabaseConfig || !id) {
      setStatus({
        state: 'error',
        message: 'Saved tools are unavailable. Configure Supabase and try again.'
      });
      return;
    }
    if (!user) {
      setStatus({
        state: 'idle',
        message: 'Sign in to open this tool.'
      });
      return;
    }
    setStatus({ state: 'loading', message: 'Loading tool…' });
    try {
      const { data, error } = await supabase
        .from('user_tools')
        .select(
          'id, title, public_summary, html, css, js, model_provider, model_name, theme, color_mode, memory_mode, memory_retention, updated_at'
        )
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        throw error;
      }
      if (!data) {
        setStatus({ state: 'error', message: 'Tool not found or no longer available.' });
        return;
      }
      setTool(data);
      setStatus({ state: 'success', message: '' });
    } catch (error) {
      setStatus({
        state: 'error',
        message: error?.message || 'Unable to load this tool.'
      });
    }
  }, [id, user]);

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.session?.user ?? null);
        setAuthReady(true);
      })
      .catch(() => {
        if (!active) return;
        setAuthReady(true);
      });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadTool();
  }, [loadTool]);

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Surface className="mx-auto mt-24 w-full max-w-md space-y-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to run saved tools.
          </p>
          <Button onClick={() => navigate('/my-tools')}>Back to My Tools</Button>
        </Surface>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Surface className="mx-auto mt-24 w-full max-w-md space-y-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">Tool ID is missing.</p>
          <Button onClick={() => navigate('/my-tools')}>Back to My Tools</Button>
        </Surface>
      </div>
    );
  }

  if (authReady && !user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Surface className="mx-auto mt-24 w-full max-w-md space-y-4 p-6">
          <EmailPasswordForm
            heading="Sign in to run your tool"
            description="Use your Questit account to run this saved tool."
            idPrefix="tool-player-auth"
          />
          <Button variant="outline" onClick={() => navigate('/my-tools')}>
            Back to My Tools
          </Button>
        </Surface>
      </div>
    );
  }

  if (status.state === 'error') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Surface className="mx-auto mt-24 w-full max-w-md space-y-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">{status.message}</p>
          <Button onClick={() => navigate('/my-tools')}>Back to My Tools</Button>
        </Surface>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Surface className="mx-auto mt-24 w-full max-w-md space-y-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {status.state === 'loading' ? 'Loading tool…' : 'Preparing player…'}
          </p>
        </Surface>
      </div>
    );
  }

  return (
    <SavedToolPlayer
      tool={tool}
      apiBase={apiBase}
      status={{ publishing: false, clearingMemory: false }}
      memoryClient={memoryClient}
      onBack={() => navigate('/my-tools')}
      onOpenInWorkbench={() => navigate(`/build?tool=${encodeURIComponent(tool.id)}`)}
      onPublish={() => navigate(`/build?tool=${encodeURIComponent(tool.id)}&publish=1`)}
      onClearMemory={() => memoryClient?.clearAll?.(tool.id)}
    />
  );
}

