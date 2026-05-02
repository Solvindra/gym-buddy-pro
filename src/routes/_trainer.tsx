import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getSession } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_trainer")({
  beforeLoad: () => {
    const s = getSession();
    if (!s || s.kind !== "trainer") throw redirect({ to: "/login" });
  },
  component: () => <AppShell role="trainer" />,
});

void Outlet;
