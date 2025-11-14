import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Scroll, Code2, Share2, Trash2, ExternalLink, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { ScrollArea } from "./ui/scroll-area";

interface SavedTool {
  id: string;
  title: string;
  prompt: string;
  theme: string;
  colorMode: string;
  createdAt: string;
  publishedUrl?: string;
  bundleSize: number;
}

interface SavedToolsProps {
  tools: SavedTool[];
  onLoad: (tool: SavedTool) => void;
  onPublish: (toolId: string) => void;
  onDelete: (toolId: string) => void;
}

export function SavedTools({ tools, onLoad, onPublish, onDelete }: SavedToolsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (tools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Tools</CardTitle>
          <CardDescription>Your saved tools will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Scroll className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No saved tools yet</p>
            <p className="text-sm text-muted-foreground">
              Generate a tool and click "Save" to store it here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Tools</CardTitle>
            <CardDescription>{tools.length} saved tool{tools.length !== 1 ? "s" : ""}</CardDescription>
          </div>
          <Badge variant="outline">{tools.length}/100</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {tools.map((tool) => (
              <Card key={tool.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{tool.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {tool.prompt}
                      </CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this tool?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete "{tool.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(tool.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{tool.theme}</Badge>
                    <Badge variant="outline">{tool.colorMode}</Badge>
                    <Badge variant="secondary">{formatSize(tool.bundleSize)}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <Calendar className="w-3 h-3" />
                      {formatDate(tool.createdAt)}
                    </div>
                  </div>
                  
                  {tool.publishedUrl && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <code className="text-xs truncate flex-1">{tool.publishedUrl}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(tool.publishedUrl, "_blank")}
                      >
                        Visit
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onLoad(tool)}
                    >
                      <Code2 className="w-4 h-4 mr-2" />
                      Load
                    </Button>
                    {!tool.publishedUrl && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => onPublish(tool.id)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
