import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getSession } from "@/lib/store";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_trainer/trainer/members")({
  beforeLoad: () => {
    const s = getSession();
    if (!s || s.kind !== "trainer") throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});
