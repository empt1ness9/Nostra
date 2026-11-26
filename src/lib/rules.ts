// Progress and money rules. Parent meetings (kind "parent") are free and don't count toward progress.
export type LessonStatus = "planned" | "done" | "missed" | "rescheduled";
export type PayStatus = "paid" | "pending" | "unpaid";

export interface RuleLesson {
  student_id: string;
  status: string;
  pay: string;
  kind: string;
}
export type PriceOf = (studentId: string) => number;

const isLesson = (l: RuleLesson) => l.kind !== "parent";

/** Progress = share of attended lessons among lessons that already happened (done or missed). */
export function attendance(studentId: string, list: RuleLesson[]) {
  const past = list.filter((l) => isLesson(l) && l.student_id === studentId && (l.status === "done" || l.status === "missed"));
  const attended = past.filter((l) => l.status === "done").length;
  return { attended, total: past.length, percent: past.length ? Math.round((attended / past.length) * 100) : 0 };
}

const sum = (list: RuleLesson[], priceOf: PriceOf) => list.reduce((s, l) => s + priceOf(l.student_id), 0);

/** Debt counts only lessons that took place and are not paid; future lessons are excluded. */
export function debt(list: RuleLesson[], priceOf: PriceOf, studentId?: string) {
  return sum(list.filter((l) => isLesson(l) && l.status === "done" && l.pay !== "paid" && (!studentId || l.student_id === studentId)), priceOf);
}
export function pendingSum(list: RuleLesson[], priceOf: PriceOf) {
  return sum(list.filter((l) => isLesson(l) && l.status === "done" && l.pay === "pending"), priceOf);
}
export function paidIncome(list: RuleLesson[], priceOf: PriceOf) {
  return sum(list.filter((l) => isLesson(l) && l.pay === "paid"), priceOf);
}
export function plannedIncome(list: RuleLesson[], priceOf: PriceOf) {
  return sum(list.filter((l) => isLesson(l) && l.status === "planned"), priceOf);
}

export const rub = (n: number) => `${n.toLocaleString("ru-RU").replace(/,/g, " ")} ₽`;
export const minutes = (t: string) => {
  const [h, m] = t.split(":");
  return Number(h ?? 0) * 60 + Number(m ?? 0);
};

// Dates as local YYYY-MM-DD strings
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseIso = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y ?? 2000, (m ?? 1) - 1, d ?? 1);
};
export const addDays = (s: string, n: number) => {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
export const mondayOf = (s: string) => {
  const d = parseIso(s);
  return addDays(s, -((d.getDay() + 6) % 7));
};
export const todayIso = () => iso(new Date());
export const fmtDay = (s: string) => parseIso(s).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

/** Subscription: 290 ₽/month for up to 10 students, 500 ₽ for more. */
export const subscriptionPrice = (studentCount: number) => (studentCount > 10 ? 500 : 290);

export const topicProgress = (topics: { done: boolean }[]) =>
  topics.length ? Math.round((topics.filter((t) => t.done).length / topics.length) * 100) : 0;

export interface ReportLesson extends RuleLesson { date: string }
/** Monthly report: held/missed/rescheduled lessons in a month and the sum still to pay. Missed lessons are not charged. */
export function monthReport(list: ReportLesson[], studentId: string, month: string, price: number) {
  const inMonth = list.filter((l) => l.student_id === studentId && l.kind !== "parent" && l.date.startsWith(month));
  const held = inMonth.filter((l) => l.status === "done");
  const unpaid = held.filter((l) => l.pay !== "paid");
  return {
    held: held.length,
    missed: inMonth.filter((l) => l.status === "missed").length,
    rescheduled: inMonth.filter((l) => l.status === "rescheduled").length,
    total: held.length * price,
    toPay: unpaid.length * price,
  };
}

/** Lesson end from a start time plus duration in minutes (HH:MM). */
export const plusMinutes = (t: string, add: number) => {
  const m = Math.min(minutes(t) + add, 23 * 60 + 59);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
