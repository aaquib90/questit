import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Loader2, Send, User, Sparkles, RotateCcw } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  versionNumber?: number;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  onRevertToVersion?: (versionNumber: number) => void;
}

export function ChatInterface({ messages, onSendMessage, isProcessing, onRevertToVersion }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <Card className="flex flex-col h-[600px] border-2">
      {/* Header */}
      <div className="border-b p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              {isProcessing ? "Thinking..." : "Ready to help improve your tool"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-violet-300" />
              <p className="text-sm">Ask me to improve your tool!</p>
              <p className="text-xs mt-2">Try: "Add a dark mode toggle" or "Make it more colorful"</p>
            </div>
          ) : (
            messages.map((message, idx) => (
              <div key={message.id}>
                {/* Version Marker */}
                {message.versionNumber && (
                  <div className="flex items-center justify-center my-4">
                    <Badge variant="secondary" className="gap-2">
                      <Sparkles className="w-3 h-3" />
                      Version {message.versionNumber} Created
                      {onRevertToVersion && idx < messages.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 ml-2"
                          onClick={() => onRevertToVersion(message.versionNumber!)}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Revert
                        </Button>
                      )}
                    </Badge>
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <div className={`w-full h-full flex items-center justify-center ${
                      message.role === "user" 
                        ? "bg-gradient-to-br from-blue-500 to-cyan-500" 
                        : "bg-gradient-to-br from-violet-500 to-fuchsia-500"
                    }`}>
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </Avatar>

                  {/* Message Content */}
                  <div className={`flex-1 ${message.role === "user" ? "items-end" : "items-start"} flex flex-col max-w-[80%]`}>
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 px-1">
                      {format(message.timestamp, "h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isProcessing && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4 bg-muted/30">
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask for changes or improvements..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-[60px] w-[60px] bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
            disabled={!input.trim() || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded border">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted rounded border">Shift+Enter</kbd> for new line
        </p>
      </form>
    </Card>
  );
}
