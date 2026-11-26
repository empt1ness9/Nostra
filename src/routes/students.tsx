import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/ui-bits";
import { attendance, debt, rub, students } from "@/lib/demo-data";

export const Route = createFileRoute("/students")({
  head: () => ({
    meta: [
      { title: "Ученики — Nostra" },
      { name: "description", content: "Ученики, посещаемость и прогресс по занятиям." },
      { property: "og:title", content: "Ученики — Nostra" },
      { property: "og:description", content: "Ученики, посещаемость и прогресс." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Students,
});

const dot = { blue: "bg-lesson-blue-edge", green: "bg-lesson-green-edge", amber: "bg-lesson-amber-edge" } as const;

function Students() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <PageTitle>Ученики и посещаемость</PageTitle>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {students.map((s) => {
          const a = attendance(s.id);
          return (
            <section key={s.id} className="rounded-2xl border border-border bg-card p-5">
              <p className="flex items-center gap-2 font-semibold"><span className={`size-2 rounded-full ${dot[s.color]}`} />{s.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.subject} · {rub(s.price)}/урок · {s.phone}</p>
              <div className="my-4 grid grid-cols-2 gap-2 rounded-xl bg-background p-3">
                <div><p className="text-xs text-muted-foreground">Посещено</p><p className="font-semibold">{a.attended} из {a.total}</p></div>
                <div><p className="text-xs text-muted-foreground">К оплате</p><p className="font-semibold">{rub(debt(undefined, s.id))}</p></div>
              </div>
              <div className="mb-1 flex justify-between text-sm"><span className="text-muted-foreground">Прогресс (посещаемость)</span><span className="font-semibold">{a.percent}%</span></div>
              <div className="h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${a.percent}%` }} /></div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
