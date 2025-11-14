import { Card, CardContent } from "./ui/card";
import { motion } from "motion/react";
import { Sparkles, Heart, Zap, Star, Wand2 } from "lucide-react";

export function EmotionalWelcomePreview() {
  const floatingEmojis = ["✨", "🎨", "🚀", "💡", "⚡", "🌟", "💫", "🎯"];

  return (
    <Card className="border-2 overflow-hidden relative min-h-[600px]">
      <CardContent className="p-8 h-full flex flex-col items-center justify-center relative">
        {/* Animated Background Gradients */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-fuchsia-400/20 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Emojis */}
        {floatingEmojis.map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
              ],
              x: [
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
              ],
              rotate: [0, 360],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {emoji}
          </motion.div>
        ))}

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-md">
          {/* Animated Icon Stack */}
          <motion.div className="relative w-32 h-32 mx-auto mb-8">
            {/* Background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-40"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Main emoji */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-7xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              🎨
            </motion.div>

            {/* Orbiting icons */}
            {[Sparkles, Heart, Zap, Star].map((Icon, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: "50%",
                  left: "50%",
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 2,
                }}
              >
                <motion.div
                  style={{
                    x: Math.cos((i * Math.PI) / 2) * 60,
                    y: Math.sin((i * Math.PI) / 2) * 60,
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              Ready to Create Magic?
            </h3>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              Describe your idea, and I'll bring it to life in seconds. No coding needed! ✨
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            className="flex flex-wrap gap-3 justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { icon: "⚡", text: "Lightning Fast" },
              { icon: "🎨", text: "Beautiful Design" },
              { icon: "💪", text: "Easy to Use" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-4 py-2 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-full flex items-center gap-2 text-sm font-medium"
              >
                <span className="text-lg">{feature.icon}</span>
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Inspiring Examples */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground font-medium mb-3">
              Try something like:
            </p>
            {[
              { emoji: "🛒", text: "A shopping list with categories" },
              { emoji: "⏰", text: "A Pomodoro timer for focus" },
              { emoji: "🎨", text: "A color palette generator" },
            ].map((example, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                whileHover={{ x: 5, scale: 1.02 }}
                className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 text-xl">
                  {example.emoji}
                </div>
                <span className="text-sm text-left">{example.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: "spring" }}
            className="mt-8"
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Wand2 className="w-4 h-4" />
              <span>Start typing on the left to begin</span>
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Decoration */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
