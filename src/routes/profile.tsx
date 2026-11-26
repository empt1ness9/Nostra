import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, Field, PageTitle, btnPrimary, inputCls } from "@/components/ui-bits";
import { pageHead } from "@/lib/head";
import { useAuth } from "@/lib/auth";
import { useQrUrl, useSaveSettings, useTutorSettings } from "@/lib/data";

export const Route = createFileRoute("/profile")({
  head: pageHead("Личный кабинет", "Профиль, реквизиты оплаты и правила работы репетитора."),
  component: Profile,
});

const empty = { bank: "", pay_phone: "", card: "", pay_comment: "", telegram: "", default_minutes: 60, cancel_hours: 24, qr_path: "" };

function Profile() {
  const { user } = useAuth();
  const { data, isLoading } = useTutorSettings(user?.id);
  const save = useSaveSettings();
  const [f, setF] = useState(empty);
  const [name, setName] = useState("");
  const { data: qr } = useQrUrl(f.qr_path || undefined);
  useEffect(() => { if (data) setF({ ...empty, ...data }); }, [data]);
  useEffect(() => {
    if (user) supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({ data: p }) => setName(p?.full_name ?? ""));
  }, [user]);
  const t = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: typeof empty[k] === "number" ? Number(e.target.value) : e.target.value });

  async function upload(file: File) {
    const path = `${user!.id}/qr-${Date.now()}`;
    const { error } = await supabase.storage.from("qr").upload(path, file);
    if (error) { toast.error("Не удалось загрузить картинку"); return; }
    const next = { ...f, qr_path: path };
    setF(next);
    save.mutate(next, { onSuccess: () => toast.success("QR-код загружен") });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("profiles").update({ full_name: name }).eq("id", user!.id);
    save.mutate(f, { onSuccess: () => toast.success("Сохранено"), onError: (er) => toast.error(er.message) });
  }

  if (isLoading) return null;
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-8">
      <PageTitle>Личный кабинет репетитора</PageTitle>
      <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
        <Card className="grid content-start gap-3">
          <h3 className="font-semibold">Профиль и занятия</h3>
          <Field label="Как к вам обращаться"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
          <Field label="Telegram / мессенджер"><input value={f.telegram} onChange={t("telegram")} placeholder="@username" className={inputCls} /></Field>
          <Field label="Длительность урока по умолчанию"><select value={f.default_minutes} onChange={t("default_minutes")} className={inputCls}>
            <option value={45}>45 мин</option><option value={60}>60 мин</option><option value={90}>90 мин</option></select></Field>
          <Field label="Бесплатная отмена / перенос не позднее чем за"><select value={f.cancel_hours} onChange={t("cancel_hours")} className={inputCls}>
            <option value={3}>3 часа</option><option value={12}>12 часов</option><option value={24}>24 часа</option><option value={48}>48 часов</option></select></Field>
        </Card>
        <Card className="grid content-start gap-3">
          <h3 className="font-semibold">Реквизиты оплаты</h3>
          <p className="text-xs text-muted-foreground">Родители видят их в своём кабинете, а ещё они попадают в отчёт за месяц.</p>
          <Field label="Банк / СБП"><input value={f.bank} onChange={t("bank")} placeholder="Т-Банк" className={inputCls} /></Field>
          <Field label="Телефон для СБП"><input value={f.pay_phone} onChange={t("pay_phone")} className={inputCls} /></Field>
          <Field label="Номер карты (необязательно)"><input value={f.card} onChange={t("card")} className={inputCls} /></Field>
          <Field label="Назначение / комментарий к переводу"><input value={f.pay_comment} onChange={t("pay_comment")} className={inputCls} /></Field>
        </Card>
        <Card className="md:col-span-2">
          <h3 className="font-semibold">QR-код для оплаты</h3>
          <p className="mb-4 text-xs text-muted-foreground">Картинка из вашего банка для быстрой оплаты — родитель увидит её при оплате.</p>
          <div className="flex items-center gap-6">
            {qr ? <img src={qr} alt="QR-код для оплаты" className="size-36 rounded-xl bg-white object-contain p-2" /> : <div className="grid size-36 place-items-center rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">QR-код ещё не загружен</div>}
            <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">
              Загрузить QR-код
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          </div>
        </Card>
        <div className="md:col-span-2"><button className={btnPrimary} disabled={save.isPending}>Сохранить</button></div>
      </form>
    </main>
  );
}
