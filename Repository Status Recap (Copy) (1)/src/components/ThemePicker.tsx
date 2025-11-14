import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const themes = [
  { value: "emerald", label: "Emerald", color: "bg-emerald-500" },
  { value: "sky", label: "Sky", color: "bg-sky-500" },
  { value: "violet", label: "Violet", color: "bg-violet-500" },
  { value: "amber", label: "Amber", color: "bg-amber-500" },
  { value: "rose", label: "Rose", color: "bg-rose-500" },
  { value: "cyan", label: "Cyan", color: "bg-cyan-500" },
  { value: "indigo", label: "Indigo", color: "bg-indigo-500" },
  { value: "lime", label: "Lime", color: "bg-lime-500" },
  { value: "slate", label: "Slate", color: "bg-slate-500" }
];

interface ThemePickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function ThemePicker({ value = "emerald", onChange }: ThemePickerProps) {
  return (
    <div>
      <Label htmlFor="theme">Theme</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="theme" className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {themes.map((theme) => (
            <SelectItem key={theme.value} value={theme.value}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${theme.color}`} />
                {theme.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
