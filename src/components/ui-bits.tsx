import type { ReactNode } from "react";
import type { PayStatus } from "@/lib/rules";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-border bg-card p-6 ${className}`}>{children}</section>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{children}</p>;
}

const payLabel: Record<PayStatus, string> = { paid: "Оплачено", pending: "На проверке", unpaid: "Не оплачено" };
const payCls: Record<PayStatus, string> = {
  paid: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  unpaid: "bg-destructive/15 text-destructive border-destructive/30",
};
export function PayBadge({ status }: { status: PayStatus }) {
  return <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${payCls[status]}`}>{payLabel[status]}</span>;
}

export function PageTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>
      {right}
    </div>
  );
}

export const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-hidden focus:border-ring";
export const btnPrimary = "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
export const btnGhost = "rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1 text-sm"><span className="text-muted-foreground">{label}</span>{children}</label>;
}
