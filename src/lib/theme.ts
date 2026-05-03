const DARK_KEY = "gym_app_dark_mode_v1";
const ACCENT_KEY = "gym_app_accent_v1";
const GRADIENT_KEY = "gym_app_gradient_v1";

export type ColorMode = "light" | "dark";
export type AccentColor = "blue" | "purple" | "green" | "red" | "orange" | "pink" | "teal";
export type GradientTheme = "none" | "ocean" | "sunset" | "forest" | "ember" | "lime" | "aurora" | "midnight";

type AccentDef = {
  label: string;
  swatch: string;
  light: { primary: string; glow: string };
  dark: { primary: string; glow: string };
};

export const ACCENT_COLORS: Record<AccentColor, AccentDef> = {
  blue: {
    label: "Blue",
    swatch: "oklch(0.55 0.18 255)",
    light: { primary: "oklch(0.55 0.18 255)", glow: "oklch(0.68 0.16 255)" },
    dark: { primary: "oklch(0.68 0.16 255)", glow: "oklch(0.78 0.14 255)" },
  },
  purple: {
    label: "Purple",
    swatch: "oklch(0.52 0.22 290)",
    light: { primary: "oklch(0.52 0.22 290)", glow: "oklch(0.66 0.20 290)" },
    dark: { primary: "oklch(0.66 0.20 290)", glow: "oklch(0.76 0.18 290)" },
  },
  green: {
    label: "Green",
    swatch: "oklch(0.52 0.20 145)",
    light: { primary: "oklch(0.52 0.20 145)", glow: "oklch(0.65 0.18 145)" },
    dark: { primary: "oklch(0.65 0.18 145)", glow: "oklch(0.75 0.16 145)" },
  },
  red: {
    label: "Red",
    swatch: "oklch(0.52 0.24 15)",
    light: { primary: "oklch(0.52 0.24 15)", glow: "oklch(0.65 0.22 15)" },
    dark: { primary: "oklch(0.65 0.22 15)", glow: "oklch(0.75 0.20 15)" },
  },
  orange: {
    label: "Orange",
    swatch: "oklch(0.64 0.20 55)",
    light: { primary: "oklch(0.64 0.20 55)", glow: "oklch(0.74 0.18 55)" },
    dark: { primary: "oklch(0.74 0.18 55)", glow: "oklch(0.82 0.16 55)" },
  },
  pink: {
    label: "Pink",
    swatch: "oklch(0.58 0.24 340)",
    light: { primary: "oklch(0.58 0.24 340)", glow: "oklch(0.70 0.22 340)" },
    dark: { primary: "oklch(0.70 0.22 340)", glow: "oklch(0.80 0.20 340)" },
  },
  teal: {
    label: "Teal",
    swatch: "oklch(0.55 0.16 185)",
    light: { primary: "oklch(0.55 0.16 185)", glow: "oklch(0.68 0.14 185)" },
    dark: { primary: "oklch(0.68 0.14 185)", glow: "oklch(0.78 0.12 185)" },
  },
};

type GradientDef = {
  label: string;
  preview: [string, string];
  light: [string, string];
  dark: [string, string];
};

export const GRADIENT_THEMES: Record<GradientTheme, GradientDef> = {
  none: {
    label: "None",
    preview: ["transparent", "transparent"],
    light: ["transparent", "transparent"],
    dark: ["transparent", "transparent"],
  },
  ocean: {
    label: "Ocean",
    preview: ["#3b82f6", "#06b6d4"],
    light: ["oklch(0.93 0.05 235)", "oklch(0.91 0.06 185)"],
    dark: ["oklch(0.20 0.07 235)", "oklch(0.18 0.07 185)"],
  },
  sunset: {
    label: "Sunset",
    preview: ["#f97316", "#ec4899"],
    light: ["oklch(0.96 0.05 55)", "oklch(0.93 0.06 340)"],
    dark: ["oklch(0.22 0.09 35)", "oklch(0.18 0.07 330)"],
  },
  forest: {
    label: "Forest",
    preview: ["#22c55e", "#3b82f6"],
    light: ["oklch(0.93 0.06 145)", "oklch(0.92 0.05 225)"],
    dark: ["oklch(0.20 0.08 145)", "oklch(0.18 0.06 225)"],
  },
  ember: {
    label: "Ember",
    preview: ["#ef4444", "#f97316"],
    light: ["oklch(0.96 0.05 15)", "oklch(0.95 0.05 55)"],
    dark: ["oklch(0.22 0.09 15)", "oklch(0.20 0.08 50)"],
  },
  lime: {
    label: "Lime",
    preview: ["#eab308", "#22c55e"],
    light: ["oklch(0.96 0.06 90)", "oklch(0.93 0.06 145)"],
    dark: ["oklch(0.22 0.08 90)", "oklch(0.20 0.07 145)"],
  },
  aurora: {
    label: "Aurora",
    preview: ["#a855f7", "#06b6d4"],
    light: ["oklch(0.92 0.06 290)", "oklch(0.91 0.06 185)"],
    dark: ["oklch(0.20 0.08 290)", "oklch(0.18 0.07 185)"],
  },
  midnight: {
    label: "Midnight",
    preview: ["#1e3a8a", "#4c1d95"],
    light: ["oklch(0.92 0.06 255)", "oklch(0.90 0.06 295)"],
    dark: ["oklch(0.16 0.07 255)", "oklch(0.14 0.06 295)"],
  },
};

export function getDarkMode(): ColorMode {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(DARK_KEY) as ColorMode) ?? "light";
}

export function getAccentColor(): AccentColor {
  if (typeof window === "undefined") return "blue";
  return (localStorage.getItem(ACCENT_KEY) as AccentColor) ?? "blue";
}

export function getGradientTheme(): GradientTheme {
  if (typeof window === "undefined") return "none";
  return (localStorage.getItem(GRADIENT_KEY) as GradientTheme) ?? "none";
}

export function saveDarkMode(mode: ColorMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DARK_KEY, mode);
  applyDarkMode(mode);
  applyThemeStyles(getAccentColor(), getGradientTheme(), mode);
}

export function saveAccentColor(accent: AccentColor) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCENT_KEY, accent);
  applyThemeStyles(accent, getGradientTheme(), getDarkMode());
}

export function saveGradientTheme(gradient: GradientTheme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GRADIENT_KEY, gradient);
  applyThemeStyles(getAccentColor(), gradient, getDarkMode());
}

export function applyDarkMode(mode: ColorMode) {
  if (typeof document === "undefined") return;
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function applyThemeStyles(accent: AccentColor, gradient: GradientTheme, mode: ColorMode) {
  if (typeof document === "undefined") return;

  const ac = ACCENT_COLORS[accent];
  const gr = GRADIENT_THEMES[gradient];
  const [from, to] = mode === "dark" ? gr.dark : gr.light;
  const hasGradient = gradient !== "none";

  if (hasGradient) {
    document.documentElement.classList.add("gradient-active");
  } else {
    document.documentElement.classList.remove("gradient-active");
  }

  const gradientBg = hasGradient
    ? `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
    : "none";

  const css = `
    :root {
      --primary: ${ac.light.primary};
      --primary-glow: ${ac.light.glow};
      --ring: ${ac.light.primary};
      --sidebar-primary: ${ac.light.primary};
      --sidebar-ring: ${ac.light.primary};
      --gradient-primary: linear-gradient(135deg, ${ac.light.primary}, ${ac.light.glow});
    }
    .dark {
      --primary: ${ac.dark.primary};
      --primary-glow: ${ac.dark.glow};
      --ring: ${ac.dark.primary};
      --sidebar-primary: ${ac.dark.primary};
      --sidebar-ring: ${ac.dark.primary};
      --gradient-primary: linear-gradient(135deg, ${ac.dark.primary}, ${ac.dark.glow});
    }
    html.gradient-active {
      background: ${gradientBg};
      background-attachment: fixed;
      min-height: 100vh;
    }
    html.gradient-active body,
    html.gradient-active .bg-background {
      background-color: transparent !important;
    }
    html.gradient-active {
      --gradient-subtle: transparent;
    }
  `;

  let el = document.getElementById("gym-theme") as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = "gym-theme";
    document.head.appendChild(el);
  }
  el.textContent = css;
}

export function initDarkMode() {
  const mode = getDarkMode();
  applyDarkMode(mode);
  applyThemeStyles(getAccentColor(), getGradientTheme(), mode);
}
