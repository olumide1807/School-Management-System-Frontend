// The parent's view of a child's fees. Every figure comes from the API's
// fee statement (buildFeeStatement on the server); this page only presents
// it. These are the states a statement can be in, and what a parent must —
// and must never — read in each.
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { queryCalls, setQueries } from "../../../test/queryStub";
import { textOf } from "../../../test/dom";
import ChildFees from "./ChildFees";

vi.mock("@tanstack/react-query", () => import("../../../test/queryStub"));
vi.mock("../../../Utils/server", () => import("../../../test/serverStub"));

const profile = { child: { _id: "k1", firstName: "Tobi", surName: "Ade", studentID: "GH/1234" }, relationship: "Mother", classArm: { label: "JSS1 A" } };
const term = { termId: "t1", termName: "First Term", sessionName: "2026/2027" };
const items = [{ description: "Tuition", amount: 500000 }, { description: "Platform Fee (Basitech)", amount: 2000 }];
const pays = [
  { _id: "p1", date: "2026-09-20T10:00:00Z", amount: 100000, method: "bank transfer", reference: "TRF-881" },
  { _id: "p2", date: "2026-10-02T10:00:00Z", amount: 50000.5, method: "cash", reference: null },
];
const line = (o: any) => ({ feeId: "f1", term, currency: "NGN", items, complete: true, payable: 502000, paid: 0, outstanding: 502000, overpaid: 0, status: "unpaid", payments: [], ...o });
const base = { currentTerm: term, otherFees: [], unallocatedPayments: [] };
const bank = { bankAccount: { bankName: "First Bank of Nigeria", accountName: "Green Hill School", accountNumber: "0123456789" }, instructions: "Use the child's class in the narration as well." };

const renderFees = (fees: any) => {
  setQueries({ "child-profile": { data: profile }, "child-fees": fees });
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={["/child/k1/fees"]}>
      <Routes><Route path="/child/:childId/*" element={<ChildFees />} /></Routes>
    </MemoryRouter>,
  );
};
const page = (fees: any) => textOf(renderFees({ data: { ...base, ...fees } }));

const unpaid = () => page({ current: line({}) });
const partPaid = () => page({ current: line({ paid: 150000.5, outstanding: 351999.5, status: "part_paid", payments: pays }) });
const overpaid = () => page({ current: line({ paid: 503000, outstanding: 0, overpaid: 1000, status: "paid", payments: [{ ...pays[0], amount: 503000 }] }) });
const nothingDue = () => page({ current: line({ items: [{ description: "Uniform (waived)", amount: 0 }], payable: 0, outstanding: 0, status: "nothing_due" }) });
const unknown = () =>
  page({ current: line({ items: [{ description: "Tuition", amount: 500000 }, { description: "PTA levy", amount: null }], complete: false, payable: null, outstanding: null, overpaid: null, paid: 100000, status: "unknown", payments: [pays[0]] }) });

describe("fee statement states", () => {
  test("money: naira with thousands separators; kobo only when there are some", () => {
    expect(unpaid()).toContain("₦502,000");
    expect(unpaid()).not.toMatch(/\b502000\b/);
    expect(unpaid()).not.toContain("₦502,000.00");
    expect(partPaid()).toContain("₦150,000.50");
    expect(partPaid()).toContain("₦351,999.50");
  });

  test("the term's figures lead, before the breakdown", () => {
    const t = partPaid();
    expect(t.indexOf("Fees for the term")).toBeLessThan(t.indexOf("What the fee covers"));
  });

  test("unknown (an item has no amount): no payable, outstanding or total — the school must confirm", () => {
    const t = unknown();
    expect(t).toContain("The school needs to confirm the amount");
    expect(t).not.toContain("₦500,000");
    expect(t).not.toContain("Fees for the term");
    expect(t).not.toContain("Total");
    // every item reads 'To be confirmed' rather than showing partial amounts
    expect(t.match(/To be confirmed/g)).toHaveLength(2);
  });

  test("overpaid: its own state, 'Paid over', never a negative balance", () => {
    const t = overpaid();
    expect(t).toContain("Paid over ₦1,000");
    expect(t).not.toContain("-₦");
    expect(t).not.toContain("−");
    expect(t).not.toContain("Outstanding");
  });

  test("nothing due: says nothing is owed, not that nothing has been paid", () => {
    expect(nothingDue()).toContain("Nothing is owed");
    expect(nothingDue()).not.toContain("No payments have been recorded");
  });

  test("earlier terms and payments the office must confirm are listed with their own figures", () => {
    const t = page({
      current: line({ paid: 502000, outstanding: 0, status: "paid", payments: [{ ...pays[0], amount: 502000 }] }),
      otherFees: [line({ feeId: "f0", term: { termId: "t0", termName: "Third Term", sessionName: "2025/2026" }, items: [{ description: "Tuition", amount: 450000 }], payable: 450000, paid: 400000, outstanding: 50000, status: "part_paid", payments: [{ _id: "p9", date: "2026-04-25T10:00:00Z", amount: 400000, method: "bank transfer", reference: "TRF-120" }] })],
      unallocatedPayments: [{ _id: "p7", date: "2025-12-01T10:00:00Z", amount: 7000, method: "cash", reference: null }],
    });
    expect(t).toContain("Third Term, 2025/2026");
    expect(t).toContain("₦50,000");
    expect(t).toContain("Payments to confirm");
    expect(t).toContain("₦7,000");
    expect(t).toContain("no longer on record");
  });

  test("it never claims to be a full statement", () => {
    expect(unpaid()).toContain("Only terms with a payment recorded against them are listed");
    expect(unpaid()).toContain("isn't a full statement");
  });

  test("no fee set, or no current term: no 'figures on record' footer", () => {
    expect(page({ current: null })).not.toContain("figures the school has on record");
    expect(page({ currentTerm: null, current: null })).not.toContain("figures the school has on record");
    expect(unpaid()).toContain("figures the school has on record");
  });

  test("a child who isn't theirs (404): not found, and no money shown", () => {
    const t = textOf(renderFees({ error: { response: { status: 404 } } }));
    expect(t).toContain("We couldn't find that child");
    expect(t).not.toContain("₦");
  });

  test("tone: nothing to pay online, no dunning words, in any state", () => {
    const all = [unpaid(), partPaid(), overpaid(), nothingDue(), unknown(), page({ current: null }), page({ current: line({}), paymentDetails: bank })].join(" ");
    expect(all).not.toMatch(/pay now|make a payment|pay online|pay here|pay fees|checkout|paystack|flutterwave/i);
    expect(all).not.toMatch(/overdue|arrears|debt|owing|immediately|failure to pay|penalt/i);
  });

  test("how to pay, bank details set: the account, a reference that identifies the child, one transfer per child", () => {
    const t = page({ current: line({}), paymentDetails: bank });
    expect(t).toContain("How to pay");
    expect(t).toContain("First Bank of Nigeria");
    expect(t).toContain("0123456789");
    expect(t).toContain("GH/1234 Tobi Ade");
    expect(t).toContain("Paying for more than one child? Please make a separate transfer for each, with that child's reference.");
    expect(t).toContain("The school records payments by hand");
    expect(t.indexOf("Fees for the term")).toBeLessThan(t.indexOf("How to pay"));
  });

  test("how to pay, not set: the office line, and still a reference", () => {
    const t = page({ current: line({}), paymentDetails: { bankAccount: null, instructions: null } });
    expect(t).toContain("Payment details are available from the school office.");
    expect(t).not.toContain("Account number");
    expect(t).toContain("quote GH/1234 Tobi Ade");
    // an older response without paymentDetails reads the same
    expect(unpaid()).toContain("Payment details are available from the school office.");
  });

  test('the statement is cached under ["child-fees", childId]', () => {
    unpaid();
    const keys = [...new Set(queryCalls.map((k) => JSON.stringify(k)))].filter((k) => k.includes("fees"));
    expect(keys).toEqual(['["child-fees","k1"]']);
  });
});
