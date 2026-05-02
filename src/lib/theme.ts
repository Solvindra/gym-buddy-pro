const KEY = "gym_app_theme_bg_v1";
const DARK_KEY = "gym_app_dark_mode_v1";

export type ColorMode = "light" | "dark";

export function getDarkMode(): ColorMode {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(DARK_KEY) as ColorMode) ?? "light";
}

export function saveDarkMode(mode: ColorMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DARK_KEY, mode);
  applyDarkMode(mode);
}

export function applyDarkMode(mode: ColorMode) {
  if (typeof document === "undefined") return;
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function initDarkMode() {
  applyDarkMode(getDarkMode());
}

export type BgTheme = {
  type: "solid" | "gradient";
  color1: string; // hex
  color2?: string; // hex (gradient)
  angle?: number; // gradient angle
};

export const PRESETS: { name: string; theme: BgTheme }[] = [
  { name: "Default White", theme: { type: "solid", color1: "#fafbfc" } },
  { name: "Warm Sand", theme: { type: "solid", color1: "#faf6ef" } },
  { name: "Mint Fresh", theme: { type: "solid", color1: "#eefaf2" } },
  { name: "Sky Blue", theme: { type: "solid", color1: "#eef4ff" } },
  { name: "Lavender", theme: { type: "solid", color1: "#f3eefb" } },
  { name: "Charcoal", theme: { type: "solid", color1: "#1a1d23" } },
  { name: "Sunset Fade", theme: { type: "gradient", color1: "#ffecd2", color2: "#fcb69f", angle: 135 } },
  { name: "Ocean Fade", theme: { type: "gradient", color1: "#e0f2fe", color2: "#c7d2fe", angle: 135 } },
  { name: "Peach Fade", theme: { type: "gradient", color1: "#ffe0ec", color2: "#ffd6a5", angle: 135 } },
  { name: "Aurora", theme: { type: "gradient", color1: "#a1c4fd", color2: "#c2e9fb", angle: 135 } },
  { name: "Midnight", theme: { type: "gradient", color1: "#0f172a", color2: "#1e293b", angle: 135 } },
];

export function getBgTheme(): BgTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as BgTheme) : null;
  } catch {
    return null;
  }
}

export function saveBgTheme(t: BgTheme | null) {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(KEY, JSON.stringify(t));
  else localStorage.removeItem(KEY);
  applyBgTheme(t);
}

function isDark(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.5;
}

export function applyBgTheme(t: BgTheme | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;
  if (!t) {
    root.style.removeProperty("--background");
    if (body) body.style.background = "";
    return;
  }
  const bg =
    t.type === "gradient" && t.color2
      ? `linear-gradient(${t.angle ?? 135}deg, ${t.color1}, ${t.color2})`
      : t.color1;
  // Apply to body so gradients work; also set --background for solid
  if (body) {
    body.style.background = bg;
    body.style.minHeight = "100vh";
  }
  if (t.type === "solid") {
    root.style.setProperty("--background", t.color1);
  } else {
    root.style.removeProperty("--background");
  }
  // Adjust foreground for dark backgrounds
  const dark = isDark(t.color1);
  root.style.setProperty("--foreground", dark ? "#f5f7fa" : "");
}

export function initBgTheme() {
  applyBgTheme(getBgTheme());
}
