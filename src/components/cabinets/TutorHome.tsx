import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, Eyebrow, PageTitle } from "@/components/ui-bits";
import { priceMap, useLessons, useStudents } from "@/lib/data";
import { debt, fmtDay, parseIso, rub, todayIso } from "@/lib/rules";

const btn = "mt-auto block rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium hover:bg-secondary";

export function TutorHome() {
  const { data: students = [] } = useStudents();
  const { data: lessons = [] } = useLessons();
  const today = todayIso();
  const price = priceMap(students);
  const nameOf = (id: string) => students.find((s) => s.id === id)?.name ?? "";
  const upcoming = lessons.filter((l) => l.status === "planned" && l.date >= today);
  const next = upcoming[0];
  const todays = lessons.filter((l) => l.date === today);
  const awaiting = lessons.filter((l) => l.status === "done" && l.pay !== "paid" && l.kind !== "parent");
  const [notes, setNotes] = useState("");
  useEffect(() => setNotes(localStorage.getItem("nostra-notes") ?? ""), []);

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <PageTitle right={<span className="text-sm text-muted-foreground">{parseIso(today).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</span>}>Главная</PageTitle>
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <Eyebrow>Ваше пространство</Eyebrow>
          <h2 className="text-lg font-semibold">Больше времени на обучение</h2>
          <p className="mb-4 text-4xl font-bold">{students.length} <span className="text-sm font-normal text-muted-foreground">учеников</span></p>
          <Link to="/students" className={btn}>{students.length ? "Открыть учеников" : "Добавить первого ученика"}</Link>
        </Card>
        <Card className="flex flex-col gap-3">
          <Eyebrow>Ближайшее занятие</Eyebrow>
          <h2 className="text-lg font-semibold">{next ? nameOf(next.student_id) : "Свободно"}</h2>
          {next && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-secondary p-4 text-center"><p className="text-2xl font-bold">{fmtDay(next.date)}</p><p className="text-xs text-muted-foreground">дата</p></div>
                <div className="rounded-xl bg-secondary p-4 text-center"><p className="text-2xl font-bold">{next.start_time}</p><p className="text-xs text-muted-foreground">начало</p></div>
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
          <p className="mb-4 text-4xl font-bold">{rub(debt(lessons, price))}</p>
          <Link to="/finances" className={btn}>Перейти к финансам</Link>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Расписание на сегодня</h3>
          {todays.length === 0 && <p className="text-sm text-muted-foreground">Сегодня занятий нет.</p>}
          {todays.map((l) => (
            <div key={l.id} className="mb-2 flex items-center gap-4 rounded-xl border-l-2 border-primary bg-background p-4">
              <span className="font-semibold text-primary">{l.start_time}</span>
              <div className="min-w-0"><p className="font-medium">{nameOf(l.student_id)}</p><p className="truncate text-xs text-muted-foreground">{l.title} · до {l.end_time}</p></div>
            </div>
          ))}
        </Card>
        <Card>
          <div className="mb-4 flex justify-between"><h3 className="font-semibold">Заметки на сегодня</h3><span className="text-sm text-muted-foreground">Только для вас</span></div>
          <textarea value={notes} onChange={(e) => { setNotes(e.target.value); localStorage.setItem("nostra-notes", e.target.value); }}
            placeholder="Что важно не забыть?" className="h-28 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-hidden focus:border-ring" />
        </Card>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Ближайшие занятия</h3>
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Пока ничего не запланировано.</p>}
          {upcoming.slice(0, 6).map((l) => (
            <div key={l.id} className="flex gap-4 border-b border-border py-3 last:border-0">
              <span className="font-semibold text-primary">{l.start_time}</span>
              <div><p className="text-sm font-medium">{nameOf(l.student_id)}{l.kind === "parent" && " · встреча с родителем"}</p><p className="text-xs text-muted-foreground">{l.title} · {fmtDay(l.date)}</p></div>
            </div>
          ))}
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Ожидают оплаты</h3>
          {awaiting.length === 0 && <p className="text-sm text-muted-foreground">Все занятия оплачены.</p>}
          {awaiting.map((l) => (
            <div key={l.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
              <div><p className="text-sm font-medium">{nameOf(l.student_id)}</p><p className="text-xs text-muted-foreground">{l.title} · {fmtDay(l.date)}</p></div>
              <span className="font-semibold">{rub(price(l.student_id))}</span>
            </div>
          ))}
        </Card>
      </div>
    </main>
  );
}
