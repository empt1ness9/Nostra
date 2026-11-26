import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card, Field, btnGhost, btnPrimary, inputCls } from "@/components/ui-bits";
import { useAuth } from "@/lib/auth";
import { useTopics, useTutorSettings, type Lesson, type Student } from "@/lib/data";
import { monthReport, parseIso, rub, todayIso, topicProgress } from "@/lib/rules";

export function MonthReport({ students, lessons }: { students: Student[]; lessons: Lesson[] }) {
  const { user, name } = useAuth();
  const { data: settings } = useTutorSettings(user?.id);
  const { data: topics = [] } = useTopics();
  const [sid, setSid] = useState("");
  const [month, setMonth] = useState(todayIso().slice(0, 7));
  const st = students.find((s) => s.id === sid);
  let text = "";
  if (st) {
    const r = monthReport(lessons, st.id, month, st.price);
    const monthName = parseIso(`${month}-01`).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
    const pr = topicProgress(topics.filter((t) => t.student_id === st.id));
    text = `Здравствуйте! Итоги занятий за ${monthName} — ${st.name} (${st.subject}).\n` +
      `Проведено занятий: ${r.held}. Пропусков: ${r.missed}. Переносов: ${r.rescheduled}.\n` +
      `Освоение программы: ${pr}%.\n` +
      `Стоимость проведённых занятий: ${rub(r.total)}. К оплате: ${rub(r.toPay)}. Пропуски не оплачиваются.` +
      (settings && (settings.bank || settings.pay_phone || settings.card)
        ? `\nРеквизиты: ${[settings.bank, settings.pay_phone, settings.card].filter(Boolean).join(", ")}${settings.pay_comment ? `. Комментарий: ${settings.pay_comment}` : ""}.`
        : "") +
      `\n${name}`;
  }
  return (
    <Card className="mt-5">
      <h3 className="font-semibold">Итоговый отчёт за месяц (для отправки)</h3>
      <p className="mb-4 text-sm text-muted-foreground">Считает проведённые занятия, пропуски и переносы и сумму к оплате.</p>
      <div className="mb-3 grid grid-cols-2 gap-3 md:w-1/2">
        <Field label="Ученик"><select value={sid} onChange={(e) => setSid(e.target.value)} className={inputCls}><option value="">Выберите ученика</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label="Месяц"><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} /></Field>
      </div>
      {st && (
        <>
          <textarea readOnly value={text} rows={6} className={inputCls} />
          <div className="mt-3 flex gap-2">
            <button className={btnPrimary} onClick={() => navigator.clipboard.writeText(text).then(() => toast.success("Текст скопирован"))}>Скопировать текст отчёта</button>
            <Link to="/chat" className={btnGhost}>Открыть чат с родителем</Link>
          </div>
        </>
      )}
    </Card>
  );
}
