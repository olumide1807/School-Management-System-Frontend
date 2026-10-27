// Publishing results releases them to families. Whether scores are
// incomplete is the server's call (409 INCOMPLETE_SCORES); the page shows
// what it says as a list and makes publishing anyway a deliberate act.
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { setQueries } from "../../../test/queryStub";
import { serverStub } from "../../../test/serverStub";
import { buttonByText, click, mount } from "../../../test/dom";
import theme from "../../../theme";
import Results from "./index";

vi.mock("@tanstack/react-query", () => import("../../../test/queryStub"));
vi.mock("../../../Utils/server", () => import("../../../test/serverStub"));
vi.mock("react-toastify", () => {
  const toasts: string[] = [];
  const record = (m: unknown) => { toasts.push(String(m)); };
  return { toast: Object.assign(record, { success: record, error: record, info: record, warn: record }), ToastContainer: () => null, __toasts: toasts };
});

// One state object: useSelector compares by reference, and a fresh object
// on every getState() re-renders forever
const STATE = { user: { role: "super admin", user: { _id: "SCH" } } };
const store: any = { getState: () => STATE, subscribe: () => () => {}, dispatch: () => {} };

const student = (id: string, firstName: string, graded: number) => ({
  student: { _id: id, firstName, surName: "Ade", studentID: `GH/${id}` },
  subjects: [], comments: {}, attendance: {},
  summary: { totalScore: 0, average: graded ? 70 : null, subjectsGraded: graded, subjectsOffered: 2, position: graded ? 1 : null, outOf: 2 },
});

// Every student has a grade in every subject they've any marks in — the old
// client-side count saw nothing wrong here. The server knows Exam is missing.
const REPORT = {
  classArm: { armName: "a" }, term: { termName: "First Term" }, session: { sessionName: "2026/2027" },
  assessments: [{ name: "CA", maxScore: 40 }, { name: "Exam", maxScore: 60 }], subjects: [], gradeBands: [],
  publication: { published: false, publishedAt: null },
  reports: [student("k1", "Ada", 2), student("k2", "Bola", 2), student("k3", "Chidi", 2)],
};

const OPENING = "Some scores haven't been entered, so these results would be published from partial marks — totals, grades and positions would count only what's there.";
const INCOMPLETE = {
  status: 409,
  data: {
    success: false,
    code: "INCOMPLETE_SCORES",
    error: [OPENING, "Maths: Exam missing for Ada Ade and Bola Ade.", "French: no scores for anyone in the class.", "Enter the missing scores first. If a subject genuinely wasn't taken, you can publish anyway."].join("\n"),
    incomplete: [
      { subjectId: "S1", subjectName: "Maths", wholeClass: false, students: [
        { studentId: "k1", name: "Ada Ade", studentID: "GH/k1", noScores: false, missing: ["Exam"] },
        { studentId: "k2", name: "Bola Ade", studentID: "GH/k2", noScores: false, missing: ["Exam"] },
      ] },
      { subjectId: "S2", subjectName: "French", wholeClass: true, students: [
        { studentId: "k1", name: "Ada Ade", noScores: true, missing: [] },
        { studentId: "k2", name: "Bola Ade", noScores: true, missing: [] },
        { studentId: "k3", name: "Chidi Ade", noScores: true, missing: [] },
      ] },
    ],
  },
};

const posts = () => serverStub.requests.filter(([m, url]) => m === "POST" && url === "result/publish");
let confirms = 0;

beforeEach(async () => {
  serverStub.reset();
  confirms = 0;
  window.confirm = () => { confirms++; return true; };
  setQueries({
    "class-arms": { data: { data: { data: [{ _id: "A1", classLevelId: "L1", armName: "a" }] } } },
    classes: { data: { data: { data: [{ _id: "L1", levelShortName: "JSS1" }] } } },
    session: { data: { data: { data: { session: { _id: "SES" }, term: { _id: "TERM" } } } } },
    "all-class-arms-assignments": { data: { data: [] } },
    "all-specific-subjects": { data: { data: [] } },
    "session-terms": { data: [{ _id: "TERM", termName: "First Term" }] },
    "class-report": { data: REPORT },
    "school-info": { data: { school: { name: "Green Hill" } } },
  });
  // The server refuses unless confirmIncomplete is the boolean true
  serverStub.refuse.POST = (_url, body: any) => (body?.confirmIncomplete === true ? undefined : INCOMPLETE);
  await mount(<ThemeProvider theme={theme}><Provider store={store}><Results /></Provider></ThemeProvider>);
});

const publishButton = () => buttonByText("Publish results")[0];
const dialog = () => document.querySelector('[role="dialog"]') as HTMLElement | null;
const checkbox = () => dialog()!.querySelector('input[type="checkbox"]') as HTMLInputElement;

describe("publishing incomplete results", () => {
  test("no pre-publish confirm of its own: the server decides", async () => {
    await click(publishButton());
    expect(confirms).toBe(0);
    expect(posts()).toHaveLength(1);
  });

  test("the 409 opens a dialog: the server's opening line, then the gaps as a list", async () => {
    await click(publishButton());
    const d = dialog()!;
    expect(d).not.toBeNull();
    const text = d.textContent || "";
    expect(text).toContain("Some scores are missing");
    expect(text).toContain(OPENING);
    // Not the message blob: its per-subject lines aren't repeated as text
    expect(text).not.toContain("Maths: Exam missing for Ada Ade and Bola Ade.");
    const sections = [...d.querySelectorAll("section")].map((s) => s.textContent);
    expect(sections).toEqual([
      "MathsExam missingAda AdeGH/k1Bola AdeGH/k2",
      "FrenchNo scores for anyone in the class",
    ]);
  });

  test("not publishing is the easy path: focused, and 'Publish anyway' needs the box ticked", async () => {
    await click(publishButton());
    const dontPublish = buttonByText("Don't publish")[0];
    expect(document.activeElement).toBe(dontPublish);
    expect(buttonByText("Publish anyway")[0].disabled).toBe(true);
    await click(dontPublish);
    expect(dialog()).toBeNull();
    expect(posts()).toHaveLength(1);
  });

  test("publishing anyway resends with confirmIncomplete: true — the boolean", async () => {
    await click(publishButton());
    await act(async () => { checkbox().click(); });
    expect(buttonByText("Publish anyway")[0].disabled).toBe(false);
    await click(buttonByText("Publish anyway")[0]);
    expect(posts()).toHaveLength(2);
    expect(posts()[1][2]).toEqual({ classArmId: "A1", termId: "TERM", sessionId: "SES", confirmIncomplete: true });
    expect(posts()[0][2]).not.toHaveProperty("confirmIncomplete");
    expect(dialog()).toBeNull();
    const { __toasts } = (await import("react-toastify")) as any;
    expect(__toasts).toContain("Results published");
  });

  test("reopening the dialog starts unticked", async () => {
    await click(publishButton());
    await act(async () => { checkbox().click(); });
    await click(buttonByText("Don't publish")[0]);
    await click(publishButton());
    expect(checkbox().checked).toBe(false);
    expect(buttonByText("Publish anyway")[0].disabled).toBe(true);
  });

  test("a complete class publishes straight away", async () => {
    serverStub.refuse.POST = undefined;
    await click(publishButton());
    expect(dialog()).toBeNull();
    expect(posts()).toHaveLength(1);
  });

  test("any other error is shown as an error, not this dialog", async () => {
    serverStub.refuse.POST = "These results are already published";
    await click(publishButton());
    expect(dialog()).toBeNull();
    const { __toasts } = (await import("react-toastify")) as any;
    expect(__toasts).toContain("These results are already published");
  });
});
