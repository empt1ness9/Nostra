import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const tutorTabs = [
  { to: "/", label: "Главная" },
  { to: "/schedule", label: "Расписание" },
  { to: "/students", label: "Ученики" },
  { to: "/finances", label: "Деньги" },
  { to: "/chat", label: "Чат" },
  { to: "/subscription", label: "Подписка" },
] as const;
const familyTabs = [
  { to: "/", label: "Главная" },
  { to: "/schedule", label: "Расписание" },
  { to: "/chat", label: "Чат" },
] as const;
const roleLabel = { tutor: "Репетитор", student: "Ученик", parent: "Родитель" } as const;

export function AppHeader() {
  const { role, name, signOut } = useAuth();
  const tabs = role === "tutor" ? tutorTabs : familyTabs;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto grid h-14 max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 px-6">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-foreground">Nostra</Link>
        <nav className="flex justify-center">
          <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
            {tabs.map((t) => (
              <Link key={t.to} to={t.to} activeOptions={{ exact: true }}
                className="rounded-lg px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-background text-primary" }}>
                {t.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{initials}</span>
          <div className="hidden leading-tight md:block">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-[11px] text-muted-foreground">{role ? roleLabel[role] : ""}</p>
          </div>
          <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground">Выйти</button>
        </div>
      </div>
    </header>
  );
}
