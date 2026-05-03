import { createFileRoute } from "@tanstack/react-router";
import { AppearancePanel } from "@/components/AppearancePanel";
import { UserCog, User } from "lucide-react";

export const Route = createFileRoute("/_owner/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-sm text-muted-foreground">Customize the look and feel of your dashboard.</p>
      </div>

      {/* Owner's own appearance */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold leading-tight">Your Appearance</h2>
            <p className="text-xs text-muted-foreground">Only you (the owner) see these settings.</p>
          </div>
        </div>
        <AppearancePanel role="owner" />
      </section>

      <div className="border-t" />

      {/* Trainer appearance — owner controls this */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <UserCog className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold leading-tight">Trainer Appearance</h2>
            <p className="text-xs text-muted-foreground">
              Set the default look for all trainers at your gym. Trainers can also change this themselves.
            </p>
          </div>
        </div>
        <AppearancePanel role="trainer" />
      </section>
    </div>
  );
}
