import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { addExpense, removeExpense } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Wallet, TrendingUp, TrendingDown, Trash2, Smartphone, Banknote } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_owner/revenue")({
  component: RevenuePage,
});

const fmt = (n: number) => `₹${Math.round(n).toLocaleString()}`;
const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};

function RevenuePage() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({ title: "", category: "Rent", amount: "", method: "cash" as "upi" | "cash", date: new Date().toISOString().slice(0, 10), notes: "" });

  const data = useMemo(() => {
    if (!gym) return null;
    // Build last 6 months series
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    const allPayments = gym.members.flatMap((m) => m.periods.map((p) => p.payment));
    const expenses = gym.expenses ?? [];

    const series = months.map((ym) => {
      const upi = allPayments
        .filter((p) => p.date.slice(0, 7) === ym)
        .reduce((s, p) => s + (p.upiAmount || 0), 0);
      const cash = allPayments
        .filter((p) => p.date.slice(0, 7) === ym)
        .reduce((s, p) => s + (p.cashAmount || 0), 0);
      const expUpi = expenses.filter((e) => e.date.slice(0, 7) === ym && e.method === "upi").reduce((s, e) => s + e.amount, 0);
      const expCash = expenses.filter((e) => e.date.slice(0, 7) === ym && e.method === "cash").reduce((s, e) => s + e.amount, 0);
      return {
        ym,
        label: monthLabel(ym),
        upi, cash, revenue: upi + cash,
        expense: expUpi + expCash,
        expUpi, expCash,
        profit: upi + cash - expUpi - expCash,
      };
    });

    const sel = series.find((s) => s.ym === selectedMonth) ?? {
      ym: selectedMonth, label: monthLabel(selectedMonth),
      upi: allPayments.filter((p) => p.date.slice(0, 7) === selectedMonth).reduce((s, p) => s + (p.upiAmount || 0), 0),
      cash: allPayments.filter((p) => p.date.slice(0, 7) === selectedMonth).reduce((s, p) => s + (p.cashAmount || 0), 0),
      revenue: 0, expense: 0, expUpi: 0, expCash: 0, profit: 0,
    };
    if (!series.find((s) => s.ym === selectedMonth)) {
      sel.revenue = sel.upi + sel.cash;
      sel.expUpi = expenses.filter((e) => e.date.slice(0, 7) === selectedMonth && e.method === "upi").reduce((s, e) => s + e.amount, 0);
      sel.expCash = expenses.filter((e) => e.date.slice(0, 7) === selectedMonth && e.method === "cash").reduce((s, e) => s + e.amount, 0);
      sel.expense = sel.expUpi + sel.expCash;
      sel.profit = sel.revenue - sel.expense;
    }

    const monthExpenses = expenses
      .filter((e) => e.date.slice(0, 7) === selectedMonth)
      .sort((a, b) => b.date.localeCompare(a.date));

    return { series, sel, monthExpenses, allMonths: months };
  }, [gym, selectedMonth]);

  if (!gym || !data) return null;

  const { series, sel, monthExpenses } = data;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.title || !amt || amt <= 0) {
      toast.error("Enter a title and valid amount");
      return;
    }
    addExpense(gym.gymId, {
      title: form.title.trim(),
      category: form.category,
      amount: amt,
      method: form.method,
      date: new Date(form.date).toISOString(),
      notes: form.notes.trim() || undefined,
    });
    toast.success("Expense added");
    setForm({ ...form, title: "", amount: "", notes: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue</h1>
          <p className="text-muted-foreground">Track income, expenses and profit by month.</p>
        </div>
        <div className="w-full sm:w-56">
          <Label className="text-xs">Month</Label>
          <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={TrendingUp} label="Revenue" value={fmt(sel.revenue)} tone="primary" />
        <Stat icon={TrendingDown} label="Expenses" value={fmt(sel.expense)} tone="warning" />
        <Stat icon={Wallet} label="Profit" value={fmt(sel.profit)} tone={sel.profit >= 0 ? "success" : "danger"} />
        <Stat icon={Smartphone} label="UPI / Cash" value={`${fmt(sel.upi)} / ${fmt(sel.cash)}`} />
      </div>

      {/* Split breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Income breakdown — {monthLabel(selectedMonth)}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <SplitRow icon={Smartphone} label="UPI" amount={sel.upi} total={sel.revenue} colorClass="bg-primary" />
            <SplitRow icon={Banknote} label="Cash" amount={sel.cash} total={sel.revenue} colorClass="bg-success" />
            <div className="pt-2 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">Total revenue</span>
              <span className="font-semibold">{fmt(sel.revenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total expenses</span>
              <span className="font-semibold text-warning">- {fmt(sel.expense)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t">
              <span className="font-medium">Net profit</span>
              <span className={`font-bold ${sel.profit >= 0 ? "text-success" : "text-destructive"}`}>{fmt(sel.profit)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Last 6 months — UPI vs Cash</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
                <Tooltip
                  formatter={(value: number, name: string) => [fmt(value), name]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
                <Legend />
                <Bar dataKey="upi" name="UPI" stackId="rev" fill="var(--color-primary, hsl(var(--primary)))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cash" name="Cash" stackId="rev" fill="var(--color-success, hsl(var(--success, 142 71% 45%)))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Profit trend */}
      <Card>
        <CardHeader><CardTitle className="text-base">Revenue · Expense · Profit (6 months)</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
              <Tooltip formatter={(v: number, n: string) => [fmt(v), n]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="hsl(var(--warning, 38 92% 50%))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill="hsl(var(--success, 142 71% 45%))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Add expense + list */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Add expense</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Electricity bill" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Rent", "Salary", "Utilities", "Equipment", "Maintenance", "Marketing", "Other"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Method</Label>
                  <Select value={form.method} onValueChange={(v: "upi" | "cash") => setForm({ ...form, method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Amount (₹)</Label>
                  <Input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Add expense</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Expenses — {monthLabel(selectedMonth)}</CardTitle></CardHeader>
          <CardContent>
            {monthExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No expenses recorded for this month.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthExpenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs">{new Date(e.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell><span className="text-xs px-2 py-0.5 rounded bg-muted">{e.category}</span></TableCell>
                      <TableCell className="uppercase text-xs">{e.method}</TableCell>
                      <TableCell className="text-right font-medium">{fmt(e.amount)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => { removeExpense(gym.gymId, e.id); toast.success("Removed"); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: any; tone?: "primary" | "warning" | "success" | "danger" }) {
  const toneClass =
    tone === "warning" ? "bg-warning/15 text-warning"
    : tone === "success" ? "bg-success/15 text-success"
    : tone === "danger" ? "bg-destructive/15 text-destructive"
    : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-base md:text-lg font-bold truncate">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SplitRow({ icon: Icon, label, amount, total, colorClass }: { icon: any; label: string; amount: number; total: number; colorClass: string }) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
        <span className="font-medium">{fmt(amount)} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
