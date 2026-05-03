import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sun, Moon, Check } from "lucide-react";
import {
  type ColorMode,
  type AccentColor,
  type GradientTheme,
  getDarkMode,
  getAccentColor,
  getGradientTheme,
  saveDarkMode,
  saveAccentColor,
  saveGradientTheme,
  ACCENT_COLORS,
  GRADIENT_THEMES,
} from "@/lib/theme";

export const Route = createFileRoute("/_owner/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [colorMode, setColorMode] = useState<ColorMode>(() => getDarkMode());
  const [accent, setAccent] = useState<AccentColor>(() => getAccentColor());
  const [gradient, setGradient] = useState<GradientTheme>(() => getGradientTheme());

  const handleMode = (mode: ColorMode) => {
    setColorMode(mode);
    saveDarkMode(mode);
    toast.success(mode === "dark" ? "Dark mode enabled" : "Light mode enabled");
  };

  const handleAccent = (color: AccentColor) => {
    setAccent(color);
    saveAccentColor(color);
    toast.success(`${ACCENT_COLORS[color].label} theme applied`);
  };

  const handleGradient = (g: GradientTheme) => {
    setGradient(g);
    saveGradientTheme(g);
    toast.success(g === "none" ? "Background gradient removed" : `${GRADIENT_THEMES[g].label} gradient applied`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-sm text-muted-foreground">Customize the look and feel of your dashboard.</p>
      </div>

      {/* Color Mode */}
      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-semibold mb-0.5">Color Mode</h2>
          <p className="text-xs text-muted-foreground">Switch between light and dark theme.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          <button
            onClick={() => handleMode("light")}
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
            onClick={() => handleMode("dark")}
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

      {/* Accent Color */}
      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-semibold mb-0.5">Accent Color</h2>
          <p className="text-xs text-muted-foreground">Sets the primary color for buttons, links, and highlights.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(([key, def]) => (
            <button
              key={key}
              title={def.label}
              onClick={() => handleAccent(key)}
              className="relative h-10 w-10 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: def.swatch,
                boxShadow: accent === key ? `0 0 0 3px white, 0 0 0 5px ${def.swatch}` : undefined,
              }}
            >
              {accent === key && (
                <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Current: <span className="font-medium text-foreground">{ACCENT_COLORS[accent].label}</span>
        </p>
      </Card>

      {/* Background Gradient */}
      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-semibold mb-0.5">Background Style</h2>
          <p className="text-xs text-muted-foreground">
            Choose a soft gradient that blends two colors across the background. Works in both light and dark mode.
          </p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {/* None option */}
          <button
            onClick={() => handleGradient("none")}
            title="None"
            className={`flex flex-col items-center gap-1.5 group`}
          >
            <div
              className={`h-12 w-full rounded-lg border-2 transition-all relative overflow-hidden ${
                gradient === "none" ? "border-primary" : "border-border hover:border-primary/40"
              }`}
              style={{ background: "var(--color-background)" }}
            >
              {gradient === "none" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">None</span>
          </button>

          {/* Gradient options */}
          {(Object.entries(GRADIENT_THEMES).filter(([k]) => k !== "none") as [GradientTheme, typeof GRADIENT_THEMES[GradientTheme]][]).map(([key, def]) => (
            <button
              key={key}
              onClick={() => handleGradient(key)}
              title={def.label}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`h-12 w-full rounded-lg border-2 transition-all relative overflow-hidden ${
                  gradient === key ? "border-primary" : "border-border hover:border-primary/40"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${def.preview[0]} 0%, ${def.preview[1]} 100%)`,
                }}
              >
                {gradient === key && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                    <Check className="h-4 w-4 text-white drop-shadow" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{def.label}</span>
            </button>
          ))}
        </div>
        {gradient !== "none" && (
          <p className="text-xs text-muted-foreground">
            Current gradient: <span className="font-medium text-foreground">{GRADIENT_THEMES[gradient].label}</span>
            {" · "}The gradient adapts to light and dark mode automatically.
          </p>
        )}
      </Card>

      {/* Preview */}
      <Card className="p-5 space-y-3">
        <div>
          <h2 className="font-semibold mb-0.5">Preview</h2>
          <p className="text-xs text-muted-foreground">How your theme colors look.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-9 px-4 rounded-md flex items-center text-sm font-medium text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            Primary Button
          </div>
          <div className="h-9 px-4 rounded-md border border-primary text-primary flex items-center text-sm font-medium">
            Outline
          </div>
          <div className="h-9 px-4 rounded-md bg-muted text-muted-foreground flex items-center text-sm">
            Muted
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(([key, def]) => (
            <div
              key={key}
              className="h-5 w-5 rounded-full"
              style={{ background: def.swatch, opacity: accent === key ? 1 : 0.3 }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
