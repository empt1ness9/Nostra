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

import { monthReport, plusMinutes, topicProgress } from "@/lib/rules";
describe("topics and monthly report", () => {
  it("topic progress is the share of closed topics", () => {
    expect(topicProgress([{ done: true }, { done: false }, { done: false }, { done: true }])).toBe(50);
  });
  it("month report counts held lessons, charges only held ones", () => {
    const L = (date: string, status: string, pay: string) => ({ student_id: "s1", kind: "lesson", date, status, pay });
    const r = monthReport([L("2026-11-02", "done", "paid"), L("2026-11-09", "done", "unpaid"), L("2026-11-16", "missed", "unpaid"), L("2026-12-01", "done", "unpaid")], "s1", "2026-11", 2000);
    expect(r).toEqual({ held: 2, missed: 1, rescheduled: 0, total: 4000, toPay: 2000 });
  });
  it("adds lesson duration to start time", () => {
    expect(plusMinutes("16:30", 90)).toBe("18:00");
  });
});
