// A payment has one receipt. The bursar prints it when recording the
// payment, can reprint it from the student's profile, and the parent can
// print it from the child's fees page — all three must be the same
// document, through the one PaymentReceipt component and the one printer.
// A receipt that reads differently depending on who printed it is a
// receipt nobody can rely on.
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { setQueries } from "../test/queryStub";
import { serverStub } from "../test/serverStub";
import { buttonByText, mount, renderText } from "../test/dom";
import theme from "../theme";
import PaymentReceipt from "./PaymentReceipt";
import ChildFees from "../Pages/Dashboard/Parent/ChildFees";
import ViewStudentProfile from "../Pages/Dashboard/StudentManagement/ViewStudentProfile";

vi.mock("@tanstack/react-query", () => import("../test/queryStub"));
vi.mock("../Utils/server", () => import("../test/serverStub"));

// What the bursar's printer produced when recording Bilal's ₦250,000
// transfer (the date it was printed aside)
const RECORDED_RECEIPT =
  "Qiblah Model School4 Allen Avenue, Ikeja, Lagos, NigeriaPayment receiptReceipt no. QM/1067 BILAL ALAKA" +
  "Date received16 October 2026StudentBilal ALAKA-YUSUFStudent IDQM/1067ClassJSS1 B" +
  "ForSchool fees — First Term, 2026/2027MethodBank transferAmount received₦250,000.00" +
  "Two hundred and fifty thousand naira only" +
  "This receipt is Qiblah Model School's record of a payment it has received.Printed …";
const undated = (t: string) => t.replace(/Printed \d{1,2} \w+ \d{4}/, "Printed …");

// No logo: jsdom never loads images, and the printer would wait 3s for one
const school = { name: "Qiblah Model School", logo: null, address: { number: 4, street: "Allen Avenue", city: "Ikeja", state: "Lagos", country: "Nigeria" } };

// window.print captures the print area as it is at that moment
let printed: string[] = [];
let printParents: (string | undefined)[] = [];
let windowsOpened = 0;
beforeEach(() => {
  printed = []; printParents = []; windowsOpened = 0;
  serverStub.reset();
  window.print = () => {
    const area = document.getElementById("print-area");
    printed.push(area?.textContent || "");
    printParents.push(area?.parentElement?.tagName);
  };
  window.open = (() => { windowsOpened++; return null; }) as any;
});

const clickToPrint = async (button: HTMLButtonElement) => {
  await act(async () => { button.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
  // the printer's effect resolves on the next tick, then prints
  await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
};

const line = (o: any) => ({ feeId: "f", currency: "NGN", items: [], complete: true, payable: 0, paid: 0, outstanding: 0, overpaid: 0, status: "paid", payments: [], ...o });

async function printFromParentPage() {
  setQueries({
    "child-profile": { data: { child: { _id: "s2", firstName: "Bilal", surName: "ALAKA-YUSUF", studentID: "QM/1067" }, classArm: { label: "JSS2 B" } } },
    "school-info": { data: { school } },
    "child-fees": { data: {
      currentTerm: { termName: "First Term", sessionName: "2026/2027" },
      current: line({ feeId: "F1b", term: { termId: "T1", termName: "First Term", sessionName: "2026/2027" }, classLabel: "JSS1 B", payable: 500000, paid: 250000, outstanding: 250000, status: "part_paid",
        payments: [{ _id: "p-new", date: "2026-10-16", amount: 250000, method: "bank transfer", reference: "QM/1067 BILAL ALAKA" }] }),
      otherFees: [line({ feeId: "F0", term: { termId: "T0", termName: "Third Term", sessionName: "2025/2026" }, classLabel: "JSS1 A", payable: 450000, paid: 450000,
        payments: [{ _id: "6ad8a1f2c3b4d5e6f7a8b9c0", date: "2026-04-25T00:00:00.000Z", amount: 450000, method: "cash", reference: "" }] })],
      unallocatedPayments: [{ _id: "p-orphan", date: "2025-12-01T00:00:00.000Z", amount: 7000, method: "cash", reference: "RCPT-77" }],
      paymentDetails: { bankAccount: null, instructions: null },
    } },
  });
  await mount(
    <MemoryRouter initialEntries={["/child/s2/fees"]}>
      <Routes><Route path="/child/:childId/*" element={<ChildFees />} /></Routes>
    </MemoryRouter>,
  );
}

async function openBursarFeesTab() {
  // Bilal has since moved up to JSS2 B (arm A3); these payments were for JSS1 fees
  const bilal = { _id: "s2", studentID: "QM/1067", firstName: "Bilal", surName: "ALAKA-YUSUF", classArmId: "A3", gender: "male", guardians: [] };
  setQueries({
    "class-arms": { data: { data: { data: [{ _id: "A1", classLevelId: "L1", armName: "a" }, { _id: "A2", classLevelId: "L1", armName: "b" }, { _id: "A3", classLevelId: "L2", armName: "b" }] } } },
    classes: { data: { data: { data: [{ _id: "L1", levelShortName: "JSS1" }, { _id: "L2", levelShortName: "JSS2" }] } } },
    session: { data: { data: { data: { session: { _id: "S1", sessionName: "2026/2027" }, term: { _id: "T1" } } } } },
    "session-terms": { data: [{ _id: "T1", termName: "First Term", sessionId: "S1" }] },
    "all-students": { data: { data: [bilal] } },
    "all-parents": { data: { data: [] } },
    "all-fees": { data: { data: [
      { _id: "F1b", termId: "T1", classArmId: "A2", currency: "NGN", fees: [{ description: "Tuition", amount: 500000 }] },
      { _id: "F0", termId: "T3", classArmId: "A1", currency: "NGN", fees: [{ description: "Tuition", amount: 450000 }] },
    ] } },
    "student-payments": { data: { data: [
      { _id: "p-new", feeId: "F1b", amount: 250000, paymentMethod: "bank transfer", reference: "QM/1067 BILAL ALAKA", paymentDate: "2026-10-16" },
      { _id: "6ad8a1f2c3b4d5e6f7a8b9c0", feeId: "F0", amount: 450000, paymentMethod: "cash", reference: "", paymentDate: "2026-04-25T00:00:00.000Z" },
      { _id: "p-orphan", feeId: "F-deleted", amount: 7000, paymentMethod: "cash", reference: "RCPT-77", paymentDate: "2025-12-01T00:00:00.000Z" },
    ] } },
    "student-attendance-records": { data: { data: [] } },
    "school-info": { data: { school } },
  });
  // The reprint looks up an earlier session's term names itself
  const termsBySession: Record<string, unknown[]> = {
    S1: [{ _id: "T1", termName: "First Term", sessionId: "S1" }],
    S0: [{ _id: "T3", termName: "Third Term", sessionId: "S0" }],
  };
  serverStub.respond = (url) => {
    if (url === "session") return { data: [{ _id: "S1", sessionName: "2026/2027" }, { _id: "S0", sessionName: "2025/2026" }] };
    const m = url.match(/^session\/term\/(\w+)$/);
    return { data: m ? termsBySession[m[1]] || [] : [] };
  };
  await mount(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={["/student-management/student-profile/s2"]}>
        <Routes><Route path="/student-management/student-profile/:id" element={<ViewStudentProfile />} /></Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
  await act(async () => { buttonByText("Fees")[0].dispatchEvent(new MouseEvent("click", { bubbles: true })); });
}
const reprintButton = (rowText: string) => {
  const row = [...document.querySelectorAll("tr")].find((tr) => tr.textContent?.includes(rowText));
  return [...(row?.querySelectorAll("button") || [])].find((b) => b.textContent?.trim() === "Reprint") as HTMLButtonElement;
};

describe("a payment has one receipt", () => {
  test("the parent's printout is the receipt the bursar printed when recording it", async () => {
    await printFromParentPage();
    expect(buttonByText("Print receipt")).toHaveLength(3); // this term, fee deleted, earlier term
    await clickToPrint(buttonByText("Print receipt")[0]);
    expect(undated(printed[0])).toBe(RECORDED_RECEIPT);
  });

  test("the bursar's reprint from the profile is that same receipt", async () => {
    await openBursarFeesTab();
    await clickToPrint(reprintButton("QM/1067 BILAL ALAKA"));
    expect(undated(printed[0])).toBe(RECORDED_RECEIPT);
  });

  test("an earlier term's receipt reads the same from both: the fee's class and term, not the child's current ones", async () => {
    await printFromParentPage();
    await clickToPrint(buttonByText("Print receipt")[2]);
    const parent = printed[0];
    document.body.innerHTML = "";
    await openBursarFeesTab();
    await clickToPrint(reprintButton("₦450,000"));
    const bursar = printed[1];
    expect(undated(bursar)).toBe(undated(parent));
    expect(parent).toContain("ClassJSS1 A");
    expect(parent).not.toContain("JSS2");
    expect(parent).toContain("School fees — Third Term, 2025/2026");
    expect(parent).toContain("Receipt no. 6AD8A1F2C3B4D5E6F7A8B9C0"); // no reference → the payment id
  });

  test("a payment whose fee was deleted says so, from both, and guesses nothing", async () => {
    await printFromParentPage();
    await clickToPrint(buttonByText("Print receipt")[1]);
    const parent = printed[0];
    document.body.innerHTML = "";
    await openBursarFeesTab();
    await clickToPrint(reprintButton("RCPT-77"));
    expect(undated(printed[1])).toBe(undated(parent));
    expect(parent).toContain("The fee this payment was recorded against is no longer on record");
    expect(parent).toContain("ClassNot on record");
    expect(parent).not.toContain("School fees —");
  });

  test("printing goes through #print-area on <body>, never a new window, and leaves nothing behind", async () => {
    await printFromParentPage();
    await clickToPrint(buttonByText("Print receipt")[0]);
    expect(printParents).toEqual(["BODY"]);
    expect(windowsOpened).toBe(0);
    expect(document.getElementById("print-area")).toBeNull();
  });
});

describe("PaymentReceipt", () => {
  const receipt = {
    paymentId: "6ad8a1f2c3b4d5e6f7a8b9c0", reference: "", paymentDate: "2026-08-15T00:00:00.000Z", amount: 7000, currency: "NGN", method: "cash",
    student: { name: "Tobi Ade", studentID: "GH/1234" }, school: { name: "Green Hill School", logo: null, address: null },
  };

  test("amount in words, kobo included", () => {
    const t = renderText(<PaymentReceipt receipt={{ ...receipt, amount: 15.5, fee: { classLabel: "JSS1 A", termName: "Third Term", sessionName: "2025/2026" } } as any} />);
    expect(t).toContain("₦15.50 Fifteen naira and fifty kobo only");
  });

  test("no reference: the receipt number is the payment id", () => {
    const t = renderText(<PaymentReceipt receipt={{ ...receipt, fee: null } as any} />);
    expect(t).toContain("Receipt no. 6AD8A1F2C3B4D5E6F7A8B9C0");
  });
});
