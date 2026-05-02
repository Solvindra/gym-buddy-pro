import { useEffect } from "react";
import { Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useSession, useGym } from "@/lib/useStore";
import { logout } from "@/lib/store";
import { initDarkMode } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Dumbbell,
  Settings,
  LogOut,
  UserCog,
  Wallet,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ownerNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/members", label: "Members", icon: Users },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/revenue", label: "Revenue", icon: Wallet },
  { to: "/trainers", label: "Trainers", icon: UserCog },
  { to: "/plans", label: "Plans", icon: Settings },
  { to: "/settings", label: "Appearance", icon: Palette },
];

const trainerNav = [
  { to: "/trainer/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/trainer/members", label: "Members", icon: Users },
];

export function AppShell({ role }: { role: "owner" | "trainer" }) {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    initDarkMode();
  }, []);

  if (!session || !gym) return null;
  const nav = role === "owner" ? ownerNav : trainerNav;
  const trainer =
    session.kind === "trainer" ? gym.trainers.find((t) => t.id === session.trainerId) : null;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{gym.gymName}</div>
              <div className="text-xs text-muted-foreground">ID: {gym.gymId}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const active = path === n.to || path.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <div className="px-3 py-2 text-xs text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{trainer ? trainer.name : `${gym.ownerName} (Owner)`}</span>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Log out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-card border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-semibold truncate">{gym.gymName}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex overflow-x-auto border-t">
          {nav.map((n) => {
            const active = path === n.to || path.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "px-4 py-2 text-xs whitespace-nowrap border-b-2",
                  active ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 min-w-0 pt-28 md:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
