import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Download, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { useState, useRef } from "react";

interface ToolPreviewProps {
  html: string;
  css: string;
  js: string;
  theme: string;
  colorMode: string;
  onReset?: () => void;
  onDownload?: () => void;
}

export function ToolPreview({ html, css, js, theme, colorMode, onReset, onDownload }: ToolPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const bundleSize = new Blob([html, css, js]).size;
  const formattedSize = bundleSize < 1024 
    ? `${bundleSize} B` 
    : bundleSize < 1024 * 1024 
    ? `${(bundleSize / 1024).toFixed(1)} KB`
    : `${(bundleSize / (1024 * 1024)).toFixed(2)} MB`;

  const sizeStatus = bundleSize <= 350 * 1024 ? "success" : "warning";

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Construct the full HTML document for the iframe
  const fullDocument = `
<!DOCTYPE html>
<html lang="en" data-theme="${theme}" data-color-mode="${colorMode}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tool Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
    }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>
  `.trim();

  return (
    <Card className={isFullscreen ? "fixed inset-4 z-50 flex flex-col" : "flex flex-col h-full"}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Live preview of your generated tool</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={sizeStatus === "success" ? "default" : "secondary"}>
              {formattedSize}
            </Badge>
            <Badge variant="outline">{theme}</Badge>
            <Badge variant="outline">{colorMode}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleReload}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reload
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </>
            )}
          </Button>
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset}>
              Reset
            </Button>
          )}
        </div>
        
        <div className="flex-1 border rounded-lg overflow-hidden bg-background min-h-0">
          <iframe
            ref={iframeRef}
            srcDoc={fullDocument}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-modals allow-popups"
            title="Tool Preview"
          />
        </div>

        {bundleSize > 350 * 1024 && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
            <strong>Warning:</strong> Bundle size exceeds 350 KB limit. Consider optimizing your tool.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
