import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { PENDING_TYPE_KEY, type Role } from "@/lib/auth";
import { Field, btnPrimary, inputCls } from "@/components/ui-bits";

const types: { id: Role; label: string; hint: string }[] = [
  { id: "tutor", label: "Репетитор", hint: "веду учеников" },
  { id: "student", label: "Ученик", hint: "занимаюсь" },
  { id: "parent", label: "Родитель", hint: "слежу и оплачиваю" },
];

export function AuthScreen() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [type, setType] = useState<Role>("tutor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("Неверная почта или пароль");
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name, account_type: type } },
      });
      if (error) toast.error(error.message); else setSent(true);
    }
    setBusy(false);
  }

  async function google() {
    if (mode === "up") localStorage.setItem(PENDING_TYPE_KEY, type);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Не удалось войти через Google");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <p className="font-display text-3xl font-bold">Nostra</p>
        <p className="mt-1 text-sm text-muted-foreground">Платформа для репетиторов, учеников и родителей</p>
        {sent ? (
          <p className="mt-8 rounded-xl bg-secondary p-4 text-sm">Мы отправили письмо на <b>{email}</b>. Откройте его и нажмите ссылку, чтобы подтвердить аккаунт.</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-background p-1">
              {(["in", "up"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`rounded-lg py-2 text-sm font-medium ${mode === m ? "bg-card text-primary" : "text-muted-foreground"}`}>
                  {m === "in" ? "Вход" : "Регистрация"}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="mt-6 grid gap-4">
              {mode === "up" && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {types.map((t) => (
                      <button type="button" key={t.id} onClick={() => setType(t.id)} className={`rounded-xl border p-3 text-left ${type === t.id ? "border-primary bg-primary/10" : "border-border"}`}>
                        <p className="text-sm font-semibold">{t.label}</p><p className="text-[11px] text-muted-foreground">{t.hint}</p>
                      </button>
                    ))}
                  </div>
                  <Field label="Имя и фамилия"><input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
                </>
              )}
              <Field label="Почта"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
              <Field label="Пароль"><input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} /></Field>
              <button disabled={busy} className={btnPrimary}>{mode === "in" ? "Войти" : "Создать аккаунт"}</button>
            </form>
            <button onClick={google} className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#8E918F] bg-[#131314] px-3 py-2 text-sm font-medium text-[#E3E3E3]">
              <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.730-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.240 0 10.060 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
              Продолжить с Google
            </button>
          </>
        )}
      </div>
    </main>
  );
}
