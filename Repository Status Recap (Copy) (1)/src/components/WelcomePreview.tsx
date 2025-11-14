import { Card } from "./ui/card";
import { Sparkles, Wand2, Rocket, Zap } from "lucide-react";

export function WelcomePreview() {
  return (
    <Card className="border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 p-12">
      <div className="text-center space-y-6">
        {/* Animated Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-2">
          <h3 className="text-2xl">Your Tool Will Appear Here</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Describe what you want to build, and watch it materialize in seconds. It's like magic, but it's AI!
          </p>
        </div>

        {/* Fun Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4">
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-xs text-muted-foreground">Lightning Fast</div>
          </div>
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-violet-600" />
            </div>
            <div className="text-xs text-muted-foreground">AI Powered</div>
          </div>
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl flex items-center justify-center">
              <Rocket className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-xs text-muted-foreground">Ready to Use</div>
          </div>
        </div>

        {/* Encouraging Message */}
        <div className="pt-4">
          <p className="text-sm text-violet-600">
            ✨ No coding required • No setup needed • Just pure creativity
          </p>
        </div>
      </div>
    </Card>
  );
}
