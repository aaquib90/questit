import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loader2, RefreshCw } from "lucide-react";

interface IterationInputProps {
  onIterate: (instruction: string) => void;
  isIterating: boolean;
}

export function IterationInput({ onIterate, isIterating }: IterationInputProps) {
  const [instruction, setInstruction] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim() && !isIterating) {
      onIterate(instruction);
      setInstruction("");
    }
  };

  const exampleInstructions = [
    "Add a dark mode toggle",
    "Make it more colorful",
    "Add input validation",
    "Improve the layout",
    "Add export functionality"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refine Your Tool</CardTitle>
        <CardDescription>Make changes with follow-up instructions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="iteration">What would you like to change?</Label>
            <Textarea
              id="iteration"
              placeholder="E.g., 'Add a dark mode toggle' or 'Make the buttons larger'"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="min-h-[80px] mt-2"
              disabled={isIterating}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {exampleInstructions.map((example, idx) => (
              <Button
                key={idx}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInstruction(example)}
                disabled={isIterating}
              >
                {example}
              </Button>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={!instruction.trim() || isIterating}>
            {isIterating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Tool
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
