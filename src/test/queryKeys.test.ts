// @vitest-environment node
// CLAUDE.md §3: a key identifies one shape. Two queries under one key that
// call different endpoints, or return different parts of the response,
// cache different shapes under it — whichever loads last decides what every
// reader gets. That has crashed this app three times (the first one, then
// ["all-subjects"] and ["timetable-grid", armId] in the October sweep).
import path from "node:path";
import { describe, expect, test } from "vitest";
import { collectQueryDefs, type QueryDef } from "./queryKeys";

const defs = collectQueryDefs(path.resolve(__dirname, ".."));
const byPrefix = new Map<string, QueryDef[]>();
for (const d of defs) byPrefix.set(d.prefix, [...(byPrefix.get(d.prefix) || []), d]);

const describeDefs = (ds: QueryDef[]) =>
  ds.map((d) => `  ${d.where}  ${d.key}\n    ${d.endpoints.join(" + ")} → return ${d.returns.join(" | ")}`).join("\n");

// The older hooks in services/api-call.ts that cache the whole axios
// response. Allowed only because nothing else uses these keys.
const LEGACY_WHOLE_RESPONSE = ["classes", "class-arms", "session", "all-session", "account-details", "annoucement"];

describe("React Query keys", () => {
  test("the scan finds the app's queries, and can read every one", () => {
    expect(defs.length).toBeGreaterThan(100);
    const unread = defs.filter((d) => d.endpoints.length === 0 || d.returns.length === 0);
    // If this fails, a queryFn is written in a form the scanner can't read —
    // extend src/test/queryKeys.ts rather than letting it go unchecked
    expect(unread.map((d) => `${d.where} ${d.key}`)).toEqual([]);
  });

  test("every query sharing a key calls the same endpoint", () => {
    const clashes = [...byPrefix].filter(([, ds]) => new Set(ds.map((d) => d.endpoints.join(" + "))).size > 1);
    expect(clashes.map(([p, ds]) => `"${p}" is used for different endpoints:\n${describeDefs(ds)}`)).toEqual([]);
  });

  test("every query sharing a key returns the same part of the response", () => {
    const clashes = [...byPrefix].filter(([, ds]) => new Set(ds.map((d) => d.returns.join(" | "))).size > 1);
    expect(clashes.map(([p, ds]) => `"${p}" caches different shapes:\n${describeDefs(ds)}`)).toEqual([]);
  });

  test("only the six legacy keys cache the whole axios response, and each has exactly one query", () => {
    // `return data` / `return res` straight from SERVER.get is the whole response
    const whole = defs.filter((d) => d.returns.some((r) => /^(await )?(data|res|response)$|^await SERVER\./.test(r)));
    expect([...new Set(whole.map((d) => d.prefix))].sort()).toEqual([...LEGACY_WHOLE_RESPONSE].sort());
    for (const key of LEGACY_WHOLE_RESPONSE) {
      expect(byPrefix.get(key)?.length, `a second query was added under legacy key "${key}"`).toBe(1);
    }
  });

  test("the keys fixed in the October sweep cache the body", () => {
    for (const key of ["all-subjects", "timetable-grid"]) {
      const ds = byPrefix.get(key) || [];
      expect(ds.length).toBeGreaterThan(0);
      expect(new Set(ds.flatMap((d) => d.returns))).toEqual(new Set(["res?.data"]));
    }
  });

  test("the student portal's attendance and the staff view of a student's records don't share a key", () => {
    // They once both used "student-attendance" for different endpoints
    expect(byPrefix.has("student-attendance")).toBe(false);
    const portal = byPrefix.get("student-portal-attendance") || [];
    const records = byPrefix.get("student-attendance-records") || [];
    expect(portal.length).toBeGreaterThan(0);
    expect(records.length).toBeGreaterThan(0);
    expect(portal[0].endpoints).not.toEqual(records[0].endpoints);
  });
});
