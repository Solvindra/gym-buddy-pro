import type { Gym, Member, Plan, Trainer, MembershipPeriod, Payment, MedicalInfo, Session, Expense } from "./types";

const GYMS_KEY = "gym_app_gyms_v1";
const SESSION_KEY = "gym_app_session_v1";
const OTP_KEY = "gym_app_otp_v1";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
function emit() {
  listeners.forEach((l) => l());
}

function safeParse<T>(v: string | null, fallback: T): T {
  if (!v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export function getGyms(): Record<string, Gym> {
  if (typeof window === "undefined") return {};
  return safeParse(localStorage.getItem(GYMS_KEY), {} as Record<string, Gym>);
}

function saveGyms(gyms: Record<string, Gym>) {
  localStorage.setItem(GYMS_KEY, JSON.stringify(gyms));
  emit();
}

export function getGym(gymId: string): Gym | null {
  return getGyms()[gymId] ?? null;
}

export function updateGym(gymId: string, updater: (g: Gym) => Gym) {
  const gyms = getGyms();
  const g = gyms[gymId];
  if (!g) return;
  gyms[gymId] = updater(g);
  saveGyms(gyms);
}

export function getSession(): Session {
  if (typeof window === "undefined") return null;
  return (
    safeParse(localStorage.getItem(SESSION_KEY), null as Session) ??
    safeParse(sessionStorage.getItem(SESSION_KEY), null as Session)
  );
}

export function setSession(s: Session, persist = true) {
  if (typeof window === "undefined") return;
  // Clear both storages first
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  if (s) {
    if (persist) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }
  emit();
}

export function generateGymId(input: {
  ownerName: string;
  ownerSurname: string;
  ownerPhone: string;
  city: string;
}): string {
  const name = input.ownerName.trim();
  const surname = input.ownerSurname.trim();
  const phone = input.ownerPhone.replace(/\D/g, "");
  const city = input.city.trim();
  const n = (name[0] || "X").toUpperCase();
  const s = (surname[0] || "X").toUpperCase();
  const p1 = phone[0] || "0";
  const pMid = phone[Math.floor(phone.length / 2)] || "0";
  const c = (city[city.length - 1] || "X").toUpperCase();
  return `${n}${s}${p1}${pMid}${c}`;
}

// ----- Auth -----

export function signupGym(input: {
  gymName: string;
  ownerName: string;
  ownerSurname: string;
  ownerPhone: string;
  ownerEmail: string;
  city: string;
  state: string;
  password: string;
  plans: Plan[];
}): { ok: true; gymId: string } | { ok: false; error: string } {
  const gymId = generateGymId(input);
  const gyms = getGyms();
  if (gyms[gymId]) {
    return { ok: false, error: `Gym ID ${gymId} already exists. Try slightly different details.` };
  }
  gyms[gymId] = {
    gymId,
    gymName: input.gymName,
    ownerName: input.ownerName,
    ownerSurname: input.ownerSurname,
    ownerPhone: input.ownerPhone,
    ownerEmail: input.ownerEmail,
    city: input.city,
    state: input.state,
    password: input.password,
    plans: input.plans,
    members: [],
    trainers: [],
  };
  saveGyms(gyms);
  return { ok: true, gymId };
}

export function loginOwner(gymId: string, password: string, persist = true): boolean {
  const g = getGym(gymId.toUpperCase());
  if (!g || g.password !== password) return false;
  setSession({ kind: "owner", gymId: g.gymId }, persist);
  return true;
}

export function loginTrainer(gymId: string, username: string, password: string, persist = true): boolean {
  const g = getGym(gymId.toUpperCase());
  if (!g) return false;
  const t = g.trainers.find((t) => t.username === username && t.password === password);
  if (!t) return false;
  setSession({ kind: "trainer", gymId: g.gymId, trainerId: t.id }, persist);
  return true;
}

export function logout() {
  setSession(null);
}

// ----- OTP (mock; shown on screen for demo) -----

export function requestOtp(gymId: string): { ok: true; otp: string; email: string } | { ok: false; error: string } {
  const g = getGym(gymId.toUpperCase());
  if (!g) return { ok: false, error: "No gym found with that ID" };
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  localStorage.setItem(OTP_KEY, JSON.stringify({ gymId: g.gymId, otp, ts: Date.now() }));
  return { ok: true, otp, email: g.ownerEmail };
}

export function verifyOtpAndReset(gymId: string, otp: string, newPassword: string): boolean {
  const stored = safeParse(localStorage.getItem(OTP_KEY), null as null | { gymId: string; otp: string; ts: number });
  if (!stored || stored.gymId !== gymId.toUpperCase() || stored.otp !== otp) return false;
  updateGym(gymId.toUpperCase(), (g) => ({ ...g, password: newPassword }));
  localStorage.removeItem(OTP_KEY);
  return true;
}

// ----- Plans -----

export function addPlan(gymId: string, plan: Omit<Plan, "id">) {
  updateGym(gymId, (g) => ({ ...g, plans: [...g.plans, { ...plan, id: crypto.randomUUID() }] }));
}
export function removePlan(gymId: string, planId: string) {
  updateGym(gymId, (g) => ({ ...g, plans: g.plans.filter((p) => p.id !== planId) }));
}

// ----- Members -----

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function addMember(
  gymId: string,
  input: {
    name: string;
    phone: string;
    emergencyContact?: string;
    photo?: string;
    bloodGroup: string;
    planId: string;
    payment: Payment;
  }
): Member | null {
  const g = getGym(gymId);
  if (!g) return null;
  const plan = g.plans.find((p) => p.id === input.planId);
  if (!plan) return null;
  const start = new Date().toISOString();
  const period: MembershipPeriod = {
    id: crypto.randomUUID(),
    planId: plan.id,
    planName: plan.name,
    startDate: start,
    endDate: addDays(start, plan.durationDays),
    durationDays: plan.durationDays,
    payment: input.payment,
  };
  const member: Member = {
    id: crypto.randomUUID(),
    name: input.name,
    phone: input.phone,
    emergencyContact: input.emergencyContact,
    photo: input.photo,
    bloodGroup: input.bloodGroup,
    status: "active",
    createdAt: start,
    periods: [period],
    attendance: [],
  };
  updateGym(gymId, (g) => ({ ...g, members: [...g.members, member] }));
  return member;
}

export function extendMembership(
  gymId: string,
  memberId: string,
  planId: string,
  payment: Payment
) {
  updateGym(gymId, (g) => {
    const plan = g.plans.find((p) => p.id === planId);
    if (!plan) return g;
    return {
      ...g,
      members: g.members.map((m) => {
        if (m.id !== memberId) return m;
        const lastEnd = m.periods.length
          ? m.periods[m.periods.length - 1].endDate
          : new Date().toISOString();
        const start = new Date(lastEnd) > new Date() ? lastEnd : new Date().toISOString();
        const period: MembershipPeriod = {
          id: crypto.randomUUID(),
          planId: plan.id,
          planName: plan.name,
          startDate: start,
          endDate: addDays(start, plan.durationDays),
          durationDays: plan.durationDays,
          payment,
        };
        return { ...m, status: "active", periods: [...m.periods, period] };
      }),
    };
  });
}

export function cancelMembership(gymId: string, memberId: string) {
  updateGym(gymId, (g) => ({
    ...g,
    members: g.members.map((m) => (m.id === memberId ? { ...m, status: "cancelled" } : m)),
  }));
}

export function updateMedical(gymId: string, memberId: string, medical: MedicalInfo) {
  updateGym(gymId, (g) => ({
    ...g,
    members: g.members.map((m) => (m.id === memberId ? { ...m, medical } : m)),
  }));
}

export function markAttendance(gymId: string, memberId: string, dateISO?: string) {
  const day = (dateISO ?? new Date().toISOString()).slice(0, 10);
  updateGym(gymId, (g) => ({
    ...g,
    members: g.members.map((m) => {
      if (m.id !== memberId) return m;
      if (m.attendance.includes(day)) return m;
      return { ...m, attendance: [...m.attendance, day] };
    }),
  }));
}

export function unmarkAttendance(gymId: string, memberId: string, dateISO?: string) {
  const day = (dateISO ?? new Date().toISOString()).slice(0, 10);
  updateGym(gymId, (g) => ({
    ...g,
    members: g.members.map((m) =>
      m.id === memberId ? { ...m, attendance: m.attendance.filter((d) => d !== day) } : m
    ),
  }));
}

// ----- Trainers -----

export function addTrainer(
  gymId: string,
  input: { name: string; phone: string; username: string; password: string }
): Trainer | null {
  const g = getGym(gymId);
  if (!g) return null;
  if (g.trainers.some((t) => t.username === input.username)) return null;
  const t: Trainer = {
    id: crypto.randomUUID(),
    name: input.name,
    phone: input.phone,
    username: input.username,
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  updateGym(gymId, (g) => ({ ...g, trainers: [...g.trainers, t] }));
  return t;
}

export function removeTrainer(gymId: string, trainerId: string) {
  updateGym(gymId, (g) => ({ ...g, trainers: g.trainers.filter((t) => t.id !== trainerId) }));
}

// ----- Expenses -----

export function addExpense(gymId: string, input: Omit<Expense, "id">): Expense | null {
  const g = getGym(gymId);
  if (!g) return null;
  const e: Expense = { ...input, id: crypto.randomUUID() };
  updateGym(gymId, (g) => ({ ...g, expenses: [...(g.expenses ?? []), e] }));
  return e;
}

export function removeExpense(gymId: string, expenseId: string) {
  updateGym(gymId, (g) => ({ ...g, expenses: (g.expenses ?? []).filter((e) => e.id !== expenseId) }));
}

// ----- Helpers -----

export function getMemberStatus(m: Member): "active" | "expired" | "cancelled" {
  if (m.status === "cancelled") return "cancelled";
  const last = m.periods[m.periods.length - 1];
  if (!last) return "expired";
  if (new Date(last.endDate) < new Date()) return "expired";
  return "active";
}

export function getCurrentPeriod(m: Member) {
  return m.periods[m.periods.length - 1];
}

export function daysRemaining(m: Member): number {
  const p = getCurrentPeriod(m);
  if (!p) return 0;
  const ms = new Date(p.endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
