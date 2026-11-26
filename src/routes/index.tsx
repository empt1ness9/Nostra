import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/head";
import { useAuth } from "@/lib/auth";
import { TutorHome } from "@/components/cabinets/TutorHome";
import { FamilyHome } from "@/components/cabinets/FamilyHome";

export const Route = createFileRoute("/")({
  head: pageHead("Главная", "Рабочий день репетитора, ученика или родителя в Nostra."),
  component: Home,
});

function Home() {
  const { role } = useAuth();
  return role === "tutor" ? <TutorHome /> : <FamilyHome />;
}
