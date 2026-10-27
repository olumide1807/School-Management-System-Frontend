// @vitest-environment node
// The grading sheet's copy of the report card's rules. The cases are the
// server's (SMS-main test/buildClassReport.test.js), so a difference
// between the two shows up here.
import { describe, expect, test } from "vitest";
import { bandFor, hasScorePrecision, roundScore } from "./reportMarks";

const BANDS = [
  { grade: "A", from: 70 }, { grade: "B", from: 60 }, { grade: "C", from: 50 },
  { grade: "D", from: 45 }, { grade: "E", from: 40 }, { grade: "F", from: 0 },
];
const grade = (total: number) => bandFor(BANDS, total, (b) => b.from)?.grade ?? null;

describe("bandFor", () => {
  test.each([
    [100, "A"], [70, "A"], [69, "B"], [60, "B"], [59, "C"], [50, "C"], [49, "D"], [45, "D"], [44, "E"], [40, "E"], [39, "F"], [0, "F"],
  ])("a total of %s is %s", (total, g) => {
    expect(grade(total)).toBe(g);
  });

  test.each([[69.5, "B"], [59.5, "C"], [49.9, "D"], [39.5, "F"], [99.5, "A"]])("a decimal total between bands (%s) gets the band below: %s", (total, g) => {
    expect(grade(total)).toBe(g);
  });

  test("order doesn't matter; overlapping bands go to the higher lower bound", () => {
    expect(bandFor([...BANDS].reverse(), 69.5, (b) => b.from)?.grade).toBe("B");
    expect(bandFor([{ g: "wide", from: 50 }, { g: "narrow", from: 65 }], 70, (b) => b.from)?.g).toBe("narrow");
  });

  test("below every band, or no value: none", () => {
    expect(bandFor([{ from: 40 }], 39.9, (b) => b.from)).toBeNull();
    expect(bandFor(BANDS, null, (b) => b.from)).toBeNull();
    expect(bandFor([] as { from: number }[], 50, (b) => b.from)).toBeNull();
  });
});

describe("one decimal place", () => {
  test("totals round to it: 12.1 + 50.2 is 62.3", () => {
    expect(12.1 + 50.2).not.toBe(62.3);
    expect(roundScore(12.1 + 50.2)).toBe(62.3);
    expect(roundScore(0.1 + 0.2 + 60.4)).toBe(60.7);
  });

  test.each([[12, true], [12.5, true], [0.1, true], [62.3, true], [12.25, false], [0.05, false], [33.333, false]])("%s is a valid mark: %s", (n, ok) => {
    expect(hasScorePrecision(n)).toBe(ok);
  });
});
