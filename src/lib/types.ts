export type Plan = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
};

export type PaymentMethod = "upi" | "cash" | "split";

export type Payment = {
  method: PaymentMethod;
  upiAmount: number;
  cashAmount: number;
  total: number;
  date: string; // ISO
};

export type MedicalInfo = {
  height?: string;
  weight?: string;
  conditions?: string;
  allergies?: string;
  medications?: string;
  notes?: string;
};

export type MembershipPeriod = {
  id: string;
  planId: string;
  planName: string;
  startDate: string; // ISO
  endDate: string; // ISO
  durationDays: number;
  payment: Payment;
};

export type Member = {
  id: string;
  name: string;
  phone: string;
  emergencyContact?: string;
  photo?: string; // dataURL
  bloodGroup: string;
  status: "active" | "cancelled" | "expired";
  createdAt: string;
  periods: MembershipPeriod[];
  attendance: string[]; // ISO date strings (YYYY-MM-DD)
  medical?: MedicalInfo;
};

export type Trainer = {
  id: string;
  trainerId: string;
  name: string;
  phone: string;
  password: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  method: "upi" | "cash";
  date: string; // ISO
  notes?: string;
};

export type SubscriptionTier = "free" | "pro";

export type Gym = {
  gymId: string;
  gymName: string;
  ownerName: string;
  ownerSurname: string;
  ownerPhone: string;
  ownerEmail: string;
  city: string;
  state: string;
  password: string;
  plans: Plan[];
  members: Member[];
  trainers: Trainer[];
  expenses?: Expense[];
  subscriptionTier?: SubscriptionTier;
};

export type Session =
  | { kind: "owner"; gymId: string }
  | { kind: "trainer"; gymId: string; trainerId: string }
  | null;
