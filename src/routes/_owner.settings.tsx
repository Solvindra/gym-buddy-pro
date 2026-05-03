import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sun, Moon, Check, Shuffle } from "lucide-react";
import {
  type ColorMode,
  type AccentColor,
  type GradientTheme,
  type CustomGradient,
  getDarkMode,
  getAccentColor,
  getGradientTheme,
  getCustomGradient,
  saveDarkMode,
  saveAccentColor,
  saveGradientTheme,
  saveCustomGradient,
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
  const [custom, setCustom] = useState<CustomGradient>(() => getCustomGradient());

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

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
    if (g === "custom") {
      saveGradientTheme("custom", custom);
    } else {
      saveGradientTheme(g);
      if (g !== "none") toast.success(`${GRADIENT_THEMES[g].label} gradient applied`);
      else toast.success("Background gradient removed");
    }
  };

  const handleCustomColor = (key: "from" | "to", value: string) => {
    const updated = { ...custom, [key]: value };
    setCustom(updated);
    setGradient("custom");
    saveCustomGradient(updated);
  };

  const randomizeCustom = () => {
    const randomHex = () =>
      "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
    const updated = { from: randomHex(), to: randomHex() };
    setCustom(updated);
    setGradient("custom");
    saveCustomGradient(updated);
    toast.success("Random gradient applied!");
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
              className="relative h-10 w-10 rounded-full transition-transform hover:scale-110 focus:outline-none"
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
      <Card className="p-5 space-y-5">
        <div>
          <h2 className="font-semibold mb-0.5">Background Style</h2>
          <p className="text-xs text-muted-foreground">
            Pick a preset gradient or build your own by blending two colors softly across the background.
          </p>
        </div>

        {/* Preset swatches */}
        <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
          {/* None */}
          <button onClick={() => handleGradient("none")} title="None" className="flex flex-col items-center gap-1.5">
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

          {/* Preset gradients */}
          {(Object.entries(GRADIENT_THEMES).filter(([k]) => k !== "none") as [Exclude<GradientTheme, "none" | "custom">, typeof GRADIENT_THEMES[Exclude<GradientTheme, "none" | "custom">]][]).map(([key, def]) => (
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

        {/* Custom gradient builder */}
        <div className={`rounded-xl border-2 p-4 transition-all space-y-4 ${gradient === "custom" ? "border-primary bg-primary/5" : "border-border"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Custom Gradient</p>
              <p className="text-xs text-muted-foreground">Pick any two colors to blend softly across the background.</p>
            </div>
            <button
              onClick={randomizeCustom}
              title="Randomize"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
            >
              <Shuffle className="h-3.5 w-3.5" />
              Random
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Color A */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => fromRef.current?.click()}
                className="h-14 w-14 rounded-xl border-2 border-border shadow-sm transition-transform hover:scale-105 relative overflow-hidden"
                style={{ background: custom.from }}
                title="Pick color A"
              />
              <span className="text-[10px] text-muted-foreground font-mono">{custom.from}</span>
              <input
                ref={fromRef}
                type="color"
                value={custom.from}
                onChange={(e) => handleCustomColor("from", e.target.value)}
                className="sr-only"
              />
            </div>

            {/* Gradient preview bar */}
            <div className="flex-1 flex flex-col gap-1.5">
              <div
                className="h-14 rounded-xl border border-border shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${custom.from} 0%, ${custom.to} 100%)`,
                }}
              />
              <button
                onClick={() => handleGradient("custom")}
                className={`w-full py-1 rounded-md text-xs font-medium transition-all ${
                  gradient === "custom"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {gradient === "custom" ? "✓ Applied" : "Apply this gradient"}
              </button>
            </div>

            {/* Color B */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => toRef.current?.click()}
                className="h-14 w-14 rounded-xl border-2 border-border shadow-sm transition-transform hover:scale-105 relative overflow-hidden"
                style={{ background: custom.to }}
                title="Pick color B"
              />
              <span className="text-[10px] text-muted-foreground font-mono">{custom.to}</span>
              <input
                ref={toRef}
                type="color"
                value={custom.to}
                onChange={(e) => handleCustomColor("to", e.target.value)}
                className="sr-only"
              />
            </div>
          </div>
        </div>

        {gradient !== "none" && (
          <p className="text-xs text-muted-foreground">
            {gradient === "custom"
              ? `Custom gradient: ${custom.from} → ${custom.to}`
              : `Preset: ${GRADIENT_THEMES[gradient as Exclude<GradientTheme, "none" | "custom">]?.label} · Adapts to light and dark mode automatically.`}
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
              style={{ background: def.swatch, opacity: accent === key ? 1 : 0.25 }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
