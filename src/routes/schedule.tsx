import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/lib/head";
import { useAuth } from "@/lib/auth";
import { useLessons, useStudents, type Lesson } from "@/lib/data";
import { addDays, minutes, mondayOf, parseIso, todayIso } from "@/lib/rules";
import { LessonDialog } from "@/components/LessonDialog";
import { btnGhost, btnPrimary } from "@/components/ui-bits";

export const Route = createFileRoute("/schedule")({
  head: pageHead("Расписание", "Недельное расписание занятий в привычном календарном виде."),
  component: Schedule,
});

const names = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const START = 8, END = 22, HOUR = 56;
const colorCls: Record<string, string> = {
  blue: "bg-lesson-blue border-lesson-blue-edge",
  green: "bg-lesson-green border-lesson-green-edge",
  amber: "bg-lesson-amber border-lesson-amber-edge",
};
const statusTag: Record<string, string> = { rescheduled: "Перенос", missed: "Пропуск", done: "Проведено" };

function Schedule() {
  const { role } = useAuth();
  const isTutor = role === "tutor";
  const { data: students = [] } = useStudents();
  const { data: lessons = [] } = useLessons();
  const today = todayIso();
  const [week, setWeek] = useState(() => mondayOf(today));
  const [dlg, setDlg] = useState<{ lesson: Lesson | null; date: string } | null>(null);
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const hours = Array.from({ length: END - START }, (_, i) => START + i);
  const fmt = (s: string, o: Intl.DateTimeFormatOptions) => parseIso(s).toLocaleDateString("ru-RU", o);

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button className={btnGhost} onClick={() => setWeek(addDays(week, -7))} aria-label="Прошлая неделя">‹</button>
          <button className={btnGhost} onClick={() => setWeek(mondayOf(today))}>Сегодня</button>
          <button className={btnGhost} onClick={() => setWeek(addDays(week, 7))} aria-label="Следующая неделя">›</button>
          <h1 className="ml-2 text-2xl font-semibold tracking-tight">{fmt(days[0]!, { day: "numeric", month: "short" })} – {fmt(days[6]!, { day: "numeric", month: "long", year: "numeric" })}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="text-success">● Оплачено</span><span className="text-warning">● На проверке</span><span className="text-destructive">● Не оплачено</span>
          </div>
          {isTutor && <button className={btnPrimary} onClick={() => setDlg({ lesson: null, date: today })}>+ Занятие</button>}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border">
          <div />
          {days.map((d, i) => (
            <div key={d} className="border-l border-border py-3 text-center">
              <p className="text-xs text-muted-foreground">{names[i]}</p>
              <p className={`mx-auto mt-1 grid size-8 place-items-center rounded-lg font-semibold ${d === today ? "bg-primary text-primary-foreground" : ""}`}>{parseIso(d).getDate()}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[56px_repeat(7,1fr)]">
          <div>{hours.map((h) => <div key={h} style={{ height: HOUR }} className="pr-2 pt-1 text-right text-[11px] text-muted-foreground">{`${h}:00`}</div>)}</div>
          {days.map((d) => (
            <div key={d} className="relative border-l border-border">
              {hours.map((h) => (
                <div key={h} style={{ height: HOUR }} className={`border-t border-border/60 ${isTutor ? "cursor-pointer hover:bg-secondary/40" : ""}`}
                  onClick={() => isTutor && setDlg({ lesson: null, date: d })} />
              ))}
              {lessons.filter((l) => l.date === d).map((l) => {
                const st = students.find((s) => s.id === l.student_id);
                const top = ((minutes(l.start_time) - START * 60) / 60) * HOUR;
                const h = ((minutes(l.end_time) - minutes(l.start_time)) / 60) * HOUR;
                const dot = l.pay === "paid" ? "bg-success" : l.pay === "pending" ? "bg-warning" : "bg-destructive";
                return (
                  <button key={l.id} style={{ top, height: h }} onClick={() => isTutor && setDlg({ lesson: l, date: d })}
                    className={`absolute inset-x-1 overflow-hidden rounded-lg border-l-4 p-2 text-left text-xs ${colorCls[st?.color ?? "blue"]} ${l.status === "rescheduled" || l.status === "missed" ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-muted-foreground">{l.start_time}–{l.end_time}</span>
                      <span className="flex items-center gap-1">
                        {statusTag[l.status] && <span className="rounded bg-background/50 px-1 text-[10px] text-warning">{statusTag[l.status]}</span>}
                        {l.kind !== "parent" && <span className={`size-2 rounded-full ${dot}`} />}
                      </span>
                    </div>
                    <p className="font-semibold">{st?.name}</p>
                    <p className="truncate text-muted-foreground">{l.kind === "parent" ? "Час с родителем" : l.title}</p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {dlg && <LessonDialog key={dlg.lesson?.id ?? dlg.date} open onClose={() => setDlg(null)} students={students} lesson={dlg.lesson} date={dlg.date} />}
    </main>
  );
}
