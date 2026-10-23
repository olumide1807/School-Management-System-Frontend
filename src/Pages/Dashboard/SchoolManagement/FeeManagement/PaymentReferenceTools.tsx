import { useState } from "react";
import { Button, Checkbox, Dialog, FormControlLabel } from "@mui/material";
import { Search } from "@mui/icons-material";

import SERVER from "../../../../Utils/server";

// Payments as the backend's reference lookup and duplicate warning
// describe them (utils/paymentReference.js): reference as recorded,
// amount, date, method, student name + ID, term.

const naira = (n: number) => `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
const day = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const METHODS: Record<string, string> = { cash: "Cash", "bank transfer": "Bank transfer", card: "Card", other: "Other" };

export function RecordedPayment({ p }: { p: any }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-black">
          {p.student ? p.student.name : "Student no longer on record"}
          {p.student && <span className="font-mono text-xs text-gray-600 ml-2">{p.student.studentID}</span>}
        </span>
        <span className="text-sm font-semibold text-black tabular-nums">{naira(p.amount)}</span>
      </div>
      <span className="text-xs text-gray-600">
        {day(p.paymentDate)} · {METHODS[p.paymentMethod] || p.paymentMethod}
        {p.term ? ` · ${[p.term.termName, p.term.sessionName].filter(Boolean).join(", ")}` : ""}
      </span>
      <span className="text-xs text-gray-600">
        Reference: <span className="font-mono">{p.reference}</span>
      </span>
    </div>
  );
}

// Shown when the backend answers 409 DUPLICATE_REFERENCE. Not recording is
// the default: Cancel is the filled, focused button, Escape and clicking
// away cancel, and recording anyway needs a checkbox ticked first —
// a transfer recorded twice overstates what a parent has paid, and the
// parent won't report it.
export function DuplicateReferenceDialog({
  duplicates,
  onCancel,
  onConfirm,
  confirming,
}: {
  duplicates: any[] | null;
  onCancel: () => void;
  onConfirm: () => void;
  confirming: boolean;
}) {
  const [checked, setChecked] = useState(false);
  if (!duplicates) return null;
  const cancel = () => { setChecked(false); onCancel(); };
  return (
    <Dialog open onClose={() => { if (!confirming) cancel(); }} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "12px" } }}>
      <div className="p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-black">This reference has already been recorded</h2>
          <p className="text-sm text-gray-600 mt-1">
            Check the bank statement before going on. Recording the same transfer twice
            makes it look as if the parent has paid more than they have.
          </p>
        </div>

        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4">
          {duplicates.map((p) => <RecordedPayment key={p._id} p={p} />)}
        </div>

        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
          label={<span className="text-sm">I&apos;ve checked the bank statement: this is a different transfer.</span>}
        />

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outlined" color="error" onClick={onConfirm} disabled={!checked || confirming}
            sx={{ borderRadius: "10px", textTransform: "none" }}>
            {confirming ? "Recording…" : "Record it as a separate payment"}
          </Button>
          <Button variant="contained" color="tertiary" onClick={cancel} disabled={confirming} autoFocus
            sx={{ color: "white", borderRadius: "10px", textTransform: "none" }}>
            Don&apos;t record it
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

// Check a bank statement line before entering anything
export function ReferenceLookup() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<
    { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "done"; query: string; results: any[] }
  >({ kind: "idle" });

  const lookup = async () => {
    const q = query.trim();
    if (q.replace(/[^a-z0-9]/gi, "").length < 3) {
      setState({ kind: "error", message: "Enter at least 3 letters or digits of the reference." });
      return;
    }
    setState({ kind: "loading" });
    try {
      const res = await SERVER.get("payment/search", { params: { reference: q } });
      setState({ kind: "done", query: q, results: res?.data?.data || [] });
    } catch (err: any) {
      setState({ kind: "error", message: err?.response?.data?.error || "Couldn't check that reference. Please try again." });
    }
  };

  const exact = state.kind === "done" ? state.results.filter((r) => r.match === "exact") : [];
  const close = state.kind === "done" ? state.results.filter((r) => r.match !== "exact") : [];

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-6">
      <p className="text-sm font-semibold text-black">Check a bank line</p>
      <p className="text-xs text-gray-500 mt-0.5 mb-3">
        Paste the narration or reference from the bank statement to see whether it&apos;s already been recorded.
      </p>
      <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); lookup(); }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. QM/9016 ABDULBASIT ALA"
          aria-label="Bank narration or reference"
          className="flex-1 min-w-[220px] border border-gray-300 rounded-lg p-2.5 text-sm"
        />
        <Button type="submit" variant="outlined" color="tertiary" startIcon={<Search />}
          disabled={state.kind === "loading"} sx={{ borderRadius: "10px", textTransform: "none" }}>
          {state.kind === "loading" ? "Checking…" : "Check"}
        </Button>
      </form>

      {state.kind === "error" && <p className="text-sm text-red-600 mt-3">{state.message}</p>}

      {state.kind === "done" && (
        <div className="mt-3">
          {state.results.length === 0 ? (
            <p className="text-sm text-black">
              Nothing recorded with a reference like &ldquo;{state.query}&rdquo;.
            </p>
          ) : (
            <>
              {exact.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Already recorded</p>
                  {exact.map((p) => <RecordedPayment key={p._id} p={p} />)}
                </div>
              )}
              {close.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {exact.length > 0 ? "Similar references" : "No exact match — similar references"}
                  </p>
                  {close.map((p) => <RecordedPayment key={p._id} p={p} />)}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
