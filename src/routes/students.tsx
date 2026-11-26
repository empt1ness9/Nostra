import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, PageTitle, btnGhost, btnPrimary, inputCls } from "@/components/ui-bits";
import { pageHead } from "@/lib/head";
import { priceMap, useLessons, useStudentMutations, useStudents, type Student } from "@/lib/data";
import { attendance, debt, rub } from "@/lib/rules";

export const Route = createFileRoute("/students")({
  head: pageHead("Ученики", "Ученики, посещаемость и прогресс по занятиям."),
  component: Students,
});

const dot: Record<string, string> = { blue: "bg-lesson-blue-edge", green: "bg-lesson-green-edge", amber: "bg-lesson-amber-edge" };
const colors = ["blue", "green", "amber"];

function StudentDialog({ student, count, onClose }: { student: Student | null; count: number; onClose: () => void }) {
  const m = useStudentMutations();
  const [f, setF] = useState({
    name: student?.name ?? "", subject: student?.subject ?? "", price: student?.price ?? 1500,
    phone: student?.phone ?? "", color: student?.color ?? colors[count % 3]!,
  });
  const done = { onSuccess: () => { toast.success("Сохранено"); onClose(); }, onError: (e: Error) => toast.error(e.message) };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{student ? "Ученик" : "Новый ученик"}</DialogTitle></DialogHeader>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); if (student) m.update.mutate({ id: student.id, ...f }, done); else m.add.mutate(f, done); }}>
          <Field label="Имя и фамилия"><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Предмет"><input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className={inputCls} /></Field>
            <Field label="Цена урока, ₽"><input type="number" min={0} value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} className={inputCls} /></Field>
          </div>
          <Field label="Телефон"><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={inputCls} /></Field>
          <Field label="Цвет в расписании">
            <div className="flex gap-2">{colors.map((c) => <button type="button" key={c} onClick={() => setF({ ...f, color: c })} className={`size-7 rounded-full ${dot[c]} ${f.color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}`} aria-label={c} />)}</div>
          </Field>
          <div className="mt-2 flex justify-between">
            {student ? <button type="button" className="text-sm text-destructive" onClick={() => confirm("Удалить ученика и все его занятия?") && m.remove.mutate(student.id, done)}>Удалить</button> : <span />}
            <div className="flex gap-2"><button type="button" className={btnGhost} onClick={onClose}>Отмена</button><button className={btnPrimary}>Сохранить</button></div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Students() {
  const { data: students = [] } = useStudents();
  const { data: lessons = [] } = useLessons();
  const price = priceMap(students);
  const [edit, setEdit] = useState<Student | null | "new">(null);
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <PageTitle right={<button className={btnPrimary} onClick={() => setEdit("new")}>+ Ученик</button>}>Ученики и посещаемость</PageTitle>
      {students.length === 0 && <p className="text-muted-foreground">Пока нет учеников. Добавьте первого — и сможете ставить ему занятия.</p>}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {students.map((s) => {
          const a = attendance(s.id, lessons);
          return (
            <section key={s.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold"><span className={`size-2 shrink-0 rounded-full ${dot[s.color]}`} />{s.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.subject} · {rub(s.price)}/урок {s.phone && `· ${s.phone}`}</p>
                </div>
                <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setEdit(s)}>Изменить</button>
              </div>
              <div className="my-4 grid grid-cols-2 gap-2 rounded-xl bg-background p-3">
                <div><p className="text-xs text-muted-foreground">Посещено</p><p className="font-semibold">{a.attended} из {a.total}</p></div>
                <div><p className="text-xs text-muted-foreground">К оплате</p><p className="font-semibold">{rub(debt(lessons, price, s.id))}</p></div>
              </div>
              <div className="mb-1 flex justify-between text-sm"><span className="text-muted-foreground">Прогресс (посещаемость)</span><span className="font-semibold">{a.percent}%</span></div>
              <div className="h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${a.percent}%` }} /></div>
              <div className="mt-4 rounded-xl border border-dashed border-border p-3 text-xs">
                <p className="text-muted-foreground">Код для ученика и родителя: <b className="font-mono text-sm text-foreground">{s.invite_code}</b></p>
                <p className="mt-1 text-muted-foreground">Ученик: {s.student_user_id ? "подключён ✓" : "не подключён"} · Родитель: {s.parent_user_id ? "подключён ✓" : "не подключён"}</p>
              </div>
            </section>
          );
        })}
      </div>
      {edit && <StudentDialog student={edit === "new" ? null : edit} count={students.length} onClose={() => setEdit(null)} />}
    </main>
  );
}
