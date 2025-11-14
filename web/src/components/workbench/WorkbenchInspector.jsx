import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PrePromptPreview from '@/components/workbench/PrePromptPreview.jsx';
import GeneratingAnimation from '@/components/workbench/GeneratingAnimation.jsx';
import { Button } from '@/components/ui/button';
import { Maximize2, RefreshCw, RotateCcw } from 'lucide-react';

export default function WorkbenchInspector({
  hasGenerated,
  iframeDoc,
  saveStatus,
  toolCode,
  sessionEntries,
  onUsePrompt,
  isGenerating,
  onReset
}) {
  const reloadIframe = () => {
    // force reload by replacing the iframe content via srcdoc toggle
    const iframe = document.getElementById('questit-preview-iframe');
    if (!iframe) return;
    const doc = iframe.getAttribute('srcdoc') || '';
    iframe.setAttribute('srcdoc', '');
    // slight delay to ensure reload
    setTimeout(() => iframe.setAttribute('srcdoc', doc), 0);
  };

  const openFullscreen = () => {
    try {
      const w = window.open('', '_blank', 'noopener,noreferrer');
      if (w && typeof w.document !== 'undefined') {
        w.document.open();
        w.document.write(iframeDoc || '<p>No content.</p>');
        w.document.close();
      }
    } catch {
      // ignore
    }
  };
  return (
    <Surface muted className="flex h-full flex-col p-0">
      <Tabs defaultValue="preview" className="flex flex-1 flex-col w-full">
        <TabsList className="grid w-full grid-cols-1 bg-muted/70">
          <TabsTrigger value="preview">Tool Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="flex flex-1 flex-col p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Preview</h3>
              <p className="text-xs text-muted-foreground">Live preview of your generated tool</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={reloadIframe} className="gap-1 text-xs">
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                Reload
              </Button>
              <Button size="sm" variant="outline" onClick={openFullscreen} className="gap-1 text-xs">
                <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                Fullscreen
              </Button>
              <Button size="sm" variant="outline" onClick={onReset} className="gap-1 text-xs">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Reset
              </Button>
            </div>
          </div>
          {isGenerating ? (
            <GeneratingAnimation />
          ) : !hasGenerated && !sessionEntries.length ? (
            <PrePromptPreview onUsePrompt={onUsePrompt} />
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-dashed border-primary/30 bg-muted/40">
              {iframeDoc ? (
                <iframe
                  id="questit-preview-iframe"
                  title="Questit preview"
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={iframeDoc}
                  className="min-h-[320px] w-full rounded-xl bg-background"
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
                  Generated tool will appear here.
                </div>
              )}
            </div>
          )}
            {saveStatus.message ? (
              <p
                className={`text-xs ${
                  saveStatus.state === 'error'
                    ? 'text-destructive'
                    : saveStatus.state === 'success'
                      ? 'text-emerald-500'
                      : 'text-muted-foreground'
                }`}
              >
                {saveStatus.message}
              </p>
            ) : null}
          {hasGenerated ? (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="tool-code">
                <AccordionTrigger className="text-sm font-semibold text-foreground">
                  Tool code (optional)
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Peek under the hood or copy the code into your own editor.
                  </p>
                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/70">
                      <TabsTrigger value="html">HTML</TabsTrigger>
                      <TabsTrigger value="css">CSS</TabsTrigger>
                      <TabsTrigger value="js">JavaScript</TabsTrigger>
                    </TabsList>
                    <TabsContent value="html">
                      <pre className="max-h-[320px] overflow-auto rounded-lg bg-slate-950/95 p-4 text-sm text-primary-foreground">
                        {toolCode.html || '// No HTML returned'}
                      </pre>
                    </TabsContent>
                    <TabsContent value="css">
                      <pre className="max-h-[320px] overflow-auto rounded-lg bg-slate-950/95 p-4 text-sm text-primary-foreground">
                        {toolCode.css || '// No CSS returned'}
                      </pre>
                    </TabsContent>
                    <TabsContent value="js">
                      <pre className="max-h-[320px] overflow-auto rounded-lg bg-slate-950/95 p-4 text-sm text-primary-foreground">
                        {toolCode.js || '// No JS returned'}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </TabsContent>
        {/* History and settings removed per design alignment */}
      </Tabs>
    </Surface>
  );
}
