import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageTitle, btnPrimary, inputCls } from "@/components/ui-bits";
import { pageHead } from "@/lib/head";
import { useAuth } from "@/lib/auth";
import { useMessages, useSendMessage, useStudents } from "@/lib/data";

export const Route = createFileRoute("/chat")({
  head: pageHead("Чат", "Переписка репетитора с учеником и родителем."),
  component: Chat,
});

function Chat() {
  const { user, role } = useAuth();
  const { data: students = [] } = useStudents();
  const [sel, setSel] = useState<string | null>(null);
  const active = sel ?? students[0]?.id ?? null;
  const { data: messages = [] } = useMessages(active);
  const send = useSendMessage();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [messages.length]);

  if (students.length === 0)
    return <main className="mx-auto max-w-[1440px] px-6 py-8"><PageTitle>Чат</PageTitle><p className="text-muted-foreground">{role === "tutor" ? "Добавьте ученика, чтобы начать переписку." : "Подключитесь к репетитору по коду на главной странице."}</p></main>;

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <PageTitle>Чат</PageTitle>
      <div className="grid h-[70vh] grid-cols-[260px_1fr] overflow-hidden rounded-2xl border border-border bg-card">
        <aside className="overflow-y-auto border-r border-border">
          {students.map((s) => (
            <button key={s.id} onClick={() => setSel(s.id)} className={`block w-full border-b border-border px-4 py-3 text-left ${active === s.id ? "bg-secondary" : "hover:bg-secondary/50"}`}>
              <p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.subject}</p>
            </button>
          ))}
        </aside>
        <section className="flex min-h-0 flex-col">
          <p className="border-b border-border px-5 py-3 text-xs text-muted-foreground">Общий чат: репетитор, ученик и родитель</p>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.length === 0 && <p className="text-sm text-muted-foreground">Сообщений пока нет.</p>}
            {messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${mine ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {!mine && <p className="mb-0.5 text-xs font-semibold opacity-70">{m.sender_name}</p>}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="mt-1 text-right text-[10px] opacity-60">{new Date(m.created_at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              );
            })}
            <div ref={end} />
          </div>
          <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); const b = text.trim(); if (!b || !active) return; send.mutate({ studentId: active, body: b }); setText(""); }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Сообщение…" className={inputCls} />
            <button className={btnPrimary} disabled={send.isPending}>Отправить</button>
          </form>
        </section>
      </div>
    </main>
  );
}
