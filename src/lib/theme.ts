// ── Owner theme keys ──────────────────────────────────────────────────────────
const DARK_KEY = "gym_app_dark_mode_v1";
const ACCENT_KEY = "gym_app_accent_v1";
const GRADIENT_KEY = "gym_app_gradient_v1";
const CUSTOM_GRADIENT_KEY = "gym_app_custom_gradient_v1";

// ── Trainer theme keys ────────────────────────────────────────────────────────
const T_DARK_KEY = "gym_app_trainer_dark_mode_v1";
const T_ACCENT_KEY = "gym_app_trainer_accent_v1";
const T_GRADIENT_KEY = "gym_app_trainer_gradient_v1";
const T_CUSTOM_GRADIENT_KEY = "gym_app_trainer_custom_gradient_v1";

export type ColorMode = "light" | "dark";
export type AccentColor = "blue" | "purple" | "green" | "red" | "orange" | "pink" | "teal";
export type GradientTheme =
  | "none"
  | "ocean"
  | "sunset"
  | "forest"
  | "ember"
  | "lime"
  | "aurora"
  | "midnight"
  | "custom";

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

export const GRADIENT_THEMES: Record<Exclude<GradientTheme, "custom">, GradientDef> = {
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

export type CustomGradient = { from: string; to: string };

// ── Session role detection ────────────────────────────────────────────────────
function detectRole(): "owner" | "trainer" {
  if (typeof window === "undefined") return "owner";
  try {
    const raw =
      localStorage.getItem("gym_app_session_v1") ??
      sessionStorage.getItem("gym_app_session_v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind === "trainer") return "trainer";
  } catch {}
  return "owner";
}

// ── Owner getters ─────────────────────────────────────────────────────────────
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
export function getCustomGradient(): CustomGradient {
  if (typeof window === "undefined") return { from: "#6366f1", to: "#06b6d4" };
  try {
    const s = localStorage.getItem(CUSTOM_GRADIENT_KEY);
    if (s) return JSON.parse(s) as CustomGradient;
  } catch {}
  return { from: "#6366f1", to: "#06b6d4" };
}

// ── Trainer getters ───────────────────────────────────────────────────────────
export function getTrainerDarkMode(): ColorMode {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(T_DARK_KEY) as ColorMode) ?? "light";
}
export function getTrainerAccentColor(): AccentColor {
  if (typeof window === "undefined") return "green";
  return (localStorage.getItem(T_ACCENT_KEY) as AccentColor) ?? "green";
}
export function getTrainerGradientTheme(): GradientTheme {
  if (typeof window === "undefined") return "none";
  return (localStorage.getItem(T_GRADIENT_KEY) as GradientTheme) ?? "none";
}
export function getTrainerCustomGradient(): CustomGradient {
  if (typeof window === "undefined") return { from: "#22c55e", to: "#06b6d4" };
  try {
    const s = localStorage.getItem(T_CUSTOM_GRADIENT_KEY);
    if (s) return JSON.parse(s) as CustomGradient;
  } catch {}
  return { from: "#22c55e", to: "#06b6d4" };
}

// ── Owner savers ──────────────────────────────────────────────────────────────
export function saveDarkMode(mode: ColorMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DARK_KEY, mode);
  applyDarkMode(mode);
  applyThemeStyles(getAccentColor(), getGradientTheme(), mode, getCustomGradient());
}
export function saveAccentColor(accent: AccentColor) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCENT_KEY, accent);
  applyThemeStyles(accent, getGradientTheme(), getDarkMode(), getCustomGradient());
}
export function saveGradientTheme(gradient: GradientTheme, custom?: CustomGradient) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GRADIENT_KEY, gradient);
  const c = custom ?? getCustomGradient();
  if (custom) localStorage.setItem(CUSTOM_GRADIENT_KEY, JSON.stringify(custom));
  applyThemeStyles(getAccentColor(), gradient, getDarkMode(), c);
}
export function saveCustomGradient(custom: CustomGradient) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_GRADIENT_KEY, JSON.stringify(custom));
  applyThemeStyles(getAccentColor(), "custom", getDarkMode(), custom);
}

// ── Trainer savers ────────────────────────────────────────────────────────────
export function saveTrainerDarkMode(mode: ColorMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(T_DARK_KEY, mode);
  if (detectRole() === "trainer") {
    applyDarkMode(mode);
    applyThemeStyles(getTrainerAccentColor(), getTrainerGradientTheme(), mode, getTrainerCustomGradient());
  }
}
export function saveTrainerAccentColor(accent: AccentColor) {
  if (typeof window === "undefined") return;
  localStorage.setItem(T_ACCENT_KEY, accent);
  if (detectRole() === "trainer") {
    applyThemeStyles(accent, getTrainerGradientTheme(), getTrainerDarkMode(), getTrainerCustomGradient());
  }
}
export function saveTrainerGradientTheme(gradient: GradientTheme, custom?: CustomGradient) {
  if (typeof window === "undefined") return;
  localStorage.setItem(T_GRADIENT_KEY, gradient);
  const c = custom ?? getTrainerCustomGradient();
  if (custom) localStorage.setItem(T_CUSTOM_GRADIENT_KEY, JSON.stringify(custom));
  if (detectRole() === "trainer") {
    applyThemeStyles(getTrainerAccentColor(), gradient, getTrainerDarkMode(), c);
  }
}
export function saveTrainerCustomGradient(custom: CustomGradient) {
  if (typeof window === "undefined") return;
  localStorage.setItem(T_CUSTOM_GRADIENT_KEY, JSON.stringify(custom));
  if (detectRole() === "trainer") {
    applyThemeStyles(getTrainerAccentColor(), "custom", getTrainerDarkMode(), custom);
  }
}

// ── Core style application ────────────────────────────────────────────────────
export function applyDarkMode(mode: ColorMode) {
  if (typeof document === "undefined") return;
  if (mode === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}

export function applyThemeStyles(
  accent: AccentColor,
  gradient: GradientTheme,
  mode: ColorMode,
  custom: CustomGradient = { from: "#6366f1", to: "#06b6d4" }
) {
  if (typeof document === "undefined") return;

  const ac = ACCENT_COLORS[accent];
  const hasGradient = gradient !== "none";

  let from: string;
  let to: string;

  if (gradient === "custom") {
    from = custom.from;
    to = custom.to;
  } else if (gradient !== "none") {
    const gr = GRADIENT_THEMES[gradient];
    [from, to] = mode === "dark" ? gr.dark : gr.light;
  } else {
    from = "transparent";
    to = "transparent";
  }

  if (hasGradient) document.documentElement.classList.add("gradient-active");
  else document.documentElement.classList.remove("gradient-active");

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
      --gradient-subtle: transparent;
      --gfrom: ${from};
      --gto: ${to};
    }
    html.gradient-active body,
    html.gradient-active .bg-background {
      background-color: transparent !important;
    }
    /* ── Light mode frosted glass ── */
    html.gradient-active .bg-sidebar {
      background-color: oklch(0.97 0.003 250 / 0.65) !important;
      backdrop-filter: blur(20px) saturate(1.6);
      -webkit-backdrop-filter: blur(20px) saturate(1.6);
      box-shadow:
        4px 0 32px -4px color-mix(in srgb, var(--gfrom) 30%, transparent),
        inset -1px 0 0 color-mix(in srgb, var(--gfrom) 18%, transparent);
    }
    html.gradient-active .bg-card {
      background-color: oklch(1 0 0 / 0.60) !important;
      backdrop-filter: blur(16px) saturate(1.4);
      -webkit-backdrop-filter: blur(16px) saturate(1.4);
      box-shadow:
        0 4px 24px -6px color-mix(in srgb, var(--gfrom) 35%, transparent),
        0 1px 4px -2px color-mix(in srgb, var(--gto) 20%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--gfrom) 15%, transparent);
    }
    /* ── Dark mode frosted glass ── */
    html.gradient-active.dark .bg-sidebar {
      background-color: oklch(0.13 0.02 250 / 0.65) !important;
      backdrop-filter: blur(20px) saturate(1.8);
      -webkit-backdrop-filter: blur(20px) saturate(1.8);
      box-shadow:
        4px 0 40px -4px color-mix(in srgb, var(--gfrom) 40%, transparent),
        inset -1px 0 0 color-mix(in srgb, var(--gfrom) 22%, transparent);
    }
    html.gradient-active.dark .bg-card {
      background-color: oklch(0.16 0.02 250 / 0.58) !important;
      backdrop-filter: blur(16px) saturate(1.6);
      -webkit-backdrop-filter: blur(16px) saturate(1.6);
      box-shadow:
        0 4px 32px -6px color-mix(in srgb, var(--gfrom) 45%, transparent),
        0 1px 8px -2px color-mix(in srgb, var(--gto) 28%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--gfrom) 18%, transparent);
    }
    /* ── Mobile: remove backdrop-filter entirely ── */
    @media (max-width: 768px) {
      html.gradient-active {
        background-attachment: scroll;
      }
      html.gradient-active .bg-sidebar,
      html.gradient-active.dark .bg-sidebar {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        background-color: oklch(0.13 0.02 250 / 0.82) !important;
      }
      html.gradient-active:not(.dark) .bg-sidebar {
        background-color: oklch(0.97 0.003 250 / 0.88) !important;
      }
      html.gradient-active .bg-card,
      html.gradient-active.dark .bg-card {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        background-color: oklch(0.16 0.02 250 / 0.80) !important;
      }
      html.gradient-active:not(.dark) .bg-card {
        background-color: oklch(1 0 0 / 0.82) !important;
      }
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

// ── Init — auto-detects role and applies the correct theme ───────────────────
export function initDarkMode() {
  const role = detectRole();
  if (role === "trainer") {
    const mode = getTrainerDarkMode();
    applyDarkMode(mode);
    applyThemeStyles(getTrainerAccentColor(), getTrainerGradientTheme(), mode, getTrainerCustomGradient());
  } else {
    const mode = getDarkMode();
    applyDarkMode(mode);
    applyThemeStyles(getAccentColor(), getGradientTheme(), mode, getCustomGradient());
  }
}
