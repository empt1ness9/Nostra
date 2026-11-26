import { useState } from "react";
import { useTopicMutations, type Topic } from "@/lib/data";
import { topicProgress } from "@/lib/rules";

export function TopicsBlock({ studentId, topics, editable }: { studentId: string; topics: Topic[]; editable: boolean }) {
  const m = useTopicMutations();
  const [title, setTitle] = useState("");
  const pct = topicProgress(topics);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span className="text-muted-foreground">Освоение программы (по темам)</span><span className="font-semibold">{pct}%</span></div>
      <div className="mb-3 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-success" style={{ width: `${pct}%` }} /></div>
      {topics.length === 0 && <p className="text-xs text-muted-foreground">Темы пока не добавлены.</p>}
      <ul className="space-y-1">
        {topics.map((t) => (
          <li key={t.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={t.done} disabled={!editable} onChange={() => m.toggle.mutate({ id: t.id, done: !t.done })} className="accent-[var(--primary)]" />
            <span className={`flex-1 ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
            {editable && <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => m.remove.mutate(t.id)} aria-label="Удалить тему">✕</button>}
          </li>
        ))}
      </ul>
      {editable && (
        <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (title.trim()) m.add.mutate([{ student_id: studentId, title: title.trim() }], { onSuccess: () => setTitle("") }); }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новая тема" className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
          <button className="rounded-md border border-border px-2 text-sm hover:bg-secondary">+ Тема</button>
        </form>
      )}
    </div>
  );
}
