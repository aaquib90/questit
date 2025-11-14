import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Copy, ExternalLink, Loader2, Share2, CheckCircle2, Globe } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (toolName: string) => Promise<{ url: string; name: string }>;
  toolTitle: string;
}

export function PublishDialog({ open, onOpenChange, onPublish, toolTitle }: PublishDialogProps) {
  const [toolName, setToolName] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!toolName.trim()) return;

    setIsPublishing(true);
    setError(null);

    try {
      const result = await onPublish(toolName);
      setPublishedUrl(result.url);
      toast.success("Tool published successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish tool");
      toast.error("Failed to publish tool");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      toast.success("URL copied to clipboard!");
    }
  };

  const handleReset = () => {
    setPublishedUrl(null);
    setToolName("");
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const suggestedName = toolTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 30);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!publishedUrl ? (
          <>
            <DialogHeader>
              <DialogTitle>Publish Your Tool</DialogTitle>
              <DialogDescription>
                Deploy your tool to a globally-distributed Cloudflare Worker URL
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="toolName">Tool Name</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="toolName"
                    placeholder="my-awesome-tool"
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    disabled={isPublishing}
                  />
                  {suggestedName && !toolName && (
                    <Button
                      variant="outline"
                      onClick={() => setToolName(suggestedName)}
                      disabled={isPublishing}
                    >
                      Use "{suggestedName}"
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your tool will be available at: <code>{toolName || "your-tool"}.questit.cc</code>
                </p>
              </div>

              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Published tools are publicly accessible and cached at the edge for maximum performance.
                  They will be available for 90 days.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Global Edge Deployment</span>
                  <Badge variant="outline">Cloudflare Workers</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sub-50ms Latency</span>
                  <Badge variant="outline">Guaranteed</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tool Lifespan</span>
                  <Badge variant="outline">90 Days</Badge>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isPublishing}>
                Cancel
              </Button>
              <Button onClick={handlePublish} disabled={!toolName.trim() || isPublishing}>
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Publish Tool
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Tool Published!
              </DialogTitle>
              <DialogDescription>
                Your tool is now live and accessible worldwide
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Published URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={publishedUrl} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => window.open(publishedUrl, "_blank")}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Your tool is deployed to Cloudflare's global edge network and will be fast everywhere.
                </AlertDescription>
              </Alert>

              <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge>Live</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Edge Locations</span>
                  <span>275+ Worldwide</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Available Until</span>
                  <span>{new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
