import { useState } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { createPortal } from "react-dom";

import ReportCard from "../Results/ReportCard";

// Renders a /portal/student/results or /portal/child/:id/results payload
// (same shape). Shared by the student's own page and a parent's view of a
// child, so the two can never show different figures for the same term.
// Everything shown comes from the API — no totals or positions here.
//
// childName set → copy is written to a parent about that child;
// unset → copy is written to the student.
export default function ResultsView({
  data,
  selectedKey,
  onSelect,
  schoolInfo,
  childName,
}: {
  data: any;
  selectedKey: string; // "termId:sessionId", or "" for the API's default
  onSelect: (key: string) => void;
  schoolInfo?: any;
  childName?: string;
}) {
  const [printing, setPrinting] = useState(false);

  const print = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  const available = data?.available || [];
  const report = data?.report;

  // Nothing released yet — the commonest state for most of a term
  if (available.length === 0 || !report) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">No results yet</h1>
        <p className="mt-2 text-sm text-gray-1 leading-relaxed">
          {childName
            ? `${childName}'s results appear here once the school releases them.`
            : "Your results appear here once your school releases them."}{" "}
          Teachers are usually still marking until the end of term.
        </p>
      </div>
    );
  }

  const currentKey =
    selectedKey || `${data.selected.termId}:${data.selected.sessionId}`;

  const meta = {
    assessments: report.assessments,
    subjects: report.subjects,
    term: report.term,
    session: report.session,
    gradeBands: report.gradeBands,
  };

  const armLabel = `${report.classArm?.armName?.toUpperCase() || ""}`;

  return (
    <>
      <div className="flex flex-col gap-5 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          {available.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Term</InputLabel>
              <Select
                value={currentKey}
                label="Term"
                onChange={(e) => onSelect(e.target.value)}
                sx={{ borderRadius: "10px" }}
              >
                {available.map((a: any) => (
                  <MenuItem
                    key={`${a.termId}:${a.sessionId}`}
                    value={`${a.termId}:${a.sessionId}`}
                  >
                    {a.termName} · {a.sessionName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <div className="flex-1" />

          <button
            onClick={print}
            className="px-4 py-2.5 rounded-[10px] text-sm font-medium text-white bg-tertiary hover:bg-secondary transition-colors"
          >
            Print
          </button>
        </div>

        <ReportCard
          report={report.mine}
          meta={meta}
          armLabel={armLabel}
          schoolName={schoolInfo?.school?.name}
          principalName={schoolInfo?.principal?.name}
          formTeacherName={report.formTeacher?.name}
        />
      </div>

      {printing &&
        createPortal(
          <div id="print-area" className="hidden print:block">
            <div className="report-page">
              <ReportCard
                report={report.mine}
                meta={meta}
                armLabel={armLabel}
                schoolName={schoolInfo?.school?.name}
                principalName={schoolInfo?.principal?.name}
                formTeacherName={report.formTeacher?.name}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
