import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getSession } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_owner")({
  beforeLoad: () => {
    const s = getSession();
    if (!s || s.kind !== "owner") throw redirect({ to: "/login" });
  },
  component: () => <AppShell role="owner" />,
});

// Suppress unused import warning
void Outlet;
