import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ToolViewer from '@/components/tool-viewer/ToolViewer.jsx';
import { resolveApiBase } from '@/lib/api.js';

export default function ToolViewerRoute() {
  const { slug = '' } = useParams();

  const apiBase = useMemo(() => {
    if (typeof window === 'undefined') {
      return resolveApiBase('https://questit.cc/api/ai/proxy');
    }
    const params = new URLSearchParams(window.location.search);
    const endpointOverride = params.get('endpoint');
    return resolveApiBase(endpointOverride || 'https://questit.cc/api/ai/proxy');
  }, []);

  return <ToolViewer slug={slug} apiBase={apiBase} />;
}
