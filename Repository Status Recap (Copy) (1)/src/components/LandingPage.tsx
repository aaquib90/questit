import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Wand2, Heart, Palette, Share2, Shield, Sparkles, Github, Twitter, Clock, Smile, Star, ShoppingCart, Smile as SmileIcon, Calculator, Type, Lightbulb, Zap } from "lucide-react";

interface LandingPageProps {
  onGetStarted: (prompt?: string) => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Wand2,
      title: "Just Describe What You Want",
      description: "Tell us your idea in plain English. Our AI brings it to life instantly—no technical skills needed."
    },
    {
      icon: Heart,
      title: "Works Right in Your Browser",
      description: "Everything works instantly in your browser. Nothing to download, nothing to set up."
    },
    {
      icon: Palette,
      title: "Make It Beautiful",
      description: "Choose from gorgeous color themes and styles. Every tool can match your personal taste."
    },
    {
      icon: Share2,
      title: "Share with Anyone",
      description: "Share your creation with one click. Get a link that works anywhere in the world, instantly."
    },
    {
      icon: Shield,
      title: "Your Privacy Matters",
      description: "Your ideas stay private. We don't collect your personal information or track what you create."
    },
    {
      icon: Sparkles,
      title: "Super Fast & Reliable",
      description: "Your tools work instantly, everywhere. Built on the world's fastest infrastructure."
    }
  ];

  const examples = [
    {
      emoji: "🛒",
      icon: ShoppingCart,
      title: "Shopping List",
      description: "Track what you need to buy",
      prompt: "Create a simple shopping list where I can add and check off items",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      emoji: "😊",
      icon: SmileIcon,
      title: "Mood Journal",
      description: "Track your daily feelings",
      prompt: "Make a mood tracker where I can pick how I feel today with emojis",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      emoji: "📏",
      icon: Calculator,
      title: "Recipe Scaler",
      description: "Adjust recipe servings easily",
      prompt: "Create a tool to scale recipe ingredients up or down for any number of servings",
      gradient: "from-orange-500 to-red-500"
    },
    {
      emoji: "✍️",
      icon: Type,
      title: "Word Counter",
      description: "Count words and characters",
      prompt: "Make a simple word and character counter with live stats",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      emoji: "💡",
      icon: Lightbulb,
      title: "Random Ideas",
      description: "Generate creative prompts",
      prompt: "Build a random idea generator with different categories like food, activities, and hobbies",
      gradient: "from-yellow-500 to-amber-500"
    },
    {
      emoji: "⚡",
      icon: Zap,
      title: "Quick Timer",
      description: "Simple countdown timer",
      prompt: "Create a clean countdown timer with preset options for 5, 10, 15, and 30 minutes",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Tell Us Your Idea",
      description: "Simply type what you want to create. Like asking a friend for help—just be yourself."
    },
    {
      step: "2",
      title: "Watch the Magic Happen",
      description: "Our AI builds your tool in seconds. Sit back and watch your idea come to life."
    },
    {
      step: "3",
      title: "Try It & Perfect It",
      description: "Use your new tool right away. Want changes? Just ask—it's that easy."
    },
    {
      step: "4",
      title: "Save & Share",
      description: "Love it? Save it for later and share with friends, family, or colleagues."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl">Questit</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button onClick={onGetStarted}>Get Started Free</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <Badge className="mb-4" variant="secondary">
          <Star className="w-3 h-3 mr-1" />
          Powered by AI Magic
        </Badge>
        <h1 className="text-5xl md:text-7xl mb-6 pb-2 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Turn Ideas into Tools,
          <br />
          Like Magic
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Create helpful little tools just by describing them. No coding, no complexity, no hassle. If you can describe it, we can build it.
        </p>
        <div className="flex gap-4 justify-center flex-wrap mb-6">
          <Button size="lg" onClick={() => onGetStarted()}>
            <Sparkles className="w-4 h-4 mr-2" />
            Start Creating Now
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => {
              const examplesSection = document.getElementById('examples-section');
              examplesSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            See Examples
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Or try a popular example:</p>
        <div className="flex gap-3 justify-center flex-wrap max-w-3xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-200"
            onClick={() => onGetStarted("Create a simple shopping list where I can add and check off items")}
          >
            🛒 Shopping List
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 border-violet-200"
            onClick={() => onGetStarted("Make a mood tracker where I can pick how I feel today with emojis")}
          >
            😊 Mood Journal
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-200"
            onClick={() => onGetStarted("Create a clean countdown timer with preset options for 5, 10, 15, and 30 minutes")}
          >
            ⚡ Quick Timer
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border-orange-200"
            onClick={() => onGetStarted("Create a tool to scale recipe ingredients up or down for any number of servings")}
          >
            📏 Recipe Scaler
          </Button>
        </div>
        <div className="mt-12 flex gap-8 justify-center text-sm text-muted-foreground flex-wrap">
          <div>
            <div className="text-2xl mb-1">✨ Super Light</div>
            <div>Works Anywhere</div>
          </div>
          <div>
            <div className="text-2xl mb-1">⚡ Lightning Fast</div>
            <div>Instant Results</div>
          </div>
          <div>
            <div className="text-2xl mb-1">🎨 Beautiful</div>
            <div>Looks Great</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From idea to working tool in less than a minute
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((item) => (
            <Card key={item.step}>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                  <span className="text-2xl text-white">{item.step}</span>
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 -mx-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">Why People Love Questit</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple to use, powerful enough for anything
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-violet-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Examples */}
      <section className="container mx-auto px-4 py-20" id="examples-section">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">Try One of These Ideas</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Click any card to start building instantly—no signup required!
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {examples.map((example) => {
            const Icon = example.icon;
            return (
              <Card 
                key={example.title} 
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-2"
                onClick={() => onGetStarted(example.prompt)}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${example.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-3xl">{example.emoji}</span>
                  </div>
                  <CardTitle className="group-hover:text-violet-600 transition-colors">{example.title}</CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">"{example.prompt}"</p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full group-hover:bg-violet-100 group-hover:text-violet-700 transition-colors">
                    <Sparkles className="w-3 h-3 mr-2" />
                    Try This Idea
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">Or create something completely unique...</p>
          <Button size="lg" variant="outline" onClick={() => onGetStarted()}>
            <Wand2 className="w-4 h-4 mr-2" />
            Start with Your Own Idea
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-2xl p-12 border-2 border-violet-200">
          <h2 className="text-4xl mb-4">Ready to Create Something?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of people bringing their ideas to life. Start creating in seconds—completely free.
          </p>
          <Button size="lg" onClick={onGetStarted}>
            <Sparkles className="w-4 h-4 mr-2" />
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span>Questit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Create helpful tools just by describing them. No coding required.
              </p>
            </div>
            <div>
              <div className="mb-4">Product</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Features</div>
                <div>Examples</div>
                <div>Pricing</div>
                <div>Help</div>
              </div>
            </div>
            <div>
              <div className="mb-4">Resources</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Getting Started</div>
                <div>Tutorials</div>
                <div>GitHub</div>
                <div>Community</div>
              </div>
            </div>
            <div>
              <div className="mb-4">Connect</div>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Questit. Built with AI, designed for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}