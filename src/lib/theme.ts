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
