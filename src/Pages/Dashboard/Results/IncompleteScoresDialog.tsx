import { useState } from "react";
import { Button, Checkbox, Dialog, FormControlLabel } from "@mui/material";

// What the server sends with 409 INCOMPLETE_SCORES (controller/result.js
// publishResults): the gaps, by subject
export type IncompleteSubject = {
  subjectId: string;
  subjectName: string;
  wholeClass: boolean;
  students: { studentId: string; name: string; studentID?: string; noScores: boolean; missing: string[] }[];
};
export type IncompleteWarning = { message: string; incomplete: IncompleteSubject[] };

// One subject's students, grouped by what they're missing
const groupsOf = (subject: IncompleteSubject) => {
  if (subject.wholeClass && subject.students.every((s) => s.noScores)) {
    return [{ what: "No scores for anyone in the class", students: [] as IncompleteSubject["students"] }];
  }
  const groups = new Map<string, IncompleteSubject["students"]>();
  subject.students.forEach((s) => {
    const what = s.noScores ? "No scores" : `${s.missing.join(", ")} missing`;
    groups.set(what, [...(groups.get(what) || []), s]);
  });
  return [...groups].map(([what, students]) => ({ what, students }));
};

// Shown when publishing is refused because scores are incomplete. Publishing
// releases results to families, so not publishing is the default:
// "Don't publish" is the filled, focused button, Escape and clicking away
// cancel, and publishing anyway needs a checkbox ticked first — as with
// the duplicate-payment dialog.
export default function IncompleteScoresDialog({
  warning,
  onCancel,
  onConfirm,
  publishing,
}: {
  warning: IncompleteWarning | null;
  onCancel: () => void;
  onConfirm: () => void;
  publishing: boolean;
}) {
  const [checked, setChecked] = useState(false);
  if (!warning) return null;
  const cancel = () => {
    setChecked(false);
    onCancel();
  };
  // The server's opening sentence, written for a person; the rest of its
  // message is the list, shown below as a list
  const opening = warning.message.split("\n")[0];

  return (
    <Dialog
      open
      onClose={() => {
        if (!publishing) cancel();
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <div className="p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-black">Some scores are missing</h2>
          <p className="text-sm text-gray-600 mt-1">{opening}</p>
        </div>

        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 max-h-[320px] overflow-y-auto">
          {warning.incomplete.map((subject) => (
            <section key={subject.subjectId} className="py-3 border-b border-amber-200 last:border-b-0">
              <h3 className="text-sm font-semibold text-black">{subject.subjectName}</h3>
              {groupsOf(subject).map(({ what, students }) => (
                <div key={what} className="mt-1.5">
                  <p className="text-xs font-medium text-amber-900">{what}</p>
                  {students.length > 0 && (
                    <ul className="mt-0.5 text-sm text-gray-800">
                      {students.map((s) => (
                        <li key={s.studentId}>
                          {s.name}
                          {s.studentID && <span className="font-mono text-xs text-gray-500 ml-2">{s.studentID}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          ))}
        </div>

        <p className="text-sm text-gray-600">
          Enter the missing scores and publish then. If a subject genuinely wasn&apos;t taken,
          you can publish anyway.
        </p>

        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
          label={
            <span className="text-sm">
              I understand students and parents will see these results with the scores above missing.
            </span>
          }
        />

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            variant="outlined"
            color="error"
            onClick={onConfirm}
            disabled={!checked || publishing}
            sx={{ borderRadius: "10px", textTransform: "none" }}
          >
            {publishing ? "Publishing…" : "Publish anyway"}
          </Button>
          <Button
            variant="contained"
            color="tertiary"
            onClick={cancel}
            disabled={publishing}
            autoFocus
            sx={{ color: "white", borderRadius: "10px", textTransform: "none" }}
          >
            Don&apos;t publish
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
