import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_owner/plans")({
  beforeLoad: () => { throw redirect({ to: "/settings" }); },
  component: () => null,
});
