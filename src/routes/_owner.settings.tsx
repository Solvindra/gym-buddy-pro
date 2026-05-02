import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sun, Moon } from "lucide-react";
import { type ColorMode, getDarkMode, saveDarkMode } from "@/lib/theme";

export const Route = createFileRoute("/_owner/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [colorMode, setColorMode] = useState<ColorMode>(() => getDarkMode());

  const toggleMode = (mode: ColorMode) => {
    setColorMode(mode);
    saveDarkMode(mode);
    toast.success(mode === "dark" ? "Dark mode enabled" : "Light mode enabled");
  };

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
    </div>
  );
}
