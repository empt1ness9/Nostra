import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, btnGhost, btnPrimary, inputCls } from "@/components/ui-bits";
import { useLessonMutations, useTutorSettings, type Lesson, type Student } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { addDays, plusMinutes } from "@/lib/rules";

export function LessonDialog({ open, onClose, students, lesson, date }: {
  open: boolean; onClose: () => void; students: Student[]; lesson: Lesson | null; date: string;
}) {
  const m = useLessonMutations();
  const { user } = useAuth();
  const { data: settings } = useTutorSettings(user?.id);
  const dur = settings?.default_minutes ?? 60;
  const [f, setF] = useState({
    student_id: lesson?.student_id ?? students[0]?.id ?? "",
    date: lesson?.date ?? date,
    start_time: lesson?.start_time ?? "16:00",
    end_time: lesson?.end_time ?? plusMinutes("16:00", dur),
    title: lesson?.title ?? "",
    kind: lesson?.kind ?? "lesson",
    status: lesson?.status ?? "planned",
    pay: lesson?.pay ?? "unpaid",
    homework: lesson?.homework ?? "",
    repeat: 1,
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: k === "repeat" ? Number(e.target.value) : e.target.value });
  const done = { onSuccess: () => { toast.success("Сохранено"); onClose(); }, onError: (e: Error) => toast.error(e.message) };

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (f.end_time <= f.start_time) { toast.error("Конец должен быть позже начала"); return; }
    const { repeat, ...row } = f;
    if (lesson) m.update.mutate({ id: lesson.id, ...row }, done);
    else m.add.mutate(Array.from({ length: repeat }, (_, i) => ({ ...row, date: addDays(row.date, i * 7) })), done);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{lesson ? "Занятие" : "Новое занятие"}</DialogTitle></DialogHeader>
        {students.length === 0 ? <p className="text-sm text-muted-foreground">Сначала добавьте ученика в разделе «Ученики».</p> : (
          <form onSubmit={save} className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ученик"><select value={f.student_id} onChange={set("student_id")} className={inputCls}>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
              <Field label="Тип"><select value={f.kind} onChange={set("kind")} className={inputCls}><option value="lesson">Урок</option><option value="parent">Час с родителем</option></select></Field>
            </div>
            <Field label="Тема"><input value={f.title} onChange={set("title")} placeholder="Например, Логарифмы" className={inputCls} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Дата"><input type="date" required value={f.date} onChange={set("date")} className={inputCls} /></Field>
              <Field label="Начало"><input type="time" required value={f.start_time} onChange={set("start_time")} className={inputCls} /></Field>
              <Field label="Конец"><input type="time" required value={f.end_time} onChange={set("end_time")} className={inputCls} /></Field>
            </div>
            <div className="flex gap-2 text-xs">
              {[45, 60, 90].map((n) => <button type="button" key={n} className="rounded-md border border-border px-2 py-1 hover:bg-secondary" onClick={() => setF({ ...f, end_time: plusMinutes(f.start_time, n) })}>{n} мин</button>)}
            </div>
            <Field label="Домашнее задание"><textarea value={f.homework} onChange={(e) => setF({ ...f, homework: e.target.value })} rows={2} className={inputCls} /></Field>
            {lesson ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Статус"><select value={f.status} onChange={set("status")} className={inputCls}>
                  <option value="planned">Запланировано</option><option value="done">Проведено</option><option value="missed">Пропуск</option><option value="rescheduled">Перенос</option></select></Field>
                <Field label="Оплата"><select value={f.pay} onChange={set("pay")} className={inputCls}>
                  <option value="unpaid">Не оплачено</option><option value="pending">На проверке</option><option value="paid">Оплачено</option></select></Field>
              </div>
            ) : (
              <Field label="Повторять каждую неделю"><select value={f.repeat} onChange={set("repeat")} className={inputCls}>
                <option value={1}>Не повторять</option><option value={4}>4 недели</option><option value={8}>8 недель</option><option value={16}>16 недель</option></select></Field>
            )}
            <div className="mt-2 flex justify-between gap-2">
              {lesson ? <button type="button" className="text-sm text-destructive" onClick={() => m.remove.mutate(lesson.id, done)}>Удалить</button> : <span />}
              <div className="flex gap-2"><button type="button" className={btnGhost} onClick={onClose}>Отмена</button><button className={btnPrimary}>Сохранить</button></div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
