import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Loader2, Sparkles, Settings2, ShoppingCart, Smile, Calculator, Coffee, Heart, Zap } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ThemePicker } from "./ThemePicker";
import { ColorModePicker } from "./ColorModePicker";

interface PromptInputProps {
  onGenerate: (prompt: string, provider: string, model: string) => void;
  isGenerating: boolean;
  initialPrompt?: string;
}

export function PromptInput({ onGenerate, isGenerating, initialPrompt = "" }: PromptInputProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt, provider, model);
    }
  };

  const quickIdeas = [
    {
      emoji: "🛒",
      icon: ShoppingCart,
      text: "Shopping list tracker",
      prompt: "Create a simple shopping list where I can add and check off items",
      gradient: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20"
    },
    {
      emoji: "😊",
      icon: Smile,
      text: "Mood journal",
      prompt: "Make a mood tracker where I can pick how I feel today with emojis",
      gradient: "from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20"
    },
    {
      emoji: "📏",
      icon: Calculator,
      text: "Recipe scaler",
      prompt: "Create a tool to scale recipe ingredients up or down for any number of servings",
      gradient: "from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20"
    },
    {
      emoji: "☕",
      icon: Coffee,
      text: "Caffeine tracker",
      prompt: "Build a caffeine intake tracker with a daily limit warning",
      gradient: "from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20"
    },
    {
      emoji: "💖",
      icon: Heart,
      text: "Gratitude journal",
      prompt: "Create a gratitude journal where I can log three things I'm grateful for each day",
      gradient: "from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20"
    },
    {
      emoji: "⚡",
      icon: Zap,
      text: "Quick timer",
      prompt: "Make a countdown timer with preset options for 5, 10, 15, and 30 minutes",
      gradient: "from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Welcoming Header */}
      <div className="text-center space-y-2 pb-2">
        <div className="inline-flex items-center gap-2 text-2xl mb-2">
          <span className="text-3xl">✨</span>
          <h2>What would you like to create?</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Just describe your idea and watch it come to life
        </p>
      </div>

      <Card className="p-6 border-2 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="prompt" className="text-base">Your Idea</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Create a password generator with options for length and special characters..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[140px] mt-2 text-base resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Tip: Be specific about what you want—the more details, the better!
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700" 
            disabled={!prompt.trim() || isGenerating}
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Your Tool...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Tool
              </>
            )}
          </Button>

          <Collapsible open={showSettings} onOpenChange={setShowSettings}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="w-full">
                <Settings2 className="w-4 h-4 mr-2" />
                {showSettings ? "Hide" : "Show"} Settings
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">AI Provider</Label>
                  <Select value={provider} onValueChange={setProvider} disabled={isGenerating}>
                    <SelectTrigger id="provider" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel} disabled={isGenerating}>
                    <SelectTrigger id="model" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {provider === "openai" ? (
                        <>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                          <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ThemePicker />
                <ColorModePicker />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </form>
      </Card>

      {/* Quick Ideas Section */}
      <div className="space-y-3">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Need some inspiration? Try one of these:</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickIdeas.map((idea, idx) => (
            <Button
              key={idx}
              type="button"
              variant="outline"
              className={`h-auto py-3 px-4 justify-start text-left bg-gradient-to-br ${idea.gradient} border-2 transition-all hover:scale-[1.02] hover:shadow-md`}
              onClick={() => setPrompt(idea.prompt)}
              disabled={isGenerating}
            >
              <span className="text-2xl mr-3">{idea.emoji}</span>
              <span className="text-sm">{idea.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
