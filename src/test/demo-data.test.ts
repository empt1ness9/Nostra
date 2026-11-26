import { describe, expect, it } from "vitest";
import { attendance, debt, type Lesson } from "@/lib/demo-data";

const base = { studentId: "s1", date: "2026-11-01", start: "10:00", end: "11:00", title: "x" } as const;
const l = (id: string, status: Lesson["status"], pay: Lesson["pay"]): Lesson => ({ ...base, id, status, pay });

describe("progress and money rules", () => {
  it("progress is the percent of attended lessons among held or missed ones", () => {
    const list = [l("a", "done", "paid"), l("b", "done", "paid"), l("c", "missed", "unpaid"), l("d", "planned", "unpaid")];
    expect(attendance("s1", list)).toEqual({ attended: 2, total: 3, percent: 67 });
  });
  it("debt includes only held unpaid lessons, never future ones", () => {
    const list = [l("a", "done", "unpaid"), l("b", "planned", "unpaid"), l("c", "done", "paid")];
    expect(debt(list)).toBe(2000);
  });
});
