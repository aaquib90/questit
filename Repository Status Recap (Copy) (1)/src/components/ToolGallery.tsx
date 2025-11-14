import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Search, Sparkles, ShoppingCart, Smile, Calculator, Clock, 
  Heart, Zap, Palette, DollarSign, Coffee, BookOpen, 
  Music, Calendar, Target, Lightbulb, FileText, Hash,
  Star, TrendingUp
} from "lucide-react";

interface GalleryTool {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  icon: any;
  emoji: string;
  gradient: string;
  tags: string[];
  isPopular?: boolean;
  isTrending?: boolean;
}

interface ToolGalleryProps {
  onSelectTool: (prompt: string, title: string) => void;
}

export function ToolGallery({ onSelectTool }: ToolGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const galleryTools: GalleryTool[] = [
    // Productivity
    {
      id: "shopping-list",
      title: "Shopping List Manager",
      description: "Track items you need to buy with checkboxes and categories",
      prompt: "Create a shopping list where I can add items, check them off, and organize by categories like produce, dairy, and pantry",
      category: "productivity",
      icon: ShoppingCart,
      emoji: "🛒",
      gradient: "from-emerald-500 to-teal-500",
      tags: ["list", "shopping", "organize"],
      isPopular: true
    },
    {
      id: "pomodoro-timer",
      title: "Pomodoro Timer",
      description: "Focus timer with 25-minute work sessions and breaks",
      prompt: "Build a Pomodoro timer with 25-minute work sessions, 5-minute short breaks, and 15-minute long breaks. Include a task list.",
      category: "productivity",
      icon: Clock,
      emoji: "⏰",
      gradient: "from-red-500 to-orange-500",
      tags: ["timer", "focus", "productivity"],
      isPopular: true
    },
    {
      id: "habit-tracker",
      title: "Habit Tracker",
      description: "Track daily habits with a beautiful calendar view",
      prompt: "Create a habit tracker where I can add habits and mark them complete each day with a calendar visualization",
      category: "productivity",
      icon: Target,
      emoji: "🎯",
      gradient: "from-blue-500 to-cyan-500",
      tags: ["habits", "tracking", "goals"],
      isTrending: true
    },
    {
      id: "note-taker",
      title: "Quick Note Taker",
      description: "Simple notes with search and tags",
      prompt: "Make a note-taking app where I can create, edit, search, and tag notes. Include a list view and detail view.",
      category: "productivity",
      icon: FileText,
      emoji: "📝",
      gradient: "from-indigo-500 to-purple-500",
      tags: ["notes", "writing", "organize"]
    },

    // Creativity
    {
      id: "color-palette",
      title: "Color Palette Generator",
      description: "Generate beautiful color palettes with hex codes",
      prompt: "Create a color palette generator that creates random harmonious color schemes with hex codes I can copy",
      category: "creativity",
      icon: Palette,
      emoji: "🎨",
      gradient: "from-pink-500 to-rose-500",
      tags: ["colors", "design", "creative"],
      isPopular: true
    },
    {
      id: "random-ideas",
      title: "Idea Generator",
      description: "Get random creative prompts and ideas",
      prompt: "Build a random idea generator with categories like creative projects, writing prompts, business ideas, and date night ideas",
      category: "creativity",
      icon: Lightbulb,
      emoji: "💡",
      gradient: "from-yellow-500 to-amber-500",
      tags: ["ideas", "creative", "inspiration"]
    },
    {
      id: "quote-generator",
      title: "Motivational Quotes",
      description: "Display inspiring quotes with beautiful backgrounds",
      prompt: "Create a motivational quote generator with a collection of inspiring quotes and beautiful gradient backgrounds",
      category: "creativity",
      icon: Star,
      emoji: "⭐",
      gradient: "from-purple-500 to-violet-500",
      tags: ["quotes", "motivation", "inspiration"],
      isTrending: true
    },
    {
      id: "playlist-maker",
      title: "Playlist Organizer",
      description: "Organize your favorite songs into playlists",
      prompt: "Make a playlist organizer where I can create playlists, add songs with artist and title, and reorder them",
      category: "creativity",
      icon: Music,
      emoji: "🎵",
      gradient: "from-green-500 to-emerald-500",
      tags: ["music", "organize", "entertainment"]
    },

    // Utilities
    {
      id: "recipe-scaler",
      title: "Recipe Scaler",
      description: "Adjust recipe ingredients for any serving size",
      prompt: "Create a recipe scaler where I can input ingredients with amounts and scale them up or down for different serving sizes",
      category: "utilities",
      icon: Calculator,
      emoji: "📏",
      gradient: "from-orange-500 to-red-500",
      tags: ["cooking", "recipes", "calculator"],
      isPopular: true
    },
    {
      id: "unit-converter",
      title: "Unit Converter",
      description: "Convert between different units of measurement",
      prompt: "Build a unit converter for temperature, length, weight, and volume with common units like Celsius/Fahrenheit, meters/feet, kg/lbs",
      category: "utilities",
      icon: Hash,
      emoji: "🔢",
      gradient: "from-cyan-500 to-blue-500",
      tags: ["converter", "calculator", "utility"]
    },
    {
      id: "budget-calculator",
      title: "Budget Calculator",
      description: "Track income and expenses simply",
      prompt: "Create a simple budget calculator where I can add income and expenses by category and see totals and remaining balance",
      category: "utilities",
      icon: DollarSign,
      emoji: "💰",
      gradient: "from-green-600 to-emerald-600",
      tags: ["budget", "money", "finance"],
      isTrending: true
    },
    {
      id: "reading-time",
      title: "Reading Time Estimator",
      description: "Calculate how long it takes to read text",
      prompt: "Make a reading time estimator that calculates estimated reading time based on word count at different reading speeds",
      category: "utilities",
      icon: BookOpen,
      emoji: "📚",
      gradient: "from-violet-500 to-purple-500",
      tags: ["reading", "calculator", "writing"]
    },

    // Wellness & Fun
    {
      id: "mood-tracker",
      title: "Mood Journal",
      description: "Track your daily emotions with emojis",
      prompt: "Make a mood tracker where I can pick how I feel each day with emoji options and add optional notes",
      category: "wellness",
      icon: Smile,
      emoji: "😊",
      gradient: "from-violet-500 to-fuchsia-500",
      tags: ["mood", "journal", "emotions"],
      isPopular: true
    },
    {
      id: "gratitude-journal",
      title: "Gratitude Journal",
      description: "Log daily things you're grateful for",
      prompt: "Create a gratitude journal where I can log three things I'm grateful for each day with dates",
      category: "wellness",
      icon: Heart,
      emoji: "💖",
      gradient: "from-pink-500 to-rose-500",
      tags: ["gratitude", "journal", "wellness"]
    },
    {
      id: "water-tracker",
      title: "Water Intake Tracker",
      description: "Track your daily water consumption",
      prompt: "Build a water intake tracker where I can log glasses of water and see progress toward a daily goal with visual feedback",
      category: "wellness",
      icon: Coffee,
      emoji: "💧",
      gradient: "from-blue-400 to-cyan-400",
      tags: ["health", "hydration", "tracking"],
      isTrending: true
    },
    {
      id: "countdown",
      title: "Event Countdown",
      description: "Count down to special dates and events",
      prompt: "Create an event countdown tool where I can add important dates and see days/hours/minutes until each event",
      category: "wellness",
      icon: Calendar,
      emoji: "📅",
      gradient: "from-indigo-500 to-blue-500",
      tags: ["countdown", "events", "dates"]
    },
  ];

  const categories = [
    { id: "all", label: "All Tools", icon: Sparkles },
    { id: "productivity", label: "Productivity", icon: Target },
    { id: "creativity", label: "Creativity", icon: Lightbulb },
    { id: "utilities", label: "Utilities", icon: Calculator },
    { id: "wellness", label: "Wellness & Fun", icon: Heart },
  ];

  const filteredTools = galleryTools.filter(tool => {
    const matchesSearch = searchQuery === "" || 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const popularTools = galleryTools.filter(tool => tool.isPopular);
  const trendingTools = galleryTools.filter(tool => tool.isTrending);

  const renderToolCard = (tool: GalleryTool) => {
    const Icon = tool.icon;
    return (
      <Card 
        key={tool.id}
        className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-2"
        onClick={() => onSelectTool(tool.prompt, tool.title)}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <span className="text-2xl">{tool.emoji}</span>
            </div>
            <div className="flex gap-1">
              {tool.isPopular && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
              {tool.isTrending && (
                <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="group-hover:text-violet-600 transition-colors">{tool.title}</CardTitle>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tool.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full group-hover:bg-violet-100 group-hover:text-violet-700 transition-colors"
          >
            <Sparkles className="w-3 h-3 mr-2" />
            Use This Template
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-2xl mb-2">
          <span className="text-3xl">🎨</span>
          <h2>Browse Tool Templates</h2>
        </div>
        <p className="text-muted-foreground">
          Start with a proven template and customize it to your needs
        </p>
        
        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Popular Tools */}
          {searchQuery === "" && popularTools.length > 0 && (
            <div>
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Popular Templates
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularTools.map(renderToolCard)}
              </div>
            </div>
          )}

          {/* Trending Tools */}
          {searchQuery === "" && trendingTools.length > 0 && (
            <div>
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-500" />
                Trending Now
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTools.map(renderToolCard)}
              </div>
            </div>
          )}

          {/* All Tools */}
          <div>
            {searchQuery !== "" && (
              <h3 className="text-lg mb-4">
                Search Results ({filteredTools.length})
              </h3>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map(renderToolCard)}
            </div>
            {filteredTools.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>No templates found matching "{searchQuery}"</p>
                <Button 
                  variant="link" 
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {categories.slice(1).map(category => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools
                .filter(tool => tool.category === category.id)
                .map(renderToolCard)}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
