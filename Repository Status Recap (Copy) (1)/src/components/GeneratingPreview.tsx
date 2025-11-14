import { Card } from "./ui/card";
import { Sparkles, Wand2 } from "lucide-react";

export function GeneratingPreview() {
  return (
    <Card className="border-2 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-violet-50 p-12">
      <div className="text-center space-y-6">
        {/* Animated Icon Group */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          {/* Floating Wands */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center animate-bounce">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center animate-bounce" style={{ animationDelay: "0.2s" }}>
            <Wand2 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-2">
          <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent animate-pulse">
            Creating Your Tool...
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our AI is bringing your idea to life. This usually takes just a few seconds!
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-3 max-w-xs mx-auto">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Analyzing your idea...</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }}></div>
            <span className="text-muted-foreground">Generating code...</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
            <span className="text-muted-foreground">Adding finishing touches...</span>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="pt-4">
          <p className="text-xs text-violet-600">
            ✨ Did you know? Most tools are created in under 10 seconds!
          </p>
        </div>
      </div>
    </Card>
  );
}
