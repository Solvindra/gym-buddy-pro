import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useSession, useGym } from "@/lib/useStore";
import { logout } from "@/lib/store";
import { initDarkMode } from "@/lib/theme";
import { toast } from "sonner";
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
  Menu,
  X,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ownerNav = [
  { to: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard, color: "#6366f1", bg: "#6366f120" },
  { to: "/members",      label: "Members",      icon: Users,            color: "#3b82f6", bg: "#3b82f620" },
  { to: "/attendance",   label: "Attendance",   icon: ClipboardCheck,   color: "#22c55e", bg: "#22c55e20" },
  { to: "/revenue",      label: "Revenue",      icon: Wallet,           color: "#f59e0b", bg: "#f59e0b20" },
  { to: "/trainers",     label: "Trainers",     icon: UserCog,          color: "#f97316", bg: "#f9731620" },
  { to: "/settings",     label: "Settings",     icon: Settings,         color: "#a855f7", bg: "#a855f720" },
  { to: "/subscription", label: "Subscription", icon: Crown,            color: "#f59e0b", bg: "#f59e0b20" },
];

const trainerNav = [
  { to: "/trainer/attendance", label: "Attendance", icon: ClipboardCheck, color: "#22c55e", bg: "#22c55e20" },
  { to: "/trainer/members",    label: "Members",    icon: Users,           color: "#3b82f6", bg: "#3b82f620" },
  { to: "/trainer/settings",   label: "Appearance", icon: Palette,         color: "#a855f7", bg: "#a855f720" },
];

export function AppShell({ role }: { role: "owner" | "trainer" }) {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    initDarkMode();
    const onStorageFull = () => {
      toast.error("Storage full! Remove member photos to free up space.", { duration: 6000 });
    };
    window.addEventListener("gym-storage-full", onStorageFull);
    return () => window.removeEventListener("gym-storage-full", onStorageFull);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  if (!session || !gym) return null;
  const nav = role === "owner" ? ownerNav : trainerNav;
  const trainer = session.kind === "trainer" ? gym.trainers.find((t) => t.id === session.trainerId) : null;
  const displayName = trainer ? trainer.name : gym.ownerName;
  const displayRole = trainer ? "Trainer" : "Owner";

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40 border-r bg-sidebar text-sidebar-foreground shadow-xl">

        {/* Brand */}
        <div className="px-5 py-5 border-b">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-bold truncate leading-tight">{gym.gymName}</div>
              <div className="text-[11px] text-muted-foreground font-mono">ID: {gym.gymId}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((n) => {
            const active = path === n.to || path.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <span
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                  style={{
                    background: active ? n.color + "30" : n.bg,
                    color: n.color,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {n.label}
                {active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ background: n.color }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/50">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{displayName}</div>
              <div className="text-[11px] text-muted-foreground">{displayRole}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <span className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <LogOut className="h-4 w-4" />
            </span>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile: slide-out drawer ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Drawer */}
          <aside
            className="relative w-72 h-full bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold truncate leading-tight">{gym.gymName}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">ID: {gym.gymId}</div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {nav.map((n) => {
                const active = path === n.to || path.startsWith(n.to + "/");
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    )}
                  >
                    <span
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: active ? n.color + "30" : n.bg, color: n.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {n.label}
                    {active && (
                      <span
                        className="ml-auto h-2 w-2 rounded-full"
                        style={{ background: n.color }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/50">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{displayName}</div>
                  <div className="text-[11px] text-muted-foreground">{displayRole}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <span className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                  <LogOut className="h-4 w-4" />
                </span>
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-card border-b h-14 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Dumbbell className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold truncate text-sm">{gym.gymName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t">
        <nav className="flex items-center justify-around px-1 py-1.5">
          {nav.map((n) => {
            const active = path === n.to || path.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className="flex flex-col items-center gap-0.5 px-1 py-0.5 min-w-0"
              >
                <span
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: active ? n.color + "22" : "transparent",
                    color: active ? n.color : "var(--muted-foreground)",
                  }}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span
                  className="text-[9px] font-semibold leading-none"
                  style={{ color: active ? n.color : "var(--muted-foreground)" }}
                >
                  {n.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 md:ml-64 overflow-x-hidden">
        <div className="max-w-6xl mx-auto p-4 pt-20 pb-28 md:pt-8 md:pb-8 md:px-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
