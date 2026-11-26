import { createFileRoute } from "@tanstack/react-router";
import { Card, PageTitle, PayBadge } from "@/components/ui-bits";
import { debt, lessons, paidIncome, plannedIncome, rub, studentById } from "@/lib/demo-data";

export const Route = createFileRoute("/finances")({
  head: () => ({
    meta: [
      { title: "Финансы — Nostra" },
      { name: "description", content: "Доходы, долги и оплаты репетитора." },
      { property: "og:title", content: "Финансы — Nostra" },
      { property: "og:description", content: "Доходы, долги и оплаты репетитора." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Finances,
});

function Finances() {
  const held = lessons.filter((l) => l.status === "done");
  const pending = held.filter((l) => l.pay === "pending").reduce((s, l) => s + (studentById(l.studentId)?.price ?? 0), 0);
  const stats = [
    ["Получено за ноябрь", rub(paidIncome())],
    ["Долг за проведённые уроки", rub(debt())],
    ["Ожидают проверки", rub(pending)],
    ["Плановый доход", rub(plannedIncome())],
  ];
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <PageTitle>Финансы</PageTitle>
      <div className="grid gap-5 md:grid-cols-4">
        {stats.map(([k, v]) => (
          <Card key={k}><p className="text-sm text-muted-foreground">{k}</p><p className="mt-2 text-3xl font-bold">{v}</p></Card>
        ))}
      </div>
      <Card className="mt-5">
        <h3 className="mb-4 font-semibold">Оплаты за проведённые занятия</h3>
        {held.map((l) => (
          <div key={l.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-border py-3 last:border-0">
            <div className="min-w-0"><p className="text-sm font-medium">{studentById(l.studentId)?.name}</p><p className="truncate text-xs text-muted-foreground">{l.title} · {l.date.slice(8)} нояб.</p></div>
            <PayBadge status={l.pay} />
            <span className="w-24 text-right font-semibold">{rub(studentById(l.studentId)?.price ?? 0)}</span>
          </div>
        ))}
      </Card>
    </main>
  );
}
