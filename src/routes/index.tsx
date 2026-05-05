import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const welcomed = localStorage.getItem("ft_welcomed");
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (!welcomed && !standalone) {
      throw redirect({ to: "/welcome" });
    }

    const s = getSession();
    if (!s) throw redirect({ to: "/login" });
    if (s.kind === "owner") throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/trainer/attendance" });
  },
  component: () => null,
});
