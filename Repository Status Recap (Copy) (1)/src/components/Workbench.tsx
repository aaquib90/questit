import { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PromptInput } from "./PromptInput";
import { ToolPreview } from "./ToolPreview";
import { EmotionalChatInterface } from "./EmotionalChatInterface";
import { EmotionalToolGallery } from "./EmotionalToolGallery";
import { SavedTools } from "./SavedTools";
import { PublishDialog } from "./PublishDialog";
import { AuthButton } from "./AuthButton";
import { EmotionalWelcomePreview } from "./EmotionalWelcomePreview";
import { EmotionalGeneratingPreview } from "./EmotionalGeneratingPreview";
import { Badge } from "./ui/badge";
import { Save, Code2, FolderOpen, Sparkles, Compass } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

interface ToolBundle {
  html: string;
  css: string;
  js: string;
  versionNumber: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  versionNumber?: number;
}

interface SavedTool {
  id: string;
  title: string;
  prompt: string;
  theme: string;
  colorMode: string;
  createdAt: string;
  publishedUrl?: string;
  bundleSize: number;
  html: string;
  css: string;
  js: string;
}

interface User {
  email: string;
  id: string;
}

interface WorkbenchProps {
  initialPrompt?: string;
}

export function Workbench({ initialPrompt = "" }: WorkbenchProps) {
  const [user, setUser] = useState<User | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolBundle | null>(null);
  const [toolVersions, setToolVersions] = useState<ToolBundle[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);
  const [currentTheme, setCurrentTheme] = useState("emerald");
  const [currentColorMode, setCurrentColorMode] = useState("system");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIterating, setIsIterating] = useState(false);
  const [savedTools, setSavedTools] = useState<SavedTool[]>([]);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [messages, setMessages] = useState<Message[]>([]);
  const [versionCounter, setVersionCounter] = useState(0);

  // Mock user authentication
  const handleSignIn = async (email: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUser({ email, id: "user_" + Math.random().toString(36).substring(7) });
  };

  const handleSignOut = async () => {
    setUser(null);
  };

  // Mock tool generation
  const handleGenerate = async (prompt: string, provider: string, model: string) => {
    setIsGenerating(true);
    setCurrentPrompt(prompt);
    setMessages([]);
    setToolVersions([]);
    setVersionCounter(0);

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock generated tool
    const mockTool: ToolBundle = {
      html: `
        <div class="container">
          <h1>Generated Tool</h1>
          <p>This is a mock tool generated from your prompt:</p>
          <blockquote>"${prompt}"</blockquote>
          <p>Provider: ${provider} | Model: ${model}</p>
          <button onclick="alert('Hello from generated tool!')">Click Me</button>
        </div>
      `,
      css: `
        .container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          font-family: system-ui;
        }
        h1 {
          color: #059669;
          margin-bottom: 1rem;
        }
        blockquote {
          border-left: 4px solid #059669;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #666;
          font-style: italic;
        }
        button {
          background: #059669;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 1rem;
        }
        button:hover {
          background: #047857;
        }
      `,
      js: `
        console.log('Tool initialized with prompt: ${prompt.replace(/'/g, "\\'")}');
      `,
      versionNumber: 1,
    };

    setCurrentTool(mockTool);
    setToolVersions([mockTool]);
    setVersionCounter(1);
    setIsGenerating(false);

    // Add initial message to chat
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "I've created your tool! Feel free to ask for any changes or improvements.",
      timestamp: new Date(),
      versionNumber: 1,
    };
    setMessages([assistantMessage]);

    toast.success("🎉 Your tool is ready! Try it out below.");
  };

  // Handle chat messages for iteration
  const handleSendMessage = async (message: string) => {
    if (!currentTool) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsIterating(true);

    // Simulate AI iteration
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock updated tool (just append the instruction to the HTML)
    const newVersion = versionCounter + 1;
    const updatedTool: ToolBundle = {
      ...currentTool,
      html:
        currentTool.html +
        `
      <div style="margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem;">
        <strong>Updated (v${newVersion}):</strong> ${message}
      </div>
    `,
      versionNumber: newVersion,
    };

    setCurrentTool(updatedTool);
    setToolVersions(prev => [...prev, updatedTool]);
    setVersionCounter(newVersion);

    // Add assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `I've updated your tool based on your request: "${message}". Let me know if you'd like any other changes!`,
      timestamp: new Date(),
      versionNumber: newVersion,
    };
    setMessages(prev => [...prev, assistantMessage]);

    setIsIterating(false);
    toast.success("✨ Updated! Check out your changes.");
  };

  // Revert to previous version
  const handleRevertToVersion = (versionNumber: number) => {
    const version = toolVersions.find(v => v.versionNumber === versionNumber);
    if (version) {
      setCurrentTool(version);
      toast.success(`Reverted to version ${versionNumber}`);
    }
  };

  // Load tool from gallery
  const handleSelectFromGallery = (prompt: string, title: string) => {
    setCurrentPrompt(prompt);
    setActiveTab("generate");
    toast.success(`Template loaded: ${title}. Click "Generate Tool" to create it!`);
  };

  // Mock save
  const handleSave = async () => {
    if (!currentTool || !user) {
      toast.error("Please sign in to save tools");
      return;
    }

    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 500));

    const bundleSize = new Blob([currentTool.html, currentTool.css, currentTool.js]).size;

    const newTool: SavedTool = {
      id: "tool_" + Math.random().toString(36).substring(7),
      title: currentPrompt.substring(0, 50) || "Untitled Tool",
      prompt: currentPrompt,
      theme: currentTheme,
      colorMode: currentColorMode,
      createdAt: new Date().toISOString(),
      bundleSize,
      html: currentTool.html,
      css: currentTool.css,
      js: currentTool.js,
    };

    setSavedTools([newTool, ...savedTools]);
    toast.success("💾 Saved! Find it in your My Tools tab.");
  };

  // Mock load
  const handleLoad = (tool: SavedTool) => {
    const loadedTool: ToolBundle = {
      html: tool.html,
      css: tool.css,
      js: tool.js,
      versionNumber: 1,
    };
    setCurrentTool(loadedTool);
    setToolVersions([loadedTool]);
    setCurrentPrompt(tool.prompt);
    setCurrentTheme(tool.theme);
    setCurrentColorMode(tool.colorMode);
    setVersionCounter(1);
    setMessages([]);
    setActiveTab("generate");
    toast.success("Tool loaded into workbench");
  };

  // Mock publish
  const handlePublish = async (toolName: string): Promise<{ url: string; name: string }> => {
    // Simulate publish
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const url = `https://${toolName}.questit.cc`;
    return { url, name: toolName };
  };

  // Mock publish saved tool
  const handlePublishSaved = async (toolId: string) => {
    const tool = savedTools.find((t) => t.id === toolId);
    if (!tool) return;

    try {
      const toolName = tool.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 30);
      const result = await handlePublish(toolName);

      setSavedTools(
        savedTools.map((t) =>
          t.id === toolId ? { ...t, publishedUrl: result.url } : t
        )
      );

      toast.success("Tool published successfully!");
    } catch (error) {
      toast.error("Failed to publish tool");
    }
  };

  // Mock delete
  const handleDelete = async (toolId: string) => {
    setSavedTools(savedTools.filter((t) => t.id !== toolId));
    toast.success("Tool deleted");
  };

  // Mock download
  const handleDownload = () => {
    if (!currentTool) return;

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Questit Tool</title>
  <style>${currentTool.css}</style>
</head>
<body>
  ${currentTool.html}
  <script>${currentTool.js}</script>
</body>
</html>
    `.trim();

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questit-tool.html";
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Tool downloaded!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">Questit</span>
                <Badge variant="secondary">Beta</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Create tools with AI</p>
            </div>
          </div>
          <AuthButton user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="generate">
              <Code2 className="w-4 h-4 mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger value="browse">
              <Compass className="w-4 h-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="saved">
              <FolderOpen className="w-4 h-4 mr-2" />
              My Tools ({savedTools.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column - Input & Chat */}
              <div className="space-y-6">
                {!currentTool ? (
                  <PromptInput
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    initialPrompt={currentPrompt}
                  />
                ) : (
                  <>
                    <EmotionalChatInterface
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      isProcessing={isIterating}
                      onRevertToVersion={handleRevertToVersion}
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={handleSave}
                        disabled={!user}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {user ? "Save Tool" : "Sign In to Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPublishDialog(true)}
                      >
                        Publish
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column - Preview */}
              <div className="lg:sticky lg:top-24 h-fit">
                {isGenerating ? (
                  <EmotionalGeneratingPreview />
                ) : currentTool ? (
                  <ToolPreview
                    html={currentTool.html}
                    css={currentTool.css}
                    js={currentTool.js}
                    theme={currentTheme}
                    colorMode={currentColorMode}
                    onReset={() => {
                      setCurrentTool(null);
                      setMessages([]);
                      setToolVersions([]);
                    }}
                    onDownload={handleDownload}
                  />
                ) : (
                  <EmotionalWelcomePreview />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="browse" className="mt-6">
            <EmotionalToolGallery onSelectTool={handleSelectFromGallery} />
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="max-w-3xl mx-auto">
              <SavedTools
                tools={savedTools}
                onLoad={handleLoad}
                onPublish={handlePublishSaved}
                onDelete={handleDelete}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Publish Dialog */}
      {currentTool && (
        <PublishDialog
          open={showPublishDialog}
          onOpenChange={setShowPublishDialog}
          onPublish={handlePublish}
          toolTitle={currentPrompt.substring(0, 50) || "Untitled Tool"}
        />
      )}
    </div>
  );
}