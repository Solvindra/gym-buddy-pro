import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import {
  type ChartColorKey,
  CHART_COLOR_LABELS,
  CHART_COLOR_DEFAULTS,
  getChartColors,
  saveChartColor,
  resetChartColors,
} from "@/lib/chartColors";

const COLOR_KEYS: ChartColorKey[] = ["revenue", "expense", "profit", "upi", "cash"];

export function ChartColorsCard() {
  const [colors, setColors] = useState(() => getChartColors());
  const refs = useRef<Record<ChartColorKey, HTMLInputElement | null>>({
    revenue: null, expense: null, profit: null, upi: null, cash: null,
  });

  const handleChange = (key: ChartColorKey, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    saveChartColor(key, value);
  };

  const handleReset = () => {
    resetChartColors();
    setColors({ ...CHART_COLOR_DEFAULTS });
    toast.success("Chart colors reset to defaults");
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-0.5">Chart Colors</h3>
          <p className="text-xs text-muted-foreground">
            Customize bar colors used in revenue graphs.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {COLOR_KEYS.map((key) => (
          <div key={key} className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">
              {CHART_COLOR_LABELS[key]}
            </p>
            <button
              onClick={() => refs.current[key]?.click()}
              className="flex items-center gap-2.5 w-full rounded-lg border border-border px-3 py-2 hover:bg-muted transition-colors"
            >
              <span
                className="h-6 w-6 rounded-md border border-border/60 shadow-sm shrink-0"
                style={{ background: colors[key] }}
              />
              <span className="text-xs font-mono text-muted-foreground truncate">
                {colors[key]}
              </span>
              <input
                ref={(el) => { refs.current[key] = el; }}
                type="color"
                value={colors[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="sr-only"
              />
            </button>
          </div>
        ))}
      </div>

      {/* Live preview bar */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Preview</p>
        <div className="flex gap-1 h-10 rounded-lg overflow-hidden border border-border">
          {COLOR_KEYS.map((key) => (
            <div
              key={key}
              className="flex-1 flex items-end justify-center pb-1 relative group"
              style={{ background: colors[key] + "33" }}
            >
              <div
                className="w-full transition-all"
                style={{
                  background: colors[key],
                  height: key === "revenue" ? "80%"
                    : key === "expense" ? "55%"
                    : key === "profit" ? "65%"
                    : key === "upi" ? "70%"
                    : "45%",
                }}
              />
              <span className="absolute bottom-full mb-1 text-[9px] font-medium bg-popover border border-border rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
                {CHART_COLOR_LABELS[key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
