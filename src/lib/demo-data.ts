// Demo data until accounts and storage are added. "Today" is fixed so server and browser agree.
export type LessonStatus = "planned" | "done" | "missed" | "rescheduled";
export type PayStatus = "paid" | "pending" | "unpaid";

export interface Student {
  id: string;
  name: string;
  subject: string;
  price: number;
  phone: string;
  color: "blue" | "green" | "amber";
  topicsDone: number;
  topicsTotal: number;
}

export interface Lesson {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string;
  title: string;
  status: LessonStatus;
  pay: PayStatus;
}

export const TODAY = "2026-11-26";

export const students: Student[] = [
  { id: "s1", name: "Артём Волков", subject: "Математика (ЕГЭ)", price: 2000, phone: "+7 (910) 234-56-78", color: "blue", topicsDone: 10, topicsTotal: 16 },
  { id: "s2", name: "София Лебедева", subject: "Английский язык", price: 1600, phone: "+7 (920) 555-12-34", color: "green", topicsDone: 10, topicsTotal: 12 },
  { id: "s3", name: "Максим Орлов", subject: "Физика (ОГЭ)", price: 1800, phone: "+7 (905) 777-88-99", color: "amber", topicsDone: 5, topicsTotal: 13 },
];

export const lessons: Lesson[] = [
  { id: "l1", studentId: "s1", date: "2026-11-23", start: "15:00", end: "16:30", title: "Логарифмы и неравенства", status: "done", pay: "paid" },
  { id: "l2", studentId: "s2", date: "2026-11-24", start: "17:00", end: "18:00", title: "Speaking & Essay", status: "done", pay: "pending" },
  { id: "l3", studentId: "s1", date: "2026-11-25", start: "15:00", end: "16:30", title: "Стереометрия: сечения", status: "rescheduled", pay: "unpaid" },
  { id: "l4", studentId: "s3", date: "2026-11-25", start: "17:00", end: "18:30", title: "Законы Ньютона", status: "missed", pay: "unpaid" },
  { id: "l5", studentId: "s1", date: "2026-11-26", start: "16:00", end: "17:30", title: "Стереометрия (отработка)", status: "done", pay: "unpaid" },
  { id: "l6", studentId: "s2", date: "2026-11-27", start: "14:00", end: "15:00", title: "Grammar & Vocabulary", status: "planned", pay: "unpaid" },
  { id: "l7", studentId: "s2", date: "2026-11-21", start: "12:00", end: "13:00", title: "Reading", status: "missed", pay: "unpaid" },
];

export const studentById = (id: string) => students.find((s) => s.id === id);

/** Progress = share of attended lessons among lessons that already happened (done or missed). */
export function attendance(studentId: string, list: Lesson[] = lessons) {
  const past = list.filter((l) => l.studentId === studentId && (l.status === "done" || l.status === "missed"));
  const attended = past.filter((l) => l.status === "done").length;
  return { attended, total: past.length, percent: past.length ? Math.round((attended / past.length) * 100) : 0 };
}

/** Debt counts only lessons that took place and are not paid; future lessons are excluded. */
export function debt(list: Lesson[] = lessons, studentId?: string) {
  return list
    .filter((l) => l.status === "done" && l.pay !== "paid" && (!studentId || l.studentId === studentId))
    .reduce((sum, l) => sum + (studentById(l.studentId)?.price ?? 0), 0);
}

export function paidIncome(list: Lesson[] = lessons) {
  return list.filter((l) => l.status === "done" && l.pay === "paid").reduce((s, l) => s + (studentById(l.studentId)?.price ?? 0), 0);
}

export function plannedIncome(list: Lesson[] = lessons) {
  return list.filter((l) => l.status === "planned").reduce((s, l) => s + (studentById(l.studentId)?.price ?? 0), 0);
}

export const rub = (n: number) => `${n.toLocaleString("ru-RU").replace(/,/g, " ")} ₽`;

export const minutes = (t: string) => {
  const [h, m] = t.split(":");
  return Number(h ?? 0) * 60 + Number(m ?? 0);
};
