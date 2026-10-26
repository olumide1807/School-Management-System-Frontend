// The portal calendar for students and parents. Whether a day has school
// is the entry's closesSchool flag — the same flag the register and the
// auto-marker go by — never its type. A sports day is a school day.
import { describe, expect, test } from "vitest";
import { renderText } from "../../../test/dom";
import SchoolCalendarView from "./SchoolCalendarView";

// Dates relative to today, as the UTC day-starts the API sends
const n = new Date();
const today = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
const day = (offset: number) => new Date(today + offset * 86400000).toISOString();
const long = (offset: number) =>
  new Date(today + offset * 86400000).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const term = { termId: "T1", termName: "First Term", startDate: day(-40), endDate: day(40), isCurrent: true };
const session = { sessionId: "S1", sessionName: "2026/2027", startDate: day(-40), endDate: day(250) };
const base = { term, session, terms: [term, { termId: "T2", termName: "Second Term", startDate: day(60), endDate: day(150), isCurrent: false }], calendarSetUp: true };
const E = (id: string, name: string, type: string, s: number, e = s, closesSchool?: boolean) =>
  ({ _id: id, name, type, startDate: day(s), endDate: day(e), ...(closesSchool === undefined ? {} : { closesSchool }) });
const view = (entries: any[], extra: any = {}) => renderText(<SchoolCalendarView data={{ ...base, entries, ...extra }} />);
// One listed row's text: from its name to its "Day off" / "At school" badge
const row = (t: string, name: string) => {
  const list = t.slice(t.indexOf("Rest of") >= 0 ? t.indexOf("Rest of") : 0);
  return list.slice(list.indexOf(name)).match(/^.*?(Day off|At school)/)?.[0] || "";
};

describe("portal calendar: days off and days at school", () => {
  test("a sports day that doesn't close the school is never the next day off", () => {
    const t = view([E("c", "Inter-house sports", "school_event", 5, 5, false), E("d", "Mid-term break", "school_break", 20, 24, true)]);
    expect(t).toContain("Next day off Mid-term break");
    expect(t).not.toMatch(/Next day off Inter-house/);
    expect(t).toContain(`On at school · school is open Inter-house sports ${long(5)} · in 5 days`);
  });

  test("each row says whether there's school", () => {
    const t = view([E("c", "Inter-house sports", "school_event", 5, 5, false), E("d", "Mid-term break", "school_break", 20, 24, true)]);
    expect(row(t, "Inter-house sports")).toContain("School is open as usual");
    expect(row(t, "Inter-house sports")).toMatch(/At school$/);
    expect(row(t, "Mid-term break")).toContain(" · No school ");
    expect(row(t, "Mid-term break")).toMatch(/Day off$/);
    expect(t).not.toContain("no school on any of the days");
  });

  test("an event today isn't 'No school now'; a closure today is", () => {
    const event = view([E("c", "Sports day", "school_event", 0, 0, false), E("d", "Break", "school_break", 10, 10, true)]);
    expect(event).not.toContain("No school now");
    expect(event).toContain("On at school · school is open Sports day Today");
    expect(event).toContain("Next day off Break");

    const closed = view([E("x", "Staff training", "other", -1, 1, true)]);
    expect(closed).toContain("No school now Staff training");
    expect(closed).toContain("Closure Day off");
  });

  test("only events left: no next day off", () => {
    const t = view([E("c", "Prize giving", "other", 7, 7, false)]);
    expect(t).not.toContain("Next day off");
    expect(t).toContain("No more days off this session.");
    expect(t).toContain("Event At school");
    expect(t).not.toContain("Closure");
  });

  test("an entry with no closesSchool counts as a day off, as it does on the server", () => {
    const t = view([E("u", "Old entry", "school_event", 4, 4)]);
    expect(t).toContain("Next day off Old entry");
    expect(t).not.toContain("On at school");
  });
});

describe("portal calendar: layout and empty states", () => {
  const full = view([
    E("a", "Resumption prep", "other", -45, -38),
    E("b", "Independence Day", "public_holiday", -10),
    E("c", "Inter-house sports", "school_event", 5),
    E("d", "Mid-term break", "school_break", 20, 24),
    E("e", "Easter break", "school_break", 120, 130),
  ]);

  test("leads with when the term ends and the next term starts", () => {
    expect(full).toContain("School calendar First Term, 2026/2027");
    expect(full).toContain(`First Term ends ${long(40)} · in 40 days`);
    expect(full).toContain(`Second Term starts ${long(60)}`);
    expect(full.indexOf("Coming up")).toBeLessThan(full.indexOf("Rest of First Term"));
  });

  test("rest of the term, later this session, then earlier this session last", () => {
    const rest = full.indexOf("Rest of First Term"), later = full.indexOf("Later this session"), earlier = full.indexOf("Earlier this session");
    expect(rest).toBeLessThan(full.indexOf("Inter-house sports", rest));
    expect(full.indexOf("Inter-house sports", rest)).toBeLessThan(full.indexOf("Mid-term break", rest));
    expect(later).toBeLessThan(full.indexOf("Easter break"));
    expect(earlier).toBeGreaterThan(later);
    expect(full.indexOf("Independence Day")).toBeGreaterThan(earlier);
  });

  test("no days off left / calendar not set up / nothing this session each say so", () => {
    expect(view([E("b", "Independence Day", "public_holiday", -10)])).toContain("No more days off this session.");
    const notSetUp = view([], { calendarSetUp: false });
    expect(notSetUp).toContain("The school hasn't set up its calendar yet, so no holidays or events are listed.");
    expect(notSetUp).toContain("First Term ends");
    expect(notSetUp).not.toContain("On at school");
    expect(view([])).toContain("No holidays or events are recorded for 2026/2027.");
  });

  test("no term or session: says the term isn't set up", () => {
    const t = renderText(<SchoolCalendarView data={{ term: null, session: null, terms: [], entries: [] }} />);
    expect(t).toContain("The school hasn't set up the current term yet");
  });
});
