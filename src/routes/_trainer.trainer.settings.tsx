import { createFileRoute } from "@tanstack/react-router";
import { AppearancePanel } from "@/components/AppearancePanel";

export const Route = createFileRoute("/_trainer/trainer/settings")({
  component: TrainerSettingsPage,
});

function TrainerSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-sm text-muted-foreground">Customize the look and feel of your trainer dashboard.</p>
      </div>
      <AppearancePanel role="trainer" />
    </div>
  );
}
