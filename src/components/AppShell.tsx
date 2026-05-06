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
  Settings,
  LogOut,
  UserCog,
  Wallet,
  Palette,
  X,
  Crown,
  MoreHorizontal,
  UserCheck,
  UserX,
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

const OWNER_PRIMARY = 4;

export function AppShell({ role }: { role: "owner" | "trainer" }) {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [moreOpen, setMoreOpen] = useState(false);
  const [membersMenuOpen, setMembersMenuOpen] = useState(false);

  useEffect(() => {
    initDarkMode();
    const onStorageFull = () => {
      toast.error("Storage full! Remove member photos to free up space.", { duration: 6000 });
    };
    window.addEventListener("gym-storage-full", onStorageFull);
    return () => window.removeEventListener("gym-storage-full", onStorageFull);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
    setMembersMenuOpen(false);
  }, [path]);

  if (!session || !gym) return null;
  const nav = role === "owner" ? ownerNav : trainerNav;
  const trainer = session.kind === "trainer" ? gym.trainers.find((t) => t.id === session.trainerId) : null;
  const displayName = trainer ? trainer.name : gym.ownerName;
  const displayRole = trainer ? "Trainer" : "Owner";

  const primaryNav = role === "owner" ? nav.slice(0, OWNER_PRIMARY) : nav;
  const moreNav = role === "owner" ? nav.slice(OWNER_PRIMARY) : [];
  const isMoreActive = moreNav.some((n) => path === n.to || path.startsWith(n.to + "/"));

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40 border-r bg-sidebar text-sidebar-foreground shadow-xl">
        <div className="px-5 py-5 border-b">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="The Track" className="h-10 w-10 object-contain shrink-0 dark:invert" />
            <div className="min-w-0">
              <div className="font-bold truncate leading-tight">{gym.gymName}</div>
              <div className="text-[11px] text-muted-foreground font-mono">ID: {gym.gymId}</div>
            </div>
          </div>
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
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <span
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: active ? n.color + "30" : n.bg, color: n.color }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {n.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: n.color }} />
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

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-card border-b h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="The Track" className="h-8 w-8 object-contain shrink-0 dark:invert" />
          <div className="min-w-0">
            <div className="font-bold text-sm leading-tight truncate">{gym.gymName}</div>
            <div className="text-[10px] text-muted-foreground font-mono leading-none">ID: {gym.gymId}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold"
            style={{ background: "var(--gradient-primary)", color: "white" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            {displayRole}
          </div>
          <button
            onClick={handleLogout}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── More panel overlay ── */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          onClick={() => setMoreOpen(false)}
        >
          {/* Dim backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Panel anchored just above the bottom bar */}
          <div
            className="absolute bottom-[64px] left-3 right-3 bg-card border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">More</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Grid of extra nav items */}
            <div className="grid grid-cols-3 gap-px bg-border p-px">
              {moreNav.map((n) => {
                const active = path === n.to || path.startsWith(n.to + "/");
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex flex-col items-center gap-2 px-3 py-4 transition-colors bg-card",
                      active ? "bg-muted" : "hover:bg-muted/60"
                    )}
                  >
                    <span
                      className="h-11 w-11 rounded-2xl flex items-center justify-center"
                      style={{ background: n.bg, color: n.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className="text-[11px] font-semibold leading-none"
                      style={{ color: active ? n.color : "var(--foreground)" }}
                    >
                      {n.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Log out row */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-t text-sm text-destructive hover:bg-destructive/5 transition-colors"
            >
              <span className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <LogOut className="h-4 w-4" />
              </span>
              <span className="font-medium">Log out</span>
              <span className="ml-auto text-xs text-muted-foreground truncate">{displayName}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Members mini-menu popup ── */}
      {membersMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          onClick={() => setMembersMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          {/* Popup anchored above the bottom bar, aligned to the Members tab (2nd of 5) */}
          <div
            className="absolute bottom-[72px] left-3 right-3 bg-card border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Members</span>
              <button
                onClick={() => setMembersMenuOpen(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-px bg-border p-px">
              {/* Current Members */}
              <Link
                to="/members"
                className={cn(
                  "flex flex-col items-center gap-2.5 px-4 py-5 bg-card transition-colors",
                  (path === "/members" || (path.startsWith("/members") && !path.startsWith("/members/previous")))
                    ? "bg-muted"
                    : "hover:bg-muted/60"
                )}
              >
                <span className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: "#3b82f620", color: "#3b82f6" }}>
                  <UserCheck className="h-5 w-5" />
                </span>
                <div className="text-center">
                  <div className="text-[12px] font-semibold leading-tight">Current</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">Active members</div>
                </div>
              </Link>
              {/* Previous Members */}
              <Link
                to="/members/previous"
                className={cn(
                  "flex flex-col items-center gap-2.5 px-4 py-5 bg-card transition-colors relative",
                  path.startsWith("/members/previous") ? "bg-muted" : "hover:bg-muted/60"
                )}
              >
                <span className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: "#f59e0b20", color: "#f59e0b" }}>
                  <UserX className="h-5 w-5" />
                </span>
                <div className="text-center">
                  <div className="text-[12px] font-semibold leading-tight flex items-center gap-1 justify-center">
                    Previous
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded-md leading-none" style={{ background: "#f59e0b20", color: "#f59e0b" }}>
                      <Crown className="h-2.5 w-2.5" />PRO
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight">Expired &amp; cancelled</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom tab bar ── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t">
        <nav className="flex items-center h-16 px-2">
          {primaryNav.map((n) => {
            const isMembersTab = n.to === "/members" && role === "owner";
            const active = path === n.to || path.startsWith(n.to + "/");
            const Icon = n.icon;

            if (isMembersTab) {
              return (
                <button
                  key={n.to}
                  onClick={() => {
                    setMoreOpen(false);
                    setMembersMenuOpen((v) => !v);
                  }}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-1"
                >
                  <span
                    className="h-9 w-9 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: active || membersMenuOpen ? n.color + "20" : "transparent",
                      color: active || membersMenuOpen ? n.color : "var(--muted-foreground)",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className="text-[10px] font-semibold leading-none"
                    style={{ color: active || membersMenuOpen ? n.color : "var(--muted-foreground)" }}
                  >
                    {n.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => { setMoreOpen(false); setMembersMenuOpen(false); }}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-1"
              >
                <span
                  className="h-9 w-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: active ? n.color + "20" : "transparent",
                    color: active ? n.color : "var(--muted-foreground)",
                  }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className="text-[10px] font-semibold leading-none"
                  style={{ color: active ? n.color : "var(--muted-foreground)" }}
                >
                  {n.label}
                </span>
              </Link>
            );
          })}

          {/* More button — only for owner with overflow nav */}
          {moreNav.length > 0 && (
            <button
              onClick={() => { setMoreOpen((v) => !v); setMembersMenuOpen(false); }}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1"
            >
              <span
                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: moreOpen || isMoreActive ? "#6366f120" : "transparent",
                  color: moreOpen || isMoreActive ? "#6366f1" : "var(--muted-foreground)",
                }}
              >
                {moreOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
              </span>
              <span
                className="text-[10px] font-semibold leading-none"
                style={{ color: moreOpen || isMoreActive ? "#6366f1" : "var(--muted-foreground)" }}
              >
                More
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 md:ml-64 overflow-x-hidden">
        <div className="max-w-6xl mx-auto p-4 pt-20 pb-24 md:pt-8 md:pb-8 md:px-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
