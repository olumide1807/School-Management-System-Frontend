import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";
import ChildPage, { ChildNotFound, firstNameOf, isNotFound } from "./ChildPage";

// Read-only view of GET /portal/child/:childId/fees. Every figure here is
// the API's — nothing is added up or recomputed on this page. Where the API
// couldn't compute a balance, no figure is shown at all.
//
// Deliberately factual: an outstanding balance is information, and any
// figure a parent might question points them to the school office. There
// is no way to pay from here, and nothing suggests there is — "How to pay"
// only says where to transfer to and what reference to quote.

// "₦502,000" for whole amounts, "₦150,000.50" when there are kobo. Uses the
// fee's own currency rather than assuming naira.
const money = (amount: number, currency = "NGN") => {
  const whole = Math.round(amount * 100) % 100 === 0;
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Unknown currency code: still show the number, never hide money
    return `${currency} ${amount.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
  }
};

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

const METHODS: Record<string, string> = {
  cash: "Cash",
  "bank transfer": "Bank transfer",
  card: "Card",
  other: "Other",
};

const termLabel = (term: any) =>
  [term?.termName, term?.sessionName].filter(Boolean).join(", ");

// A fee line can't be totalled if the API says so
const computable = (line: any) => line.complete !== false && line.status !== "unknown";

function Tile({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "muted" }) {
  return (
    <div className="border border-[#DEE0E0] rounded-[12px] p-4">
      <p className="text-[13px] text-gray-1">{label}</p>
      <p className={`text-[22px] leading-tight font-semibold tabular-nums mt-1 ${tone === "muted" ? "text-text-ter" : "text-text-pry"}`}>
        {value}
      </p>
    </div>
  );
}

function Payments({ payments, currency }: { payments: any[]; currency: string }) {
  if (!payments?.length) return null;
  return (
    <ul className="flex flex-col">
      {payments.map((p) => (
        <li
          key={p._id}
          className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 border-b border-[#EFF5F8] last:border-b-0"
        >
          <span className="text-sm text-text-pry">
            {fmtDate(p.date)}
            <span className="text-text-ter">
              {" · "}
              {METHODS[p.method] || p.method || "Payment"}
              {p.reference ? ` · Ref ${p.reference}` : ""}
            </span>
          </span>
          <span className="text-sm text-text-pry tabular-nums">{money(p.amount, currency)}</span>
        </li>
      ))}
    </ul>
  );
}

// One sentence on where this fee stands. Never a demand.
function StatusLine({ line, name }: { line: any; name: string }) {
  const c = line.currency;
  if (!computable(line)) {
    return (
      <p className="text-sm text-text-pry leading-relaxed">
        The school needs to confirm the amount for this fee, so we can&apos;t
        show a balance. Please contact the school office.
      </p>
    );
  }
  if (line.status === "nothing_due") {
    return (
      <p className="text-sm text-text-pry leading-relaxed">
        Nothing is owed for this fee.
        {line.overpaid > 0 &&
          ` ${money(line.overpaid, c)} has been recorded against it — the school office can tell you how that's been applied.`}
      </p>
    );
  }
  if (line.overpaid > 0) {
    return (
      <p className="text-sm text-text-pry leading-relaxed">
        Paid in full, with {money(line.overpaid, c)} more recorded than this
        fee. The school office can tell you how the extra will be applied.
      </p>
    );
  }
  if (line.status === "paid") {
    return <p className="text-sm text-text-pry">Paid in full.</p>;
  }
  if (line.status === "part_paid") {
    return (
      <p className="text-sm text-text-pry leading-relaxed">
        {money(line.paid, c)} has been recorded so far, leaving{" "}
        {money(line.outstanding, c)}.
      </p>
    );
  }
  // unpaid
  return (
    <p className="text-sm text-text-pry leading-relaxed">
      No payments have been recorded for {name} against this fee yet.
    </p>
  );
}

// The three headline figures, or nothing when they can't be computed
function Figures({ line }: { line: any }) {
  if (!computable(line)) return null;
  const c = line.currency;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Tile label="Fees for the term" value={money(line.payable, c)} />
      <Tile label="Paid so far" value={money(line.paid, c)} />
      {line.overpaid > 0 ? (
        <Tile label="Paid over" value={money(line.overpaid, c)} />
      ) : (
        <Tile
          label="Outstanding"
          value={money(line.outstanding, c)}
          tone={line.outstanding === 0 ? "muted" : "default"}
        />
      )}
    </div>
  );
}

function Breakdown({ line }: { line: any }) {
  const c = line.currency;
  const ok = computable(line);
  if (!line.items?.length) return null;
  return (
    <div>
      <h3 className="text-[13px] font-semibold text-secondary mb-1">What the fee covers</h3>
      <ul>
        {line.items.map((item: any, i: number) => (
          <li
            key={i}
            className="flex items-baseline justify-between gap-2 py-2.5 border-b border-[#EFF5F8] last:border-b-0"
          >
            <span className="text-sm text-text-pry">{item.description || "Item"}</span>
            {/* No amounts at all when the total can't be computed — a list
                of some amounts invites adding up a wrong total */}
            <span className="text-sm text-text-pry tabular-nums">
              {ok ? money(item.amount, c) : "To be confirmed"}
            </span>
          </li>
        ))}
        {ok && (
          <li className="flex items-baseline justify-between gap-2 pt-2.5">
            <span className="text-sm font-semibold text-text-pry">Total</span>
            <span className="text-sm font-semibold text-text-pry tabular-nums">
              {money(line.payable, c)}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

// A copy button for something a parent will retype into a banking app,
// where one wrong digit sends money to a stranger
function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  };
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="px-3 py-1.5 rounded-[8px] text-xs text-tertiary border border-[#DEE0E0] hover:border-tertiary transition-colors"
      >
        {state === "copied" ? "Copied" : label}
      </button>
      {state === "failed" && (
        <span className="text-xs text-text-ter">Couldn&apos;t copy — please copy it by hand.</span>
      )}
    </span>
  );
}

// How to pay — information only. Nothing here takes a payment or suggests
// one can be made on this page.
function HowToPay({ details, child }: { details: any; child: any }) {
  const account = details?.bankAccount || null;
  const instructions = details?.instructions || null;
  const childName = [child?.firstName, child?.surName].filter(Boolean).join(" ");
  const reference = [child?.studentID, childName].filter(Boolean).join(" ");

  // No account set: point to the office, never an empty block
  if (!account) {
    return (
      <section className="border border-[#DEE0E0] rounded-[12px] p-5 flex flex-col gap-2">
        <h2 className="text-base font-semibold text-secondary">How to pay</h2>
        <p className="text-sm text-text-pry leading-relaxed">
          Payment details are available from the school office.
        </p>
        {instructions && (
          <p className="text-sm text-text-pry leading-relaxed whitespace-pre-line">{instructions}</p>
        )}
        {reference && (
          <p className="text-sm text-text-pry leading-relaxed">
            Whichever way you pay, quote <span className="font-medium">{reference}</span> so
            the school can match the payment to {child?.firstName || "your child"}. If
            you&apos;re paying for more than one child, please pay for each separately.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="border border-[#DEE0E0] rounded-[12px] p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-secondary">How to pay</h2>
        <p className="text-sm text-text-pry mt-1 leading-relaxed">
          To pay by bank transfer, use the school&apos;s account below in your
          own banking app.
        </p>
      </div>

      <div className="rounded-[10px] bg-bg-7 px-4 py-4 flex flex-col gap-3">
        <div>
          <p className="text-[13px] text-gray-1">Bank</p>
          <p className="text-sm text-text-pry">{account.bankName}</p>
        </div>
        <div>
          <p className="text-[13px] text-gray-1">Account name</p>
          <p className="text-sm text-text-pry">{account.accountName}</p>
        </div>
        <div>
          <p className="text-[13px] text-gray-1">Account number</p>
          <div className="flex flex-wrap items-center gap-3 mt-0.5">
            <p className="font-mono text-[22px] leading-none font-semibold text-black tracking-[0.12em] select-all">
              {account.accountNumber}
            </p>
            <CopyButton value={account.accountNumber} label="Copy account number" />
          </div>
        </div>
      </div>

      {reference && (
        <div>
          <p className="text-sm text-text-pry leading-relaxed">
            Put this in the transfer&apos;s narration or reference, so the
            bursar can match the payment to {child?.firstName || "your child"}:
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <p className="text-sm font-medium text-text-pry select-all">{reference}</p>
            <CopyButton value={reference} label="Copy reference" />
          </div>
          {/* One narration can only name one child, so a combined
              transfer can't be matched or split */}
          <p className="text-sm text-text-pry mt-2 leading-relaxed">
            Paying for more than one child? Please make a separate transfer for
            each, with that child&apos;s reference.
          </p>
        </div>
      )}

      {instructions && (
        <div>
          <p className="text-[13px] font-semibold text-secondary">From the school</p>
          <p className="text-sm text-text-pry mt-1 leading-relaxed whitespace-pre-line">{instructions}</p>
        </div>
      )}

      <p className="text-[13px] text-gray-1 leading-relaxed">
        The school records payments by hand, so it may be a little while before
        a transfer shows on this page. If it doesn&apos;t appear, the school
        office can check it against your transfer receipt.
      </p>
    </section>
  );
}

function ChildFeesBody({ childId, name, child }: { childId: string; name: string; child: any }) {
  // Own key, with childId: same endpoint ⇒ same shape, and no other query
  // uses this prefix
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["child-fees", childId],
    queryFn: async () => {
      const res = await SERVER.get(`portal/child/${childId}/fees`);
      return res?.data?.data;
    },
    retry: false,
  });

  if (isPending) return <Loader />;
  if (isNotFound(error)) return <ChildNotFound />;
  if (isError || !data) {
    return (
      <div className="max-w-[520px] py-6">
        <h2 className="text-lg font-semibold text-secondary">
          Couldn&apos;t load {name}&apos;s fees
        </h2>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or contact the school office if this keeps happening.
        </p>
      </div>
    );
  }

  const { currentTerm, current } = data;
  const otherFees: any[] = Array.isArray(data.otherFees) ? data.otherFees : [];
  const unallocated: any[] = Array.isArray(data.unallocatedPayments) ? data.unallocatedPayments : [];

  return (
    <div className="flex flex-col gap-6 max-w-[760px]">
      {/* ---- This term ---- */}
      <section className="border border-[#DEE0E0] rounded-[12px] p-5 flex flex-col gap-5">
        <div>
          <h2 className="text-base font-semibold text-secondary">This term</h2>
          {currentTerm && (
            <p className="text-[13px] text-text-ter mt-0.5">{termLabel(currentTerm)}</p>
          )}
        </div>

        {!currentTerm ? (
          <p className="text-sm text-text-pry leading-relaxed">
            The school hasn&apos;t set a current term yet, so there&apos;s no
            fee for this term to show.
          </p>
        ) : !current ? (
          <p className="text-sm text-text-pry leading-relaxed">
            No fees have been set for {name}&apos;s class this term yet. If you
            were expecting one, the school office can confirm.
          </p>
        ) : (
          <>
            <Figures line={current} />
            <StatusLine line={current} name={name} />
            <Breakdown line={current} />
            {current.payments?.length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-secondary mb-1">
                  Payments recorded this term
                </h3>
                <Payments payments={current.payments} currency={current.currency} />
              </div>
            )}
          </>
        )}

        {current && (
          <p className="text-[13px] text-gray-1 leading-relaxed">
            These are the figures the school has on record. If anything
            doesn&apos;t match your own records, the school office can confirm
            them.
          </p>
        )}
      </section>

      {/* ---- How to pay: below the figures ---- */}
      <HowToPay details={data.paymentDetails} child={child} />

      {/* ---- Payments whose fee no longer exists ---- */}
      {unallocated.length > 0 && (
        <section className="border border-[#DEE0E0] rounded-[12px] p-5 flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-secondary">Payments to confirm</h2>
            <p className="text-sm text-text-pry mt-1 leading-relaxed">
              These payments are recorded for {name}, but the fee they were
              made against is no longer on record. The school office can
              confirm what they were for.
            </p>
          </div>
          <Payments
            payments={unallocated}
            currency={current?.currency || otherFees[0]?.currency || "NGN"}
          />
        </section>
      )}

      {/* ---- Earlier terms ---- */}
      <section className="border border-[#DEE0E0] rounded-[12px] p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-secondary">Earlier terms</h2>
          <p className="text-sm text-text-pry mt-1 leading-relaxed">
            Only terms with a payment recorded against them are listed here,
            so this isn&apos;t a full statement. A term that isn&apos;t listed
            may still have a balance. To check any earlier term, please ask
            the school office.
          </p>
        </div>

        {otherFees.length === 0 ? (
          <p className="text-sm text-text-ter">No payments recorded for earlier terms.</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {otherFees.map((line) => (
              <li
                key={line.feeId}
                className="flex flex-col gap-3 border-t border-[#EFF5F8] pt-4 first:border-t-0 first:pt-0"
              >
                <p className="text-sm font-semibold text-text-pry">{termLabel(line.term)}</p>
                <Figures line={line} />
                <StatusLine line={line} name={name} />
                <Payments payments={line.payments} currency={line.currency} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function ChildFees() {
  return (
    <ChildPage>
      {({ childId, profile }) => (
        <ChildFeesBody key={childId} childId={childId} name={firstNameOf(profile.child)} child={profile.child} />
      )}
    </ChildPage>
  );
}
