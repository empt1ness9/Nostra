import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, PageTitle, PayBadge } from "@/components/ui-bits";
import { pageHead } from "@/lib/head";
import { priceMap, useLessonMutations, useLessons, useStudents } from "@/lib/data";
import { debt, fmtDay, paidIncome, pendingSum, plannedIncome, rub, type PayStatus } from "@/lib/rules";

export const Route = createFileRoute("/finances")({
  head: pageHead("Финансы", "Доходы, долги и оплаты репетитора."),
  component: Finances,
});

function Finances() {
  const { data: students = [] } = useStudents();
  const { data: lessons = [] } = useLessons();
  const { update } = useLessonMutations();
  const price = priceMap(students);
  const nameOf = (id: string) => students.find((s) => s.id === id)?.name ?? "";
  const held = lessons.filter((l) => l.status === "done" && l.kind !== "parent").reverse();
  const stats = [
    ["Получено", rub(paidIncome(lessons, price))],
    ["Долг за проведённые уроки", rub(debt(lessons, price))],
    ["Ожидают проверки", rub(pendingSum(lessons, price))],
    ["Плановый доход", rub(plannedIncome(lessons, price))],
  ];
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <PageTitle>Финансы</PageTitle>
      <div className="grid gap-5 md:grid-cols-4">
        {stats.map(([k, v]) => <Card key={k}><p className="text-sm text-muted-foreground">{k}</p><p className="mt-2 text-3xl font-bold">{v}</p></Card>)}
      </div>
      <Card className="mt-5">
        <h3 className="mb-4 font-semibold">Оплаты за проведённые занятия</h3>
        {held.length === 0 && <p className="text-sm text-muted-foreground">Отметьте занятие как «Проведено» в расписании — оно появится здесь.</p>}
        {held.map((l) => (
          <div key={l.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_120px] items-center gap-4 border-b border-border py-3 last:border-0">
            <div className="min-w-0"><p className="text-sm font-medium">{nameOf(l.student_id)}</p><p className="truncate text-xs text-muted-foreground">{l.title} · {fmtDay(l.date)}</p></div>
            <PayBadge status={l.pay as PayStatus} />
            <span className="w-24 text-right font-semibold">{rub(price(l.student_id))}</span>
            {l.pay !== "paid" ? (
              <button className="text-sm text-primary" onClick={() => update.mutate({ id: l.id, pay: "paid" }, { onSuccess: () => toast.success("Оплата подтверждена") })}>
                {l.pay === "pending" ? "Подтвердить" : "Отметить оплату"}
              </button>
            ) : <span />}
          </div>
        ))}
      </Card>
    </main>
  );
}
