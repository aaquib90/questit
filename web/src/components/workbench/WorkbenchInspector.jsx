import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/layout';

export default function WorkbenchInspector({
  hasGenerated,
  selectedTheme,
  setSelectedTheme,
  themeOptions,
  colorMode,
  setColorMode,
  colorModeOptions,
  iframeDoc,
  saveStatus,
  toolCode
}) {
  return (
    <div className="flex flex-col gap-6">
      <Surface id="questit-preview" className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Preview</h3>
          {hasGenerated ? (
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              Live
            </Badge>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Theme
            </span>
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Mode
            </span>
            <Select value={colorMode} onValueChange={setColorMode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {colorModeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
      </Surface>

      {hasGenerated ? (
        <Surface muted className="p-0">
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
        </Surface>
      ) : (
        <Surface muted className="flex min-h-[160px] items-center justify-center p-6 text-sm text-muted-foreground">
          Generate a tool to inspect the underlying code bundle.
        </Surface>
      )}
    </div>
  );
}

