import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sun, Moon, Monitor } from "lucide-react";

interface ColorModePickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function ColorModePicker({ value = "system", onChange }: ColorModePickerProps) {
  const modes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor }
  ];

  return (
    <div>
      <Label htmlFor="colorMode">Color Mode</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="colorMode" className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <SelectItem key={mode.value} value={mode.value}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {mode.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
