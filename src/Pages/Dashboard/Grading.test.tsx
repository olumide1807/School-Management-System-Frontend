// The grading sheet previews each student's total and grade, and the
// report card prints them. They must agree, or a teacher trusts neither:
// same band matching, same rounding, same attendance mark. A score the
// server would refuse is flagged in the sheet, before anything is sent.
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { setQueries } from "../../test/queryStub";
import { serverStub } from "../../test/serverStub";
import { bodyText, buttonByText, mount, setValue } from "../../test/dom";
import theme from "../../theme";
import Grading from "./Grading";

vi.mock("@tanstack/react-query", () => import("../../test/queryStub"));
vi.mock("../../Utils/server", () => import("../../test/serverStub"));

const TEACHER = "T1";
const store: any = { getState: () => ({ user: { user: { _id: TEACHER } } }), subscribe: () => () => {}, dispatch: () => {} };

const BANDS = [
  { grade: "A", remark: "Excellent", scoreRange: { from: 70, to: 100 } },
  { grade: "B", remark: "Very good", scoreRange: { from: 60, to: 69 } },
  { grade: "C", remark: "Credit", scoreRange: { from: 50, to: 59 } },
  { grade: "F", remark: "Fail", scoreRange: { from: 0, to: 49 } },
];
const students = [
  { _id: "s1", firstName: "Ada", surName: "Obi" },
  { _id: "s2", firstName: "Bola", surName: "Ade" },
  { _id: "s3", firstName: "Chidi", surName: "Eze" },
];

function queries(format: any[], { attendance = [] as any[], stored = [] as any[] } = {}) {
  setQueries({
    "all-class-arms-assignments": { data: { data: [{ _id: "A1", classLevelId: "L1", armName: "a", assignedTeacher: TEACHER }] } },
    "all-specific-subjects": { data: { data: [{ _id: "SP1", classArmId: "A1", subjectId: "S1", subjectTeacherId: TEACHER }] } },
    classes: { data: { data: { data: [{ _id: "L1", levelShortName: "JSS1" }] } } },
    session: { data: { data: { data: { session: { _id: "SES" }, term: { _id: "TERM" } } } } },
    "all-subjects": { data: { data: [{ _id: "S1", subjectName: "Maths" }] } },
    "all-staff": { data: { data: [] } },
    "session-terms": { data: [{ _id: "TERM", termName: "First Term" }] },
    "assessment-format": { data: { data: { assessments: format } } },
    "class-students": { data: { data: students } },
    "class-attendance-term": { data: { data: attendance } },
    "all-grades": { data: { data: [{ grades: BANDS }] } },
    "class-subject-results": { data: { data: stored } },
  });
}

const CA_EXAM = [{ name: "CA", maxScore: 40, order: 1 }, { name: "Exam", maxScore: 60, order: 2 }];
const stored = (studentId: string, CA: number, Exam: number) => ({ studentId, scores: [{ name: "CA", score: CA }, { name: "Exam", score: Exam }] });

// The row for a student: the text from their name to the next student's
const row = (name: string) => {
  const t = bodyText();
  const start = t.indexOf(name);
  const next = students.map((s) => `${s.firstName} ${s.surName}`).filter((n) => n !== name).map((n) => t.indexOf(n, start + 1)).filter((i) => i > start);
  return t.slice(start, next.length ? Math.min(...next) : undefined);
};
const cell = (assessment: string, firstName: string) =>
  document.querySelector(`input[aria-label="${assessment} for ${firstName}"]`) as HTMLInputElement;
const render = () => mount(<ThemeProvider theme={theme}><Provider store={store}><Grading /></Provider></ThemeProvider>);

beforeEach(() => serverStub.reset());

describe("the sheet previews what the report card will print", () => {
  test("a decimal total between bands gets the band below, as on the card (69.5 is B)", async () => {
    queries(CA_EXAM, { stored: [stored("s1", 30, 39.5), stored("s2", 30, 40), stored("s3", 10, 20)] });
    await render();
    expect(row("Ada Obi")).toMatch(/69\.5\s*B/);
    expect(row("Bola Ade")).toMatch(/70\s*A/);
    expect(row("Chidi Eze")).toMatch(/30\s*F/);
  });

  test("totals are rounded as the card's are: 12.1 + 50.2 shows 62.3, not 62.300000000000004", async () => {
    queries(CA_EXAM, { stored: [stored("s1", 12.1, 50.2)] });
    await render();
    expect(row("Ada Obi")).toMatch(/62\.3\s*B/);
    expect(bodyText()).not.toContain("62.300000000000004");
  });

  test("the attendance mark leaves auto-marked days out on both sides, as the card does", async () => {
    const format = [{ name: "CA", maxScore: 30, order: 1 }, { name: "Exam", maxScore: 60, order: 2 }, { name: "Attendance", maxScore: 10, order: 3, source: "attendance" }];
    const days = Array.from({ length: 10 }, (_, i) => ({ studentId: "s1", status: "present", autoMarked: false, date: `d${i}` }));
    // A day still flagged auto-marked, though recorded present: not 11 of 10
    queries(format, { attendance: [...days, { studentId: "s1", status: "present", autoMarked: true, date: "d10" }], stored: [stored("s1", 20, 50)] });
    await render();
    expect(row("Ada Obi")).toMatch(/80\s*A/);
  });
});

describe("a score the server would refuse is flagged before submitting", () => {
  test("more than one decimal place: inline message, Save disabled, nothing sent", async () => {
    queries(CA_EXAM, { stored: [stored("s1", 30, 40)] });
    await render();
    await setValue(cell("CA", "Ada"), "12.25");
    expect(bodyText()).toContain("Ada Obi · CA can have at most one decimal place (e.g. 12.5)");
    const save = buttonByText("Save scores")[0];
    expect(save.disabled).toBe(true);
    save.click();
    expect(serverStub.requests.filter(([m]) => m === "POST")).toEqual([]);
  });

  test("one decimal place is fine", async () => {
    queries(CA_EXAM, { stored: [stored("s1", 30, 40)] });
    await render();
    await setValue(cell("CA", "Ada"), "12.5");
    expect(bodyText()).not.toContain("at most one decimal place");
    expect(buttonByText("Save scores")[0].disabled).toBe(false);
  });
});
