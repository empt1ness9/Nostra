import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card, Eyebrow, PageTitle, PayBadge, btnPrimary, inputCls } from "@/components/ui-bits";
import { useAuth } from "@/lib/auth";
import { TopicsBlock } from "@/components/TopicsBlock";
import { useMarkHomework, useQrUrl, useTopics, useTutorSettings, priceMap, useLessonMutations, useLessons, useSendMessage, useStudentMutations, useStudents } from "@/lib/data";
import { attendance, debt, fmtDay, rub, todayIso, type PayStatus } from "@/lib/rules";

function LinkCard() {
  const { role } = useAuth();
  const [code, setCode] = useState("");
  const { claim } = useStudentMutations();
  return (
    <Card className="max-w-lg">
      <Eyebrow>Подключение</Eyebrow>
      <h2 className="mt-2 text-lg font-semibold">Введите код от репетитора</h2>
      <p className="mt-1 text-sm text-muted-foreground">Репетитор видит код в карточке {role === "parent" ? "вашего ребёнка" : "ученика"} в разделе «Ученики».</p>
      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); claim.mutate(code, { onSuccess: () => { toast.success("Готово, вы подключены"); setCode(""); }, onError: (er) => toast.error(er.message) }); }}>
        <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Например, A1B2C3" className={inputCls} />
        <button disabled={claim.isPending} className={btnPrimary}>Подключить</button>
      </form>
    </Card>
  );
}

function Requisites({ tutorId }: { tutorId: string }) {
  const { data: s } = useTutorSettings(tutorId);
  const { data: qr } = useQrUrl(s?.qr_path || undefined);
  if (!s || !(s.bank || s.pay_phone || s.card || s.qr_path)) return null;
  return (
    <div className="mb-4 flex items-center gap-5 rounded-xl bg-background p-4 text-sm">
      {qr && <img src={qr} alt="QR-код для оплаты" className="size-28 rounded-lg bg-white object-contain p-1" />}
      <div className="space-y-1">
        <p className="font-semibold">Реквизиты репетитора</p>
        {s.bank && <p>Банк: {s.bank}</p>}
        {s.pay_phone && <p>СБП: {s.pay_phone}</p>}
        {s.card && <p>Карта: {s.card}</p>}
        {s.pay_comment && <p className="text-muted-foreground">Комментарий: {s.pay_comment}</p>}
      </div>
    </div>
  );
}

export function FamilyHome() {
  const { role } = useAuth();
  const { data: students = [], isLoading } = useStudents();
  const { data: lessons = [] } = useLessons();
  const { parentPaid } = useLessonMutations();
  const send = useSendMessage();
  const { data: topics = [] } = useTopics();
  const hw = useMarkHomework();
  const today = todayIso();
  const price = priceMap(students);

  if (isLoading) return null;
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <PageTitle>{role === "parent" ? "Кабинет родителя" : "Мой кабинет"}</PageTitle>
      {students.length === 0 && <LinkCard />}
      {students.map((s) => {
        const mine = lessons.filter((l) => l.student_id === s.id);
        const a = attendance(s.id, mine);
        const upcoming = mine.filter((l) => l.status === "planned" && l.date >= today).slice(0, 5);
        const homework = mine.filter((l) => l.homework.trim()).slice(-5).reverse();
        const toPay = mine.filter((l) => l.status === "done" && l.pay !== "paid" && l.kind !== "parent");
        return (
          <div key={s.id} className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">{s.name} · <span className="text-muted-foreground">{s.subject}</span></h2>
            <div className="grid gap-5 md:grid-cols-3">
              <Card>
                <Eyebrow>Прогресс</Eyebrow>
                <p className="mt-3 text-4xl font-bold">{a.percent}%</p>
                <p className="text-sm text-muted-foreground">посещено {a.attended} из {a.total} занятий</p>
                <div className="mt-4 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${a.percent}%` }} /></div>
              </Card>
              <Card>
                <Eyebrow>Ближайшие занятия</Eyebrow>
                {upcoming.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Пока ничего не запланировано.</p>}
                {upcoming.map((l) => (
                  <div key={l.id} className="mt-3 flex gap-3 text-sm">
                    <span className="font-semibold text-primary">{fmtDay(l.date)} {l.start_time}</span>
                    <span className="truncate">{l.kind === "parent" ? "Встреча с родителем" : l.title}</span>
                  </div>
                ))}
                <Link to="/schedule" className="mt-4 inline-block text-sm text-primary">Всё расписание →</Link>
              </Card>
              <Card>
                <Eyebrow>{role === "parent" ? "К оплате" : "Связь"}</Eyebrow>
                {role === "parent" ? (
                  <>
                    <p className="mt-3 text-4xl font-bold">{rub(debt(mine, price))}</p>
                    <p className="text-sm text-muted-foreground">{rub(s.price)} за занятие</p>
                    <button className="mt-4 text-sm text-primary" disabled={send.isPending}
                      onClick={() => send.mutate({ studentId: s.id, body: "Здравствуйте! Хотел(а) бы договориться об отдельной встрече с вами на час." }, { onSuccess: () => toast.success("Запрос отправлен в чат") })}>
                      Попросить встречу с репетитором →
                    </button>
                  </>
                ) : (
                  <Link to="/chat" className="mt-3 inline-block text-sm text-primary">Написать репетитору →</Link>
                )}
              </Card>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Card><h3 className="mb-3 font-semibold">Темы обучения</h3><TopicsBlock studentId={s.id} topics={topics.filter((t) => t.student_id === s.id)} editable={false} /></Card>
              <Card>
                <h3 className="mb-3 font-semibold">Домашние задания</h3>
                {homework.length === 0 && <p className="text-sm text-muted-foreground">Новых заданий пока нет.</p>}
                {homework.map((l) => (
                  <div key={l.id} className="border-b border-border py-2 last:border-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">{fmtDay(l.date)} · {l.title}</p>
                      {role === "student" ? (
                        <button className={`text-xs ${l.homework_done ? "text-success" : "text-primary"}`} onClick={() => hw.mutate({ id: l.id, done: !l.homework_done })}>{l.homework_done ? "Сдано ✓" : "Отметить сдачу"}</button>
                      ) : <span className={`text-xs ${l.homework_done ? "text-success" : "text-muted-foreground"}`}>{l.homework_done ? "Сдано ✓" : "Не сдано"}</span>}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{l.homework}</p>
                  </div>
                ))}
              </Card>
            </div>
            {role === "parent" && toPay.length > 0 && (
              <Card className="mt-5">
                <h3 className="mb-2 font-semibold">Оплата занятий</h3>
                <Requisites tutorId={s.tutor_id} />
                <p className="mb-4 text-sm text-muted-foreground">Переведите деньги репетитору удобным способом и нажмите «Я оплатил» — репетитор подтвердит.</p>
                {toPay.map((l) => (
                  <div key={l.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-4 border-b border-border py-3 last:border-0">
                    <div className="min-w-0"><p className="text-sm font-medium">{l.title || "Занятие"}</p><p className="text-xs text-muted-foreground">{fmtDay(l.date)}</p></div>
                    <PayBadge status={l.pay as PayStatus} />
                    <span className="font-semibold">{rub(s.price)}</span>
                    {l.pay === "unpaid" ? (
                      <button className={btnPrimary} onClick={() => parentPaid.mutate(l.id, { onSuccess: () => toast.success("Отправлено репетитору на проверку") })}>Я оплатил</button>
                    ) : <span className="w-[98px]" />}
                  </div>
                ))}
              </Card>
            )}
          </div>
        );
      })}
      {students.length > 0 && role === "parent" && <details className="text-sm text-muted-foreground"><summary className="cursor-pointer">Подключить ещё одного ребёнка</summary><div className="mt-3"><LinkCard /></div></details>}
    </main>
  );
}
