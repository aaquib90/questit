import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Wand2, Code2, Palette, Zap, 
  CheckCircle2, Heart, Star 
} from "lucide-react";

interface GenerationStep {
  id: string;
  label: string;
  emoji: string;
  icon: any;
  message: string;
  color: string;
}

export function EmotionalGeneratingPreview() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showSparkles, setShowSparkles] = useState(true);

  const steps: GenerationStep[] = [
    {
      id: "understanding",
      label: "Understanding Your Vision",
      emoji: "🤔",
      icon: Heart,
      message: "Reading your idea and getting inspired...",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: "designing",
      label: "Designing the Interface",
      emoji: "🎨",
      icon: Palette,
      message: "Choosing the perfect colors and layout...",
      color: "from-violet-500 to-purple-500"
    },
    {
      id: "coding",
      label: "Writing the Code",
      emoji: "⚡",
      icon: Code2,
      message: "Crafting clean, beautiful code...",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "polishing",
      label: "Adding the Magic",
      emoji: "✨",
      icon: Sparkles,
      message: "Adding those special touches...",
      color: "from-amber-500 to-orange-500"
    },
    {
      id: "finalizing",
      label: "Almost There!",
      emoji: "🚀",
      icon: Zap,
      message: "Putting the finishing touches...",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  // Animate through steps
  useEffect(() => {
    const stepDuration = 2000; // 2 seconds per step
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / steps.length / (stepDuration / 50));
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const CurrentIcon = steps[currentStep]?.icon || Sparkles;

  return (
    <Card className="border-2 overflow-hidden">
      <CardContent className="p-8">
        {/* Main Animation Area */}
        <div className="relative h-64 mb-8 flex items-center justify-center">
          {/* Background Gradient Pulse */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${steps[currentStep]?.color} opacity-10 rounded-3xl`}
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Floating Sparkles */}
          {showSparkles && (
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  initial={{ 
                    x: "50%", 
                    y: "50%",
                    scale: 0,
                    opacity: 0
                  }}
                  animate={{ 
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                >
                  {["✨", "⭐", "💫", "🌟"][i % 4]}
                </motion.div>
              ))}
            </div>
          )}

          {/* Center Icon with Pulse */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative z-10"
          >
            <motion.div
              className={`w-32 h-32 rounded-full bg-gradient-to-br ${steps[currentStep]?.color} flex items-center justify-center relative`}
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Pulse rings */}
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${steps[currentStep]?.color}`}
                animate={{ 
                  scale: [1, 1.5, 2],
                  opacity: [0.5, 0.2, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${steps[currentStep]?.color}`}
                animate={{ 
                  scale: [1, 1.3, 1.6],
                  opacity: [0.4, 0.2, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
              
              {/* Emoji */}
              <motion.div
                className="text-6xl z-10"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {steps[currentStep]?.emoji}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Orbiting Icons */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
              }}
            >
              <motion.div
                style={{
                  x: Math.cos((i * Math.PI) / 3) * 120,
                  y: Math.sin((i * Math.PI) / 3) * 120,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                className="text-2xl opacity-60"
              >
                {["🎨", "⚡", "✨", "🚀", "💫", "🌟"][i]}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Step Indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-6"
          >
            <motion.h3 
              className="text-2xl font-semibold mb-2"
              animate={{ 
                scale: [1, 1.02, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {steps[currentStep]?.label}
            </motion.h3>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.span>
              {steps[currentStep]?.message}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Progress value={progress} className="h-3" />
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 w-1/4"
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              {Math.round(progress)}% Complete
            </span>
            <span>Step {currentStep + 1} of {steps.length}</span>
          </div>
        </div>

        {/* Step Timeline */}
        <div className="flex justify-between mt-6 px-2">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <motion.div
                key={step.id}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isComplete
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500"
                      : isCurrent
                      ? `bg-gradient-to-br ${step.color} border-transparent`
                      : "bg-muted border-border"
                  }`}
                  animate={isCurrent ? { 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <StepIcon className={`w-5 h-5 ${isCurrent ? "text-white" : "text-muted-foreground"}`} />
                  )}
                </motion.div>
                <span className={`text-xs text-center max-w-[60px] ${
                  isCurrent ? "font-semibold" : "text-muted-foreground"
                }`}>
                  {step.emoji}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Encouraging Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-full"
          >
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Your tool is being crafted with care
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
