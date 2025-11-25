import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PreviewStage from '@/components/preview/PreviewStage.jsx';

export default function TemplatePreviewDialog({ open, onOpenChange, template }) {
  if (!template) {
    return <Dialog open={open} onOpenChange={onOpenChange} />;
  }

  const { title, summary, audience = [], tags = [], quickTweaks = [] } = template;
  const previewHtml = template.preview?.html || template.html || '';
  const previewCss = template.preview?.css || template.css || '';
  const previewJs = template.preview?.js || template.js || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl gap-6 p-0 sm:p-0">
        <DialogHeader className="space-y-2 p-6 pb-0">
          <DialogTitle className="text-2xl font-semibold text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{summary}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="preview" className="px-6 pb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tweaks">Quick tweaks</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-6 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border/70 shadow-xl">
              <PreviewStage
                html={previewHtml}
                css={previewCss}
                js={previewJs}
                height={420}
                title={title}
                subtitle="Template preview"
                statusLabel="Sample"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Preview is a simplified mockup. Your generated version will include responsive layout and
              your edits.
            </p>
          </TabsContent>
          <TabsContent value="details" className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {audience.map((label) => (
                <Badge key={label} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                  {label}
                </Badge>
              ))}
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground/80">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Each template can be personalised inside the workbench. After loading it, ask Questit for
              any adjustments in plain language and save your version for later.
            </p>
          </TabsContent>
          <TabsContent value="tweaks" className="mt-6 space-y-3">
            {quickTweaks.length ? (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {quickTweaks.map((tweak) => (
                  <li key={tweak} className="rounded-xl border border-border/50 bg-background/60 p-3">
                    {tweak}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Try asking Questit for layout changes, colour tweaks, or extra steps after you load this
                template.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
