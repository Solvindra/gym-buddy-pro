import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Sun, Moon } from "lucide-react";
import {
  type BgTheme,
  type ColorMode,
  PRESETS,
  getBgTheme,
  saveBgTheme,
  applyBgTheme,
  getDarkMode,
  saveDarkMode,
} from "@/lib/theme";

export const Route = createFileRoute("/_owner/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [colorMode, setColorMode] = useState<ColorMode>(() => getDarkMode());
  const [theme, setTheme] = useState<BgTheme>(
    () => getBgTheme() ?? { type: "solid", color1: "#fafbfc" }
  );

  const toggleMode = (mode: ColorMode) => {
    setColorMode(mode);
    saveDarkMode(mode);
    toast.success(mode === "dark" ? "Dark mode enabled" : "Light mode enabled");
  };

  // Live preview
  useEffect(() => {
    applyBgTheme(theme);
  }, [theme]);

  // Restore saved on unmount if not saved
  useEffect(() => {
    return () => {
      applyBgTheme(getBgTheme());
    };
  }, []);

  const save = () => {
    saveBgTheme(theme);
    toast.success("Background updated");
  };

  const reset = () => {
    saveBgTheme(null);
    setTheme({ type: "solid", color1: "#fafbfc" });
    toast.success("Reset to default");
  };

  const previewBg =
    theme.type === "gradient" && theme.color2
      ? `linear-gradient(${theme.angle ?? 135}deg, ${theme.color1}, ${theme.color2})`
      : theme.color1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize the look of your dashboard.</p>
      </div>

      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-semibold mb-1">Color Mode</h2>
          <p className="text-xs text-muted-foreground">Switch between light and dark theme.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          <button
            onClick={() => toggleMode("light")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              colorMode === "light"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/40"
            }`}
          >
            <Sun className="h-6 w-6" />
            <span className="text-sm font-medium">Light</span>
          </button>
          <button
            onClick={() => toggleMode("dark")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              colorMode === "dark"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/40"
            }`}
          >
            <Moon className="h-6 w-6" />
            <span className="text-sm font-medium">Dark</span>
          </button>
        </div>
      </Card>

      <Card className="p-5 space-y-5">
        <div>
          <h2 className="font-semibold mb-1">Background Color</h2>
          <p className="text-xs text-muted-foreground">
            Pick a solid color, a gradient fade, or a preset.
          </p>
        </div>

        <div>
          <Label className="mb-2 block">Type</Label>
          <div className="flex gap-2">
            <Button
              variant={theme.type === "solid" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme({ ...theme, type: "solid" })}
            >
              Solid
            </Button>
            <Button
              variant={theme.type === "gradient" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setTheme({
                  ...theme,
                  type: "gradient",
                  color2: theme.color2 ?? "#c7d2fe",
                  angle: theme.angle ?? 135,
                })
              }
            >
              Gradient Fade
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="c1" className="mb-2 block">
              {theme.type === "gradient" ? "Color 1" : "Color"}
            </Label>
            <div className="flex gap-2 items-center">
              <input
                id="c1"
                type="color"
                value={theme.color1}
                onChange={(e) => setTheme({ ...theme, color1: e.target.value })}
                className="h-10 w-14 rounded border cursor-pointer"
              />
              <Input
                value={theme.color1}
                onChange={(e) => setTheme({ ...theme, color1: e.target.value })}
              />
            </div>
          </div>

          {theme.type === "gradient" && (
            <div>
              <Label htmlFor="c2" className="mb-2 block">Color 2</Label>
              <div className="flex gap-2 items-center">
                <input
                  id="c2"
                  type="color"
                  value={theme.color2 ?? "#ffffff"}
                  onChange={(e) => setTheme({ ...theme, color2: e.target.value })}
                  className="h-10 w-14 rounded border cursor-pointer"
                />
                <Input
                  value={theme.color2 ?? ""}
                  onChange={(e) => setTheme({ ...theme, color2: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {theme.type === "gradient" && (
          <div>
            <Label className="mb-2 block">Angle: {theme.angle ?? 135}°</Label>
            <Slider
              value={[theme.angle ?? 135]}
              min={0}
              max={360}
              step={5}
              onValueChange={(v) => setTheme({ ...theme, angle: v[0] })}
            />
          </div>
        )}

        <div>
          <Label className="mb-2 block">Preview</Label>
          <div
            className="h-24 rounded-lg border"
            style={{ background: previewBg }}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={save}>Save</Button>
          <Button variant="outline" onClick={reset}>Reset to Default</Button>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="font-semibold">Presets</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PRESETS.map((p) => {
            const bg =
              p.theme.type === "gradient" && p.theme.color2
                ? `linear-gradient(${p.theme.angle ?? 135}deg, ${p.theme.color1}, ${p.theme.color2})`
                : p.theme.color1;
            return (
              <button
                key={p.name}
                onClick={() => setTheme(p.theme)}
                className="text-left rounded-lg border overflow-hidden hover:ring-2 hover:ring-primary transition"
              >
                <div className="h-16" style={{ background: bg }} />
                <div className="px-3 py-2 text-sm font-medium">{p.name}</div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
