import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, Eyebrow, PageTitle } from "@/components/ui-bits";
import { TODAY, debt, lessons, rub, studentById, students } from "@/lib/demo-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Главная — Nostra" },
      { name: "description", content: "Рабочий день репетитора: ближайшие занятия, долги и заметки." },
      { property: "og:title", content: "Главная — Nostra" },
      { property: "og:description", content: "Рабочий день репетитора в Nostra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

const btn = "mt-auto block rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium hover:bg-secondary";

function Overview() {
  const upcoming = lessons.filter((l) => l.status === "planned" && l.date > TODAY).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const next = upcoming[0];
  const today = lessons.filter((l) => l.date === TODAY);
  const awaiting = lessons.filter((l) => l.status === "done" && l.pay !== "paid");
  const [notes, setNotes] = useState("");
  useEffect(() => setNotes(localStorage.getItem("nostra-notes") ?? ""), []);

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <PageTitle right={<span className="text-sm text-muted-foreground">четверг, 26 ноября</span>}>Главная</PageTitle>
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <Eyebrow>Ваше пространство</Eyebrow>
          <h2 className="text-lg font-semibold">Больше времени на обучение</h2>
          <p className="text-sm text-muted-foreground">Ученики, программа и обратная связь — всё в одном месте.</p>
          <p className="mb-4 text-4xl font-bold">{students.length} <span className="text-sm font-normal text-muted-foreground">ученика</span></p>
          <Link to="/students" className={btn}>Открыть учеников</Link>
        </Card>
        <Card className="flex flex-col gap-3">
          <Eyebrow>Ближайшее занятие</Eyebrow>
          <h2 className="text-lg font-semibold">{next ? studentById(next.studentId)?.name : "Свободно"}</h2>
          {next && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-secondary p-4 text-center"><p className="text-3xl font-bold">{next.date.slice(8)}</p><p className="text-xs text-muted-foreground">ноябрь</p></div>
                <div className="rounded-xl bg-secondary p-4 text-center"><p className="text-3xl font-bold">{next.start}</p><p className="text-xs text-muted-foreground">начало</p></div>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{next.title}</p>
            </>
          )}
          <Link to="/schedule" className={btn}>Открыть расписание</Link>
        </Card>
        <Card className="flex flex-col gap-3">
          <Eyebrow>Под контролем</Eyebrow>
          <h2 className="text-lg font-semibold">Оплаты без лишних вопросов</h2>
          <p className="text-sm text-muted-foreground">Долг за проведённые занятия. Будущие уроки не входят.</p>
          <p className="mb-4 text-4xl font-bold">{rub(debt())}</p>
          <Link to="/finances" className={btn}>Перейти к финансам</Link>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Расписание на сегодня</h3>
          {today.length === 0 && <p className="text-sm text-muted-foreground">Сегодня занятий нет.</p>}
          {today.map((l) => (
            <div key={l.id} className="mb-2 flex items-center gap-4 rounded-xl border-l-2 border-primary bg-background p-4">
              <span className="font-semibold text-primary">{l.start}</span>
              <div className="min-w-0"><p className="font-medium">{studentById(l.studentId)?.name}</p><p className="truncate text-xs text-muted-foreground">{l.title} · до {l.end}</p></div>
            </div>
          ))}
        </Card>
        <Card>
          <div className="mb-4 flex justify-between"><h3 className="font-semibold">Заметки на сегодня</h3><span className="text-sm text-muted-foreground">Только для вас</span></div>
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); localStorage.setItem("nostra-notes", e.target.value); }}
            placeholder="Что важно не забыть?"
            className="h-28 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-hidden focus:border-ring"
          />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Ближайшие занятия</h3>
          {upcoming.map((l) => (
            <div key={l.id} className="flex gap-4 border-b border-border py-3 last:border-0">
              <span className="font-semibold text-primary">{l.start}</span>
              <div><p className="text-sm font-medium">{studentById(l.studentId)?.name}</p><p className="text-xs text-muted-foreground">{l.title} · {l.date.slice(8)} нояб.</p></div>
            </div>
          ))}
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Ожидают оплаты</h3>
          {awaiting.map((l) => (
            <div key={l.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
              <div><p className="text-sm font-medium">{studentById(l.studentId)?.name}</p><p className="text-xs text-muted-foreground">{l.title} · {l.date.slice(8)} нояб.</p></div>
              <span className="font-semibold">{rub(studentById(l.studentId)?.price ?? 0)}</span>
            </div>
          ))}
        </Card>
      </div>
    </main>
  );
}
