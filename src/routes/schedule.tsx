import { createFileRoute } from "@tanstack/react-router";
import { TODAY, lessons, minutes, studentById, type Lesson } from "@/lib/demo-data";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Расписание — Nostra" },
      { name: "description", content: "Недельное расписание занятий в привычном календарном виде." },
      { property: "og:title", content: "Расписание — Nostra" },
      { property: "og:description", content: "Недельное расписание занятий репетитора." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Schedule,
});

const days = ["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28", "2026-11-29"];
const names = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const START = 8, END = 21, HOUR = 56;
const colorCls = {
  blue: "bg-lesson-blue border-lesson-blue-edge",
  green: "bg-lesson-green border-lesson-green-edge",
  amber: "bg-lesson-amber border-lesson-amber-edge",
} as const;
const statusTag: Partial<Record<Lesson["status"], string>> = { rescheduled: "Перенос", missed: "Пропуск" };

function Schedule() {
  const hours = Array.from({ length: END - START }, (_, i) => START + i);
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">23–29 ноября 2026</h1>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="text-success">● Оплачено</span><span className="text-warning">● На проверке</span><span className="text-destructive">● Не оплачено</span>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border">
          <div />
          {days.map((d, i) => (
            <div key={d} className="border-l border-border py-3 text-center">
              <p className="text-xs text-muted-foreground">{names[i]}</p>
              <p className={`mx-auto mt-1 grid size-8 place-items-center rounded-lg font-semibold ${d === TODAY ? "bg-primary text-primary-foreground" : ""}`}>{d.slice(8)}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[56px_repeat(7,1fr)]">
          <div>{hours.map((h) => <div key={h} style={{ height: HOUR }} className="pr-2 pt-1 text-right text-[11px] text-muted-foreground">{`${h}:00`}</div>)}</div>
          {days.map((d) => (
            <div key={d} className="relative border-l border-border">
              {hours.map((h) => <div key={h} style={{ height: HOUR }} className="border-t border-border/60" />)}
              {lessons.filter((l) => l.date === d).map((l) => {
                const st = studentById(l.studentId);
                const top = ((minutes(l.start) - START * 60) / 60) * HOUR;
                const h = ((minutes(l.end) - minutes(l.start)) / 60) * HOUR;
                const dot = l.pay === "paid" ? "bg-success" : l.pay === "pending" ? "bg-warning" : "bg-destructive";
                return (
                  <div key={l.id} style={{ top, height: h }} className={`absolute inset-x-1 overflow-hidden rounded-lg border-l-4 p-2 text-xs ${colorCls[st?.color ?? "blue"]} ${l.status === "rescheduled" || l.status === "missed" ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-muted-foreground">{l.start}–{l.end}</span>
                      <span className="flex items-center gap-1">
                        {statusTag[l.status] && <span className="rounded bg-background/50 px-1 text-[10px] text-warning">{statusTag[l.status]}</span>}
                        <span className={`size-2 rounded-full ${dot}`} />
                      </span>
                    </div>
                    <p className="font-semibold">{st?.name}</p>
                    <p className="truncate text-muted-foreground">{l.title}</p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
