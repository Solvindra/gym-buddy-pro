const KEYS = {
  revenue: "gym_app_chart_revenue_v1",
  expense: "gym_app_chart_expense_v1",
  profit:  "gym_app_chart_profit_v1",
  upi:     "gym_app_chart_upi_v1",
  cash:    "gym_app_chart_cash_v1",
} as const;

export type ChartColorKey = keyof typeof KEYS;

export const CHART_COLOR_LABELS: Record<ChartColorKey, string> = {
  revenue: "Revenue",
  expense: "Expense",
  profit:  "Profit",
  upi:     "UPI",
  cash:    "Cash",
};

export const CHART_COLOR_DEFAULTS: Record<ChartColorKey, string> = {
  revenue: "#6366f1",
  expense: "#f97316",
  profit:  "#22c55e",
  upi:     "#3b82f6",
  cash:    "#10b981",
};

export function getChartColors(): Record<ChartColorKey, string> {
  if (typeof window === "undefined") return { ...CHART_COLOR_DEFAULTS };
  const out = {} as Record<ChartColorKey, string>;
  for (const key of Object.keys(KEYS) as ChartColorKey[]) {
    out[key] = localStorage.getItem(KEYS[key]) ?? CHART_COLOR_DEFAULTS[key];
  }
  return out;
}

export function saveChartColor(key: ChartColorKey, color: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS[key], color);
}

export function resetChartColors() {
  if (typeof window === "undefined") return;
  for (const key of Object.keys(KEYS) as ChartColorKey[]) {
    localStorage.removeItem(KEYS[key]);
  }
}
