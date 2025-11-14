import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import WorkbenchSidebar from '@/components/workbench/WorkbenchSidebar.jsx';
import PromptTimeline from '@/components/workbench/PromptTimeline.jsx';

export default function WorkbenchInspector({
  hasGenerated,
  iframeDoc,
  saveStatus,
  toolCode,
  sidebarProps,
  sessionEntries,
  onUsePrompt,
  onRetryEntry
}) {
  return (
    <Surface muted className="flex h-full flex-col p-0">
      <Tabs defaultValue="preview" className="flex flex-1 flex-col w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/70">
          <TabsTrigger value="preview">Tool Preview</TabsTrigger>
          <TabsTrigger value="history">Conversation History</TabsTrigger>
          <TabsTrigger value="settings">Tool Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="flex flex-1 flex-col p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Preview</h3>
            {hasGenerated ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                Live
              </Badge>
            ) : null}
          </div>
          <div className="relative overflow-hidden rounded-xl border border-dashed border-primary/30 bg-muted/40">
            {iframeDoc ? (
              <iframe
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
        <TabsContent value="history" className="flex flex-1 flex-col space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Conversation history</h3>
            {sessionEntries.length ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                {sessionEntries.length} {sessionEntries.length === 1 ? 'update' : 'updates'}
              </Badge>
            ) : null}
          </div>
          {sessionEntries.length ? (
            <PromptTimeline entries={sessionEntries} onUsePrompt={onUsePrompt} onRetry={onRetryEntry} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Each time you ask Questit to adjust something, the conversation will appear here so you can revisit it.
            </p>
          )}
        </TabsContent>
        <TabsContent value="settings" className="flex flex-1 flex-col space-y-6 p-6">
          <WorkbenchSidebar {...sidebarProps} />
        </TabsContent>
      </Tabs>
    </Surface>
  );
}
