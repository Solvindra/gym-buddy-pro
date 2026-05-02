import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const s = getSession();
    if (!s) throw redirect({ to: "/login" });
    if (s.kind === "owner") throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/trainer/attendance" });
  },
  component: () => null,
});
