import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { amountInWords } from "../Utils/amountInWords";

// ============================================================
// PAYMENT RECEIPT
//
// The one receipt, for the bursar and for parents: same component, same
// data shape, so the school's copy and the parent's copy can't drift. A
// receipt is the document someone produces in an argument.
// ============================================================

export type ReceiptData = {
  paymentId: string;
  reference?: string | null;
  // When the money was received (paymentDate), not when it was keyed in
  paymentDate: string;
  amount: number;
  currency: string;
  method: string;
  student: { name: string; studentID: string };
  // The fee the payment was recorded against: its class, term and session.
  // null when that fee record no longer exists — said so, never guessed.
  fee: { classLabel: string | null; termName: string; sessionName: string } | null;
  school: { name: string; logo?: string | null; address?: any } | null;
};

const METHODS: Record<string, string> = {
  cash: "Cash",
  "bank transfer": "Bank transfer",
  card: "Card",
  other: "Other",
};

// The payment reference where there is one, else the payment's id
export const receiptNumberOf = (r: Pick<ReceiptData, "reference" | "paymentId">) =>
  (r.reference || "").trim() || String(r.paymentId).toUpperCase();

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const longDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const addressLine = (a: any): string | null => {
  if (!a) return null;
  if (typeof a === "string") return a.trim() || null;
  const street = [a.number, a.street].filter(Boolean).join(" ");
  return [street, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(", ") || null;
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 py-2 border-b border-gray-200 last:border-b-0">
    <span className="text-[13px] text-gray-600 shrink-0">{label}</span>
    <span className="text-[14px] text-black text-right">{children}</span>
  </div>
);

export default function PaymentReceipt({ receipt }: { receipt: ReceiptData }) {
  const { school, student, fee } = receipt;
  const schoolName = school?.name?.trim() || "";
  const address = addressLine(school?.address);
  let words: string | null = null;
  try {
    words = amountInWords(receipt.amount, receipt.currency);
  } catch {
    words = null;
  }

  return (
    <div className="bg-white text-black max-w-[640px] mx-auto border border-gray-300 rounded-[6px] p-6">
      {/* School */}
      <div className="flex items-center gap-4 pb-4 border-b-2 border-[#0E7094]">
        {school?.logo && (
          <img src={school.logo} alt="" className="w-16 h-16 object-contain shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight">{schoolName || "School name not available"}</p>
          {address && <p className="text-[12px] text-gray-600 mt-0.5">{address}</p>}
        </div>
      </div>

      {/* Receipt */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 pt-4 pb-2">
        <p className="text-base font-semibold tracking-wide uppercase text-[#0E7094]">Payment receipt</p>
        <p className="text-[13px]">
          <span className="text-gray-600">Receipt no. </span>
          <span className="font-mono font-semibold">{receiptNumberOf(receipt)}</span>
        </p>
      </div>

      <div className="flex flex-col">
        <Row label="Date received">{longDate(receipt.paymentDate)}</Row>
        <Row label="Student">{student.name}</Row>
        <Row label="Student ID"><span className="font-mono">{student.studentID}</span></Row>
        <Row label="Class">{fee ? fee.classLabel || "Not on record" : "Not on record"}</Row>
        <Row label="For">
          {fee ? (
            `School fees — ${[fee.termName, fee.sessionName].filter(Boolean).join(", ")}`
          ) : (
            <span className="text-gray-700">
              The fee this payment was recorded against is no longer on record. The school office
              can confirm what it was for.
            </span>
          )}
        </Row>
        <Row label="Method">{METHODS[receipt.method] || receipt.method}</Row>
      </div>

      {/* Amount, in figures and in words */}
      <div className="mt-4 rounded-[6px] border-2 border-[#0E7094] px-4 py-3">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[13px] font-semibold">Amount received</span>
          <span className="text-xl font-bold tabular-nums">{money(receipt.amount, receipt.currency)}</span>
        </div>
        {words && <p className="text-[13px] mt-1 italic">{words}</p>}
      </div>

      <p className="text-[12px] text-gray-700 mt-4 leading-relaxed">
        This receipt is {schoolName || "the school"}&apos;s record of a payment it has received.
      </p>
      <p className="text-[11px] text-gray-500 mt-1">Printed {longDate(new Date())}</p>
    </div>
  );
}

// Printing: renders the receipt into #print-area through a portal on
// document.body — the index.css print rules hide everything else. Never a
// child of the page: an ancestor with overflow clips an absolutely
// positioned print area and Chrome prints a page of nothing. Waits for the
// logo to load (up to 3s) so it isn't missing from the printout.
export function useReceiptPrinter() {
  const [printing, setPrinting] = useState<ReceiptData | null>(null);
  const areaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!printing) return;
    let cancelled = false;
    const imgs = Array.from(areaRef.current?.querySelectorAll("img") || []);
    const loaded = Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); }),
      ),
    );
    const timeout = new Promise<void>((res) => setTimeout(res, 3000));
    Promise.race([loaded, timeout]).then(() => {
      if (cancelled) return;
      window.print();
      setPrinting(null);
    });
    return () => { cancelled = true; };
  }, [printing]);

  const portal = printing
    ? createPortal(
        <div id="print-area" ref={areaRef} className="hidden print:block">
          <div className="report-page">
            <PaymentReceipt receipt={printing} />
          </div>
        </div>,
        document.body,
      )
    : null;

  return { printReceipt: (r: ReceiptData) => setPrinting(r), receiptPortal: portal, isPrinting: !!printing };
}
