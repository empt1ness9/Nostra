import { Link } from "@tanstack/react-router";

const tabs = [
  { to: "/", label: "Главная" },
  { to: "/schedule", label: "Расписание" },
  { to: "/students", label: "Ученики" },
  { to: "/finances", label: "Деньги" },
] as const;

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto grid h-14 max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 px-6">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-foreground">
          Nostra
        </Link>
        <nav className="flex justify-center">
          <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: true }}
                className="rounded-lg px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-background text-primary" }}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">АП</span>
          <span className="hidden text-sm font-medium md:inline">Александр П.</span>
        </div>
      </div>
    </header>
  );
}
