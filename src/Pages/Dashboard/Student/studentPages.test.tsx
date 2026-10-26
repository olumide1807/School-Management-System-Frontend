// The student portal pages were split into a container (fetching) and a
// view (rendering), so the parent's child pages could reuse the views.
// The split was checked to render byte-for-byte what the pages rendered
// before it, in every state below; the snapshots in __snapshots__ are that
// output. A change to them is a change to what students see — review it
// as one, and update with `npx vitest run -u` only once it's intended.
//
// The second half holds the point of the split: a parent sees their
// child's report card and attendance exactly as the child does.
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { setQueries } from "../../../test/queryStub";
import Results from "./Results";
import Attendance from "./Attendance";
import Profile from "./Profile";
import ChildResults from "../Parent/ChildResults";
import ChildAttendance from "../Parent/ChildAttendance";
import ChildProfile from "../Parent/ChildProfile";

vi.mock("@tanstack/react-query", () => import("../../../test/queryStub"));
vi.mock("../../../Utils/server", () => import("../../../test/serverStub"));

const err404 = { response: { status: 404 } };
const err500 = { response: { status: 500 } };

const report = {
  classArm: { armName: "a" }, formTeacher: { name: "Mrs Ade" },
  term: { termName: "First Term" }, session: { sessionName: "2026/2027" },
  assessments: [{ name: "CA 1", maxScore: 40 }, { name: "Exam", maxScore: 60 }],
  subjects: [{ subjectId: "s1", subjectName: "Maths", stats: { highest: 90, lowest: 40, average: 65.5, count: 30 } }],
  gradeBands: [{ grade: "A", remark: "Excellent", from: 70, to: 100 }],
  mine: {
    student: { _id: "k1", firstName: "Tobi", surName: "Ade" },
    subjects: [{ subjectId: "s1", subjectName: "Maths", entered: true, complete: true, scores: [{ name: "CA 1", maxScore: 40, score: 33 }, { name: "Exam", maxScore: 60, score: 50 }], Total: 83, grade: "A", remark: "Excellent", position: 2 }],
    summary: { totalScore: 83, average: 83, subjectsGraded: 1, subjectsOffered: 1, position: 2, outOf: 30 },
    attendance: { present: 40, absent: 2, total: 42, autoMarked: 1, mark: null },
    comments: { teacher: "Good", principal: "Keep it up" },
  },
};
const results = {
  available: [
    { termId: "t1", termName: "First Term", sessionId: "x", sessionName: "2026/2027", publishedAt: "2026-12-01" },
    { termId: "t0", termName: "Third Term", sessionId: "w", sessionName: "2025/2026", publishedAt: "2026-07-01" },
  ],
  selected: { termId: "t1", termName: "First Term", sessionId: "x", sessionName: "2026/2027" },
  report,
};
const att = {
  available: [
    { termId: "t1", termName: "First Term", sessionId: "x", sessionName: "2026/2027", isCurrent: true },
    { termId: "t0", termName: "Third Term", sessionId: "w", sessionName: "2025/2026", isCurrent: false },
  ],
  selected: { termId: "t1", termName: "First Term", sessionId: "x", sessionName: "2026/2027", isCurrent: true, startDate: "2026-09-28T00:00:00.000Z", endDate: "2026-10-06T00:00:00.000Z" },
  summary: { present: 3, absent: 1, notMarked: 1, upcoming: 2, total: 5, percentage: 75 },
  days: [["2026-09-28", "present"], ["2026-09-29", "absent"], ["2026-09-30", "not_marked"], ["2026-10-01", "present"], ["2026-10-02", "present"], ["2026-10-05", "upcoming"], ["2026-10-06", "upcoming"]]
    .map(([d, s]) => ({ date: `${d}T00:00:00.000Z`, status: s })),
};
const attNoDates = {
  ...att,
  selected: { termId: "t1", termName: "First Term", sessionId: "x", sessionName: "2026/2027", isCurrent: true },
  summary: { present: 1, absent: 0, notMarked: 0, total: 1, percentage: 100 },
  days: [{ date: "2026-09-28T00:00:00.000Z", status: "present" }],
};
const attEmpty = { available: [], selected: null, summary: { present: 0, absent: 0, notMarked: 0, total: 0, percentage: null }, days: [] };
const student = {
  _id: "k1", firstName: "Tobi", surName: "Ade", otherName: "Ola", studentID: "STU/001", gender: "male",
  dateOfBirth: "2014-03-02T00:00:00.000Z", admissionDate: "2022-09-12T00:00:00.000Z", photo: "",
  emergencyContact: { name: "Bisi Ade", phone: "0803", relationship: "Aunt" },
};
const classArm = { _id: "a1", label: "JSS1 A", levelName: "Junior Secondary 1", formTeacher: "Mrs Ade" };

const pageStates: [string, () => ReactElement, Record<string, any>][] = [
  ["results pending", () => <Results />, { "student-results": { pending: true } }],
  ["results error", () => <Results />, { "student-results": { error: err500 } }],
  ["results empty", () => <Results />, { "student-results": { data: { available: [], report: null } } }],
  ["results full, school-info 403", () => <Results />, { "student-results": { data: results }, "school-info": { error: { response: { status: 403 } } } }],
  ["results full, school-info ok", () => <Results />, { "student-results": { data: results }, "school-info": { data: { school: { name: "Green Hill" }, principal: { name: "Dr Obi" } } } }],
  ["results one term", () => <Results />, { "student-results": { data: { ...results, available: results.available.slice(0, 1) } } }],
  ["attendance pending", () => <Attendance />, { "student-portal-attendance": { pending: true } }],
  ["attendance error", () => <Attendance />, { "student-portal-attendance": { error: err500 } }],
  ["attendance empty", () => <Attendance />, { "student-portal-attendance": { data: attEmpty } }],
  ["attendance full", () => <Attendance />, { "student-portal-attendance": { data: att } }],
  ["attendance no term dates", () => <Attendance />, { "student-portal-attendance": { data: attNoDates } }],
  ["profile pending", () => <Profile />, { "student-portal-home": { pending: true } }],
  ["profile error", () => <Profile />, { "student-portal-home": { error: err500 } }],
  ["profile full", () => <Profile />, { "student-portal-home": { data: { student, classArm } } }],
  ["profile minimal", () => <Profile />, { "student-portal-home": { data: { student: { ...student, emergencyContact: undefined, admissionDate: undefined, gender: undefined }, classArm: null } } }],
];

describe("student portal pages render what they rendered before the view split", () => {
  test.each(pageStates)("%s", (_name, page, queries) => {
    setQueries(queries);
    expect(renderToStaticMarkup(page())).toMatchSnapshot();
  });
});

// ---- the parent's child pages reuse the same views ----
const atChild = (path: string, el: ReactElement) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/child/:childId/*" element={el} /></Routes>
    </MemoryRouter>,
  );
const profileData = { child: student, relationship: "Mother", classArm };

describe("a parent sees their child's pages as the child does", () => {
  test("attendance: the summary and day grid are identical to the student's", () => {
    setQueries({ "child-profile": { data: profileData }, "child-attendance": { data: att } });
    const parent = atChild("/child/k1/attendance", <ChildAttendance />);
    setQueries({ "student-portal-attendance": { data: att } });
    const own = renderToStaticMarkup(<Attendance />);
    const grid = (s: string) => s.slice(s.indexOf("grid grid-cols-2"), s.indexOf("What the colours mean"));
    expect(grid(own).length).toBeGreaterThan(100);
    expect(grid(parent)).toBe(grid(own));
    expect(parent).toContain("Tobi Ola Ade");
  });

  test("results: the report card is identical to the student's", () => {
    setQueries({ "child-profile": { data: profileData }, "child-results": { data: results } });
    const parent = atChild("/child/k1/results", <ChildResults />);
    setQueries({ "student-results": { data: results } });
    const own = renderToStaticMarkup(<Results />);
    const card = (s: string) => s.slice(s.indexOf("First Term report"));
    expect(card(own).length).toBeGreaterThan(100);
    // the child page's frame closes one more element after the card
    expect(card(parent)).toBe(`${card(own)}</div>`);
  });

  test.each([
    ["profile", () => <ChildProfile />],
    ["results", () => <ChildResults />],
    ["attendance", () => <ChildAttendance />],
  ] as const)("%s: a child who isn't theirs (404) shows 'We couldn't find that child' and nothing of the child", (page, el) => {
    setQueries({ "child-profile": { error: err404 } });
    const html = atChild(`/child/zzz/${page}`, el());
    expect(html).toContain("We couldn&#x27;t find that child");
    expect(html).not.toContain("Tobi");
    expect(html).not.toContain("STU/001");
  });
});
