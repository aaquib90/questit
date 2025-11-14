import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Sparkles, ShoppingCart, Smile, Calculator, Clock, 
  Heart, Zap, Palette, DollarSign, Coffee, BookOpen, 
  Music, Calendar, Target, Lightbulb, FileText, Hash,
  Star, TrendingUp, Wand2
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
  personality?: string;
}

interface ToolGalleryProps {
  onSelectTool: (prompt: string, title: string) => void;
}

export function EmotionalToolGallery({ onSelectTool }: ToolGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

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
      isPopular: true,
      personality: "Never forget milk again! Perfect for your grocery runs."
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
      isPopular: true,
      personality: "Stay focused and productive without burning out!"
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
      isTrending: true,
      personality: "Build better habits, one day at a time. You've got this!"
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
      tags: ["notes", "writing", "organize"],
      personality: "Capture your brilliant ideas before they slip away!"
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
      isPopular: true,
      personality: "Find the perfect colors for your next masterpiece!"
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
      tags: ["ideas", "creative", "inspiration"],
      personality: "Stuck? Let's spark some creativity!"
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
      isTrending: true,
      personality: "Start every day with a dose of inspiration!"
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
      tags: ["music", "organize", "entertainment"],
      personality: "Curate the perfect soundtrack for every mood!"
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
      isPopular: true,
      personality: "Cooking for 2 or 20? We've got you covered!"
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
      tags: ["converter", "calculator", "utility"],
      personality: "No more mental math gymnastics!"
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
      isTrending: true,
      personality: "Take control of your finances with ease!"
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
      tags: ["reading", "calculator", "writing"],
      personality: "Know exactly how long that article will take!"
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
      isPopular: true,
      personality: "Understand your emotions and patterns better!"
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
      tags: ["gratitude", "journal", "wellness"],
      personality: "Cultivate happiness through daily gratitude!"
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
      isTrending: true,
      personality: "Stay hydrated and feel amazing!"
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
      tags: ["countdown", "events", "dates"],
      personality: "Build excitement for your special moments!"
    },
  ];

  const categories = [
    { id: "all", label: "All Tools", icon: Sparkles, emoji: "✨" },
    { id: "productivity", label: "Productivity", icon: Target, emoji: "🎯" },
    { id: "creativity", label: "Creativity", icon: Lightbulb, emoji: "💡" },
    { id: "utilities", label: "Utilities", icon: Calculator, emoji: "🔢" },
    { id: "wellness", label: "Wellness", icon: Heart, emoji: "💖" },
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

  const renderToolCard = (tool: GalleryTool, index: number) => {
    const Icon = tool.icon;
    const isHovered = hoveredTool === tool.id;
    
    return (
      <motion.div
        key={tool.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        whileHover={{ y: -8 }}
        onHoverStart={() => setHoveredTool(tool.id)}
        onHoverEnd={() => setHoveredTool(null)}
      >
        <Card 
          className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 overflow-hidden relative h-full"
          onClick={() => onSelectTool(tool.prompt, tool.title)}
        >
          {/* Hover Gradient Overlay */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
            animate={isHovered ? { opacity: 0.1 } : { opacity: 0 }}
          />

          <CardHeader className="relative">
            <div className="flex items-start justify-between mb-3">
              <motion.div 
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg relative overflow-hidden`}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                  animate={isHovered ? { 
                    x: ["-100%", "200%"],
                    opacity: [0, 0.3, 0]
                  } : {}}
                  transition={{ duration: 0.8 }}
                />
                <span className="text-3xl relative z-10">{tool.emoji}</span>
              </motion.div>
              <div className="flex gap-1.5">
                {tool.isPopular && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      Popular
                    </Badge>
                  </motion.div>
                )}
                {tool.isTrending && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.3 }}
                  >
                    <Badge className="text-xs gap-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 border-0">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
            
            <CardTitle className="group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600 group-hover:bg-clip-text transition-all">
              {tool.title}
            </CardTitle>
            <CardDescription className="leading-relaxed">{tool.description}</CardDescription>
            
            {/* Personality Text - Shows on Hover */}
            <AnimatePresence>
              {isHovered && tool.personality && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-violet-600 mt-2"
                >
                  💜 {tool.personality}
                </motion.p>
              )}
            </AnimatePresence>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tool.tags.map((tag, i) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Badge variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600 group-hover:text-white transition-all"
              >
                <Wand2 className="w-3 h-3 mr-2" />
                Create This Tool
                <Sparkles className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with Personality */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div 
          className="inline-flex items-center gap-3 text-3xl mb-2"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.span 
            className="text-5xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🎨
          </motion.span>
          <h2 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            Browse Templates
          </h2>
          <motion.span 
            className="text-5xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          >
            ✨
          </motion.span>
        </motion.div>
        <motion.p 
          className="text-muted-foreground text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Start with a proven template and make it yours!
        </motion.p>
        
        {/* Search */}
        <motion.div 
          className="max-w-md mx-auto relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates... 🔍"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-2 focus:border-violet-300"
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Tools Grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <TabsTrigger value={cat.id} className="gap-2">
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              </motion.div>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          {/* Popular Tools */}
          {searchQuery === "" && popularTools.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-xl font-semibold">Community Favorites</h3>
                <Badge variant="secondary">Most loved ❤️</Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularTools.map((tool, i) => renderToolCard(tool, i))}
              </div>
            </motion.div>
          )}

          {/* Trending Tools */}
          {searchQuery === "" && trendingTools.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-violet-500" />
                <h3 className="text-xl font-semibold">Trending Now</h3>
                <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-0">
                  Hot 🔥
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTools.map((tool, i) => renderToolCard(tool, i))}
              </div>
            </motion.div>
          )}

          {/* All Tools or Search Results */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: searchQuery ? 0 : 0.4 }}
          >
            {searchQuery !== "" && (
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-500" />
                Found {filteredTools.length} {filteredTools.length === 1 ? 'template' : 'templates'}
              </h3>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool, i) => renderToolCard(tool, i))}
            </div>
            
            {/* Empty State */}
            {filteredTools.length === 0 && (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🔍
                </motion.div>
                <h4 className="font-semibold text-lg mb-2">No templates found</h4>
                <p className="text-muted-foreground mb-4">
                  Couldn't find "{searchQuery}" but that's okay!
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Show all templates
                </Button>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {categories.slice(1).map(category => (
          <TabsContent key={category.id} value={category.id}>
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredTools
                .filter(tool => tool.category === category.id)
                .map((tool, i) => renderToolCard(tool, i))}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
