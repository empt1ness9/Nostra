import type { ReactNode } from "react";
import type { PayStatus } from "@/lib/demo-data";

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
