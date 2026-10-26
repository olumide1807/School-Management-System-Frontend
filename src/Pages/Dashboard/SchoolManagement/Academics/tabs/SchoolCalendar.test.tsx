// The admin's calendar tab. Whether an entry closes the school decides
// attendance for its days — no register and no absences when closed, a
// normal register (and auto-marked absences if it isn't taken) when open —
// so the form has to make that choice plainly, send it as given, and leave
// the rule "a closed day that has started can't be reopened" to the server.
import { ThemeProvider } from "@mui/material";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { setQueries } from "../../../../../test/queryStub";
import { serverStub } from "../../../../../test/serverStub";
import { bodyText, buttonByText, click, mount, setValue } from "../../../../../test/dom";
import theme from "../../../../../theme";
import SchoolCalendar from "./SchoolCalendar";

vi.mock("@tanstack/react-query", () => import("../../../../../test/queryStub"));
vi.mock("../../../../../Utils/server", () => import("../../../../../test/serverStub"));

const day = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10) + "T00:00:00.000Z";
const entries = () => [
  { _id: "a", name: "Mid-term break", type: "school_break", startDate: day(5), endDate: day(7), closesSchool: true },
  { _id: "b", name: "Inter-house sports", type: "school_event", startDate: day(10), endDate: day(10), closesSchool: false },
  { _id: "c", name: "Teachers' retreat", type: "other", startDate: day(-1), endDate: day(1), closesSchool: true },
  { _id: "d", name: "Unmigrated", type: "school_event", startDate: day(20), endDate: day(20) },
];

const radios = () => [...document.querySelectorAll('input[name="closesSchool"]')] as HTMLInputElement[];
// true = "Yes — school is closed", false = "No — school is open"
const chosen = () => (radios()[0]?.checked ? true : radios()[1]?.checked ? false : null);
const rowOf = (name: string) =>
  [...document.querySelectorAll("p")].find((p) => p.textContent === name)!.closest("div.flex-wrap") as HTMLElement;
const editButton = (name: string) => rowOf(name).querySelectorAll("button")[0];
const deleteButton = (name: string) => rowOf(name).querySelectorAll("button")[1];
const lastRequest = (method: string) => [...serverStub.requests].reverse().find((r) => r[0] === method);

let confirms: string[] = [];
let alerts: string[] = [];
beforeEach(async () => {
  serverStub.reset();
  confirms = []; alerts = [];
  window.confirm = (m?: string) => { confirms.push(String(m)); return true; };
  window.alert = (m?: string) => { alerts.push(String(m)); };
  setQueries({ session: { data: { data: { data: { session: { _id: "s1" } } } } }, "school-calendar": { data: { data: entries() } } });
  await mount(<ThemeProvider theme={theme}><SchoolCalendar /></ThemeProvider>);
});

describe("admin calendar: closed or open", () => {
  test("each row says whether school is open; an entry with no flag reads closed", () => {
    expect(rowOf("Inter-house sports").textContent).toContain("School open");
    expect(rowOf("Mid-term break").textContent).toContain("School closed");
    expect(rowOf("Unmigrated").textContent).toContain("School closed");
  });

  test("the form explains what each choice does to attendance", async () => {
    await click(buttonByText("Add to calendar")[0]);
    const t = bodyText();
    expect(t).toContain("Is the school closed on these days?");
    expect(t).toContain("The register isn't taken, no student is marked absent, and these days don't count in anyone's attendance.");
    expect(t).toContain("Teachers take the register as usual");
    expect(t).toContain("marked absent automatically");
  });

  test("a new entry follows its type until the admin chooses, then keeps the choice", async () => {
    await click(buttonByText("Add to calendar")[0]);
    const type = document.querySelector("select") as HTMLSelectElement;
    expect(chosen()).toBe(true); // public holiday
    await setValue(type, "school_event");
    expect(chosen()).toBe(false);
    await setValue(type, "school_break");
    expect(chosen()).toBe(true);
    await setValue(type, "school_event");
    await click(radios()[0]); // the admin says closed
    await setValue(type, "other");
    await setValue(type, "school_event");
    expect(chosen()).toBe(true);
  });

  test("create sends closesSchool as a boolean, exactly as chosen", async () => {
    await click(buttonByText("Add to calendar")[0]);
    await setValue(document.querySelector("select") as HTMLSelectElement, "school_event");
    await setValue(document.querySelector('input[type="text"]') as HTMLInputElement, "Sports day");
    await setValue(document.querySelectorAll('input[type="date"]')[0] as HTMLInputElement, day(30).slice(0, 10));
    await click(buttonByText("Add to calendar").at(-1)!);
    const post = lastRequest("POST");
    expect(post?.[1]).toBe("calendar");
    expect(post?.[2]).toEqual({ name: "Sports day", type: "school_event", startDate: day(30).slice(0, 10), endDate: day(30).slice(0, 10), closesSchool: false });
  });

  test("edit loads the stored value and keeps it when the type changes", async () => {
    await click(editButton("Inter-house sports"));
    expect(chosen()).toBe(false);
    await setValue(document.querySelector("select") as HTMLSelectElement, "public_holiday");
    expect(chosen()).toBe(false);
    await click(radios()[0]);
    await click(buttonByText("Save changes")[0]);
    expect(lastRequest("PUT")?.[1]).toBe("calendar/b");
    expect((lastRequest("PUT")?.[2] as any).closesSchool).toBe(true);
  });

  test("an entry with no flag loads as closed", async () => {
    await click(editButton("Unmigrated"));
    expect(chosen()).toBe(true);
  });
});

describe("admin calendar: a closed day that has started can't be reopened", () => {
  const REFUSAL = "You can't change it like this: it would reopen … contact support so the attendance can be corrected at the same time.";

  test("a started closure explains the rule up front; the server decides", async () => {
    await click(editButton("Teachers' retreat"));
    expect(bodyText()).toContain("This closure has already started");
    expect(bodyText()).toContain("contact support");
    // No copy of the rule in the form: the request goes to the server
    await click(radios()[1]);
    expect(buttonByText("Save changes")[0].disabled).toBe(false);
    serverStub.refuse = { PUT: REFUSAL };
    await click(buttonByText("Save changes")[0]);
    expect((lastRequest("PUT")?.[2] as any).closesSchool).toBe(false);
  });

  test("the server's refusal stays in the form until something changes", async () => {
    await click(editButton("Teachers' retreat"));
    await click(radios()[1]);
    serverStub.refuse = { PUT: REFUSAL };
    await click(buttonByText("Save changes")[0]);
    expect(bodyText()).toContain("Not saved");
    expect(bodyText()).toContain(REFUSAL);
    expect(buttonByText("Save changes")).toHaveLength(1); // still open
    await click(radios()[0]);
    expect(bodyText()).not.toContain("Not saved");
  });

  test("a closure that hasn't started has no such note", async () => {
    await click(editButton("Mid-term break"));
    expect(bodyText()).not.toContain("This closure has already started");
  });

  test("delete confirmations say what removal does, case by case", async () => {
    await click(deleteButton("Teachers' retreat"));
    expect(confirms.at(-1)).toContain("This closure has already started");
    expect(confirms.at(-1)).not.toContain("will count as school days again");
    await click(deleteButton("Mid-term break"));
    expect(confirms.at(-1)).toContain("Those days will count as school days again.");
    await click(deleteButton("Inter-house sports"));
    expect(confirms.at(-1)).toContain("doesn't change attendance");
  });

  test("a refused delete shows the server's whole message", async () => {
    serverStub.refuse = { DELETE: "You can't remove it: it would reopen … contact support" };
    await click(deleteButton("Teachers' retreat"));
    expect(alerts).toEqual(["You can't remove it: it would reopen … contact support"]);
  });
});
