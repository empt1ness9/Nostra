import { describe, expect, it } from "vitest";
import { attendance, debt, mondayOf, type RuleLesson } from "@/lib/rules";

const l = (status: string, pay: string, kind = "lesson"): RuleLesson => ({ student_id: "s1", status, pay, kind });
const price = () => 2000;

describe("progress and money rules", () => {
  it("progress is the percent of attended lessons among held or missed ones", () => {
    const list = [l("done", "paid"), l("done", "paid"), l("missed", "unpaid"), l("planned", "unpaid")];
    expect(attendance("s1", list)).toEqual({ attended: 2, total: 3, percent: 67 });
  });
  it("debt includes only held unpaid lessons, never future ones", () => {
    expect(debt([l("done", "unpaid"), l("planned", "unpaid"), l("done", "paid")], price)).toBe(2000);
  });
  it("parent meetings don't count toward progress or debt", () => {
    const list = [l("done", "unpaid", "parent"), l("missed", "unpaid")];
    expect(attendance("s1", list).total).toBe(1);
    expect(debt(list, price)).toBe(0);
  });
  it("week starts on Monday", () => {
    expect(mondayOf("2026-11-26")).toBe("2026-11-23");
    expect(mondayOf("2026-11-29")).toBe("2026-11-23");
  });
});

import { subscriptionPrice } from "@/lib/rules";
describe("subscription", () => {
  it("costs 290 up to 10 students and 500 above", () => {
    expect(subscriptionPrice(10)).toBe(290);
    expect(subscriptionPrice(11)).toBe(500);
  });
});
