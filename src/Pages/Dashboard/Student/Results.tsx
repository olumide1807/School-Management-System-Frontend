import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { createPortal } from "react-dom";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";
import ReportCard from "../Results/ReportCard";

export default function StudentResults() {
  const [selected, setSelected] = useState(""); // "termId:sessionId"
  const [printing, setPrinting] = useState(false);

  const [termId, sessionId] = selected ? selected.split(":") : ["", ""];

  const { data, isPending, isError } = useQuery({
    queryKey: ["student-results", termId, sessionId],
    queryFn: async () => {
      const query =
        termId && sessionId ? `?termId=${termId}&sessionId=${sessionId}` : "";
      const res = await SERVER.get(`portal/student/results${query}`);
      return res?.data?.data;
    },
    retry: false,
  });

  const { data: schoolInfo } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res = await SERVER.get("settings/school-info");
      return res?.data?.data;
    },
    retry: false,
  });

  const print = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  if (isPending) return <Loader />;

  if (isError) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">
          Couldn&apos;t load your results
        </h1>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or let your school know if this keeps happening.
        </p>
      </div>
    );
  }

  const available = data?.available || [];
  const report = data?.report;

  // Nothing released yet — the commonest state for most of a term
  if (available.length === 0 || !report) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">No results yet</h1>
        <p className="mt-2 text-sm text-gray-1 leading-relaxed">
          Your results appear here once your school releases them. Teachers are
          usually still marking until the end of term.
        </p>
      </div>
    );
  }

  const currentKey =
    selected || `${data.selected.termId}:${data.selected.sessionId}`;

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
                onChange={(e) => setSelected(e.target.value)}
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
