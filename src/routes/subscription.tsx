import { createFileRoute } from "@tanstack/react-router";
import { Card, Eyebrow, PageTitle } from "@/components/ui-bits";
import { pageHead } from "@/lib/head";
import { useStudents } from "@/lib/data";
import { subscriptionPrice } from "@/lib/rules";

export const Route = createFileRoute("/subscription")({
  head: pageHead("Подписка", "Тарифы Nostra для репетиторов."),
  component: Subscription,
});

const plans = [
  { title: "До 10 учеников", price: 290, max: 10 },
  { title: "Больше 10 учеников", price: 500, max: Infinity },
];

function Subscription() {
  const { data: students = [] } = useStudents();
  const current = subscriptionPrice(students.length);
  return (
    <main className="mx-auto max-w-[1000px] px-6 py-8">
      <PageTitle>Подписка</PageTitle>
      <p className="mb-6 text-muted-foreground">Сейчас у вас {students.length} учеников — ваш тариф {current} ₽ в месяц. Тариф меняется сам, когда учеников становится больше 10.</p>
      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((p) => (
          <Card key={p.price} className={p.price === current ? "border-primary" : ""}>
            <Eyebrow>{p.price === current ? "Ваш тариф" : "Тариф"}</Eyebrow>
            <h2 className="mt-2 text-lg font-semibold">{p.title}</h2>
            <p className="mt-3 text-4xl font-bold">{p.price} ₽<span className="text-sm font-normal text-muted-foreground"> / месяц</span></p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li>Расписание и ученики</li><li>Кабинеты ученика и родителя</li><li>Чат и финансы</li>
            </ul>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Онлайн-оплата подписки скоро появится.</p>
    </main>
  );
}
