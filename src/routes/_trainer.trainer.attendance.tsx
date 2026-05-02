import { createFileRoute } from "@tanstack/react-router";
import { AttendancePage } from "./_owner.attendance";

export const Route = createFileRoute("/_trainer/trainer/attendance")({
  component: () => <AttendancePage role="trainer" />,
});
