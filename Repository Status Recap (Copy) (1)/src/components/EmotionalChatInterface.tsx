import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { 
  Loader2, Send, Sparkles, RotateCcw, Heart, ThumbsUp, 
  Zap, Star, Wand2, PartyPopper, Smile
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  versionNumber?: number;
  emotion?: "excited" | "proud" | "helpful" | "celebrating";
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  onRevertToVersion?: (versionNumber: number) => void;
}

// Personality responses for the AI
const aiPersonality = {
  greetings: [
    "Hey there! 👋 What would you like to change?",
    "I'm here to help! ✨ What's on your mind?",
    "Ready when you are! 🚀 What should we improve?",
  ],
  processing: [
    "Working my magic",
    "Crafting something special",
    "Making it awesome",
    "Adding some sparkle",
  ],
  emojis: {
    excited: ["🎉", "✨", "🚀", "⚡"],
    proud: ["🌟", "💫", "🎨", "👏"],
    helpful: ["💡", "🔧", "🛠️", "💪"],
    celebrating: ["🎊", "🥳", "🎈", "🌈"],
  }
};

export function EmotionalChatInterface({ 
  messages, 
  onSendMessage, 
  isProcessing, 
  onRevertToVersion 
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [aiMood, setAiMood] = useState<"idle" | "thinking" | "excited">("idle");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isProcessing) {
      setAiMood("thinking");
    } else if (messages.length > 0) {
      setAiMood("excited");
      setTimeout(() => setAiMood("idle"), 3000);
    }
  }, [isProcessing, messages.length]);

  // Show confetti on new versions
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.versionNumber && lastMessage.versionNumber > 1) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput("");
      setShowQuickActions(false);
    }
  };

  const quickSuggestions = [
    { text: "Make it more colorful", icon: "🎨" },
    { text: "Add animations", icon: "✨" },
    { text: "Improve the layout", icon: "📐" },
    { text: "Add a dark mode", icon: "🌙" },
  ];

  const getMoodEmoji = () => {
    if (aiMood === "thinking") return "🤔";
    if (aiMood === "excited") return "🎉";
    return "💜";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="flex flex-col h-[600px] border-2 overflow-hidden relative">
        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-50"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    top: "50%", 
                    left: "50%",
                    opacity: 1,
                    scale: 0
                  }}
                  animate={{ 
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: 0,
                    scale: 1,
                    rotate: Math.random() * 360
                  }}
                  transition={{ duration: 1.5, delay: i * 0.05 }}
                  className="absolute"
                >
                  {["🎉", "✨", "⭐", "💫", "🌟"][i % 5]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with Personality */}
        <motion.div 
          className="border-b p-4 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50"
          animate={{ 
            backgroundPosition: aiMood === "thinking" ? ["0% 50%", "100% 50%"] : "0% 50%"
          }}
          transition={{ duration: 2, repeat: aiMood === "thinking" ? Infinity : 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center relative"
                animate={{ 
                  scale: aiMood === "thinking" ? [1, 1.1, 1] : 1,
                  rotate: aiMood === "excited" ? [0, 10, -10, 0] : 0
                }}
                transition={{ duration: 0.6, repeat: aiMood === "thinking" ? Infinity : 0 }}
              >
                <span className="text-2xl">{getMoodEmoji()}</span>
                {aiMood === "thinking" && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-violet-400"
                    animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  Your Creative Assistant
                  {aiMood === "excited" && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <Sparkles className="w-4 h-4 text-violet-500" />
                    </motion.span>
                  )}
                </h3>
                <motion.p 
                  className="text-xs text-muted-foreground"
                  key={aiMood}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {isProcessing 
                    ? aiPersonality.processing[Math.floor(Math.random() * aiPersonality.processing.length)] + "..." 
                    : messages.length === 0
                    ? "Ready to bring your ideas to life! ✨"
                    : "I'm here to help you iterate! 💪"}
                </motion.p>
              </div>
            </div>
            
            {messages.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                {messages.filter(m => m.versionNumber).length} versions
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🎨
                </motion.div>
                <h4 className="font-semibold mb-2">Let's make something amazing!</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Tell me what you'd like to improve or change
                </p>
                
                {/* Quick Action Suggestions */}
                {showQuickActions && (
                  <motion.div 
                    className="flex flex-wrap gap-2 justify-center mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {quickSuggestions.map((suggestion, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setInput(suggestion.text);
                          setShowQuickActions(false);
                        }}
                        className="px-3 py-2 bg-gradient-to-br from-violet-100 to-fuchsia-100 hover:from-violet-200 hover:to-fuchsia-200 rounded-xl text-sm flex items-center gap-2 transition-all"
                      >
                        <span>{suggestion.icon}</span>
                        <span>{suggestion.text}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              messages.map((message, idx) => (
                <motion.div 
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Version Celebration Marker */}
                  {message.versionNumber && (
                    <motion.div 
                      className="flex items-center justify-center my-6"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <Badge 
                        className="gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                        <span className="font-semibold">Version {message.versionNumber}</span>
                        <PartyPopper className="w-4 h-4" />
                        {onRevertToVersion && idx < messages.length - 1 && (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-3 ml-2 bg-white/20 hover:bg-white/30 text-white"
                              onClick={() => onRevertToVersion(message.versionNumber!)}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Revert
                            </Button>
                          </motion.div>
                        )}
                      </Badge>
                    </motion.div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar with Emotion */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="flex-shrink-0"
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl ${
                        message.role === "user" 
                          ? "bg-gradient-to-br from-blue-500 to-cyan-500" 
                          : "bg-gradient-to-br from-violet-500 to-fuchsia-500"
                      }`}>
                        {message.role === "user" ? "😊" : message.emotion === "celebrating" ? "🎉" : "💜"}
                      </div>
                    </motion.div>

                    {/* Message Content with Emotion */}
                    <div className={`flex-1 ${message.role === "user" ? "items-end" : "items-start"} flex flex-col max-w-[80%]`}>
                      <motion.div 
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-tr-sm"
                            : "bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-tl-sm border-2 border-violet-100"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        
                        {/* Reaction buttons for assistant messages */}
                        {message.role === "assistant" && idx === messages.length - 1 && !isProcessing && (
                          <motion.div 
                            className="flex gap-2 mt-3 pt-3 border-t border-violet-200"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-lg hover:bg-violet-100 rounded-full p-1"
                              title="Love it!"
                            >
                              ❤️
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-lg hover:bg-violet-100 rounded-full p-1"
                              title="Nice work!"
                            >
                              👍
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-lg hover:bg-violet-100 rounded-full p-1"
                              title="Amazing!"
                            >
                              🔥
                            </motion.button>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {/* Typing Indicator with Personality */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl">
                  💜
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl rounded-tl-sm px-5 py-4 border-2 border-violet-100">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2.5 h-2.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full"
                        animate={{ 
                          y: [0, -10, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          duration: 0.6, 
                          repeat: Infinity, 
                          delay: i * 0.15 
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input with Emotional Feedback */}
        <form onSubmit={handleSubmit} className="border-t p-4 bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                placeholder="What would you like to change? ✨"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[60px] max-h-[120px] resize-none pr-12 border-2 focus:border-violet-300 transition-all"
                disabled={isProcessing}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              {/* Character encouragement */}
              {input.length > 10 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 bottom-3"
                >
                  <Smile className="w-5 h-5 text-violet-400" />
                </motion.div>
              )}
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="submit" 
                size="icon" 
                className="h-[60px] w-[60px] bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 relative overflow-hidden group"
                disabled={!input.trim() || isProcessing}
              >
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ scale: 0, opacity: 0.5 }}
                  whileHover={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </Button>
            </motion.div>
          </div>
          
          <motion.p 
            className="text-xs text-muted-foreground mt-2 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap className="w-3 h-3 text-violet-400" />
            <span>Press <kbd className="px-1.5 py-0.5 bg-white rounded border">Enter</kbd> to send</span>
          </motion.p>
        </form>
      </Card>
    </motion.div>
  );
}