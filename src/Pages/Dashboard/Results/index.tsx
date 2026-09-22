import { useState, useEffect, useMemo } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import SERVER from "../../../Utils/server";
import { useClassArms, useClassLevels, useSessionTerm } from "../../../services/api-call";
import usePermissions from "../../../hooks/usePermissions";
import useMyClasses from "../../../hooks/useMyClasses";
import useMySubjects from "../../../hooks/useMySubjects";
import Loader from "../../loaders/Loader";
import ReportCard, { ordinal } from "./ReportCard";

export default function Results() {
  const permissions = usePermissions();
  const userData = useSelector((state: any) => state.user?.user);

  const armsData = useClassArms();
  const levelsData = useClassLevels();
  const allClassArms = armsData?.data?.data?.data || [];
  const classLevels = levelsData?.data?.data?.data || [];

  const { myClasses } = useMyClasses();
  const { allSpecifics } = useMySubjects();

  const session = useSessionTerm();
  const activeSession = session?.data?.data?.data?.session;
  const activeTerm = session?.data?.data?.data?.term;

  const [armId, setArmId] = useState("");
  const [termId, setTermId] = useState("");
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [printMode, setPrintMode] = useState<"one" | "all" | null>(null);

  const armLabel = (id: string) => {
    const arm = allClassArms.find((a: any) => a._id === id);
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  // Admins see every class; teachers see classes they form-teach or teach in.
  // The backend enforces the same rule — this just keeps the menu honest.
  const availableArms = useMemo(() => {
    if (permissions.canViewAllClasses) return allClassArms;
    const ids = new Set<string>([
      ...myClasses.map((c: any) => String(c._id)),
      ...allSpecifics
        .filter((sp: any) => String(sp.subjectTeacherId) === String(userData?._id))
        .map((sp: any) => String(sp.classArmId)),
    ]);
    return allClassArms.filter((a: any) => ids.has(String(a._id)));
  }, [permissions.canViewAllClasses, allClassArms, myClasses, allSpecifics, userData]);

  useEffect(() => {
    if (!armId && availableArms.length > 0) {
      // Prefer the teacher's own form class
      const own = availableArms.find((a: any) =>
        myClasses.some((c: any) => String(c._id) === String(a._id))
      );
      setArmId((own || availableArms[0])._id);
    }
  }, [availableArms, armId, myClasses]);

  useEffect(() => {
    if (!termId && activeTerm?._id) setTermId(activeTerm._id);
  }, [activeTerm, termId]);

  const { data: termsData } = useQuery({
    queryKey: ["session-terms", activeSession?._id],
    queryFn: async () => {
      const res = await SERVER.get(`session/term/${activeSession._id}`);
      return res?.data?.data || [];
    },
    enabled: !!activeSession?._id,
    retry: false,
  });
  const terms = termsData || [];

  const { data: reportData, isPending, isError } = useQuery({
    queryKey: ["class-report", armId, termId, activeSession?._id],
    queryFn: async () => {
      const res = await SERVER.get(
        `result/report/class/${armId}?termId=${termId}&sessionId=${activeSession._id}`
      );
      return res?.data?.data;
    },
    enabled: !!armId && !!termId && !!activeSession?._id,
    retry: false,
  });

  const reports = reportData?.reports || [];

  // Ranked first, then unranked alphabetically
  const ordered = useMemo(
    () =>
      [...reports].sort((a: any, b: any) => {
        const pa = a.summary.position ?? Infinity;
        const pb = b.summary.position ?? Infinity;
        if (pa !== pb) return pa - pb;
        return `${a.student.surName}`.localeCompare(`${b.student.surName}`);
      }),
    [reports]
  );

  const schoolName = userData?.schoolName; // super admin only for now — branding comes with report card settings

  const print = (mode: "one" | "all") => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 100);
  };

  const viewing = viewingIndex !== null ? ordered[viewingIndex] : null;
  const meta = reportData;

  if (availableArms.length === 0 && !armsData?.isPending) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">No classes to show</h1>
        <p className="mt-2 text-sm text-gray-1 leading-relaxed">
          Results appear here for classes you form-teach or teach a subject in.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5 print:hidden">
        {/* Selectors */}
        <div className="flex flex-wrap items-end gap-4">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={armId}
              label="Class"
              onChange={(e) => {
                setArmId(e.target.value);
                setViewingIndex(null);
              }}
              sx={{ borderRadius: "10px" }}
            >
              {availableArms.map((a: any) => (
                <MenuItem key={a._id} value={a._id}>
                  {armLabel(a._id)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Term</InputLabel>
            <Select
              value={termId}
              label="Term"
              onChange={(e) => {
                setTermId(e.target.value);
                setViewingIndex(null);
              }}
              sx={{ borderRadius: "10px" }}
            >
              {terms.map((t: any) => (
                <MenuItem key={t._id} value={t._id}>
                  {t.termName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="flex-1" />

          {reports.length > 0 && viewingIndex === null && (
            <button
              onClick={() => print("all")}
              className="px-4 py-2.5 rounded-[10px] text-sm text-tertiary border border-tertiary hover:bg-bg-2 transition-colors"
            >
              Print all {reports.length} report cards
            </button>
          )}
        </div>

        {isPending ? (
          <Loader />
        ) : isError ? (
          <div className="border border-[#DEE0E0] rounded-[12px] p-8 text-center">
            <p className="text-[15px] text-text-pry">Couldn't load this class's results</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="border border-[#DEE0E0] rounded-[12px] p-8 text-center">
            <p className="text-[15px] text-text-pry">No students in this class</p>
          </div>
        ) : viewing ? (
          /* ---------- Single report card ---------- */
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setViewingIndex(null)}
                className="text-tertiary text-sm"
              >
                ← Back to class list
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingIndex((i) => (i! > 0 ? i! - 1 : i))}
                  disabled={viewingIndex === 0}
                  className="px-3 py-2 rounded-[8px] text-sm border border-[#DEE0E0] disabled:opacity-40"
                >
                  ← Previous
                </button>
                <span className="text-xs text-text-ter tabular-nums px-1">
                  {viewingIndex! + 1} of {ordered.length}
                </span>
                <button
                  onClick={() =>
                    setViewingIndex((i) => (i! < ordered.length - 1 ? i! + 1 : i))
                  }
                  disabled={viewingIndex === ordered.length - 1}
                  className="px-3 py-2 rounded-[8px] text-sm border border-[#DEE0E0] disabled:opacity-40"
                >
                  Next →
                </button>
                <button
                  onClick={() => print("one")}
                  className="px-4 py-2 rounded-[8px] text-sm font-medium text-white bg-tertiary hover:bg-secondary transition-colors ml-2"
                >
                  Print
                </button>
              </div>
            </div>

            <ReportCard
              report={viewing}
              meta={meta}
              armLabel={armLabel(armId)}
              schoolName={schoolName}
            />
          </div>
        ) : (
          /* ---------- Class list ---------- */
          <div className="border border-[#DEE0E0] rounded-[12px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-bg-7 text-[12px] text-text-sec">
                    <th className="text-left font-medium px-4 py-3 w-16">Pos</th>
                    <th className="text-left font-medium px-4 py-3">Student</th>
                    <th className="text-center font-medium px-4 py-3">Average</th>
                    <th className="text-center font-medium px-4 py-3">Graded</th>
                    <th className="text-center font-medium px-4 py-3">Attendance</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {ordered.map((r: any, i: number) => (
                    <tr key={r.student._id} className="border-t border-[#EFF5F8]">
                      <td className="px-4 py-3 tabular-nums font-medium">
                        {ordinal(r.summary.position)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-text-pry">
                          {`${r.student.surName || ""} ${r.student.firstName || ""}`.trim()}
                        </p>
                        <p className="text-xs text-text-ter">{r.student.studentID}</p>
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">
                        {r.summary.average ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums text-text-sec">
                        {r.summary.subjectsGraded} of {r.summary.subjectsOffered}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums text-text-sec">
                        {r.attendance.total > 0
                          ? `${Math.round((r.attendance.present / r.attendance.total) * 100)}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setViewingIndex(i)}
                          className="text-sm text-tertiary hover:underline whitespace-nowrap"
                        >
                          View report card
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Print area: hidden on screen, the only thing printed ---------- */}
      {printMode && meta && (
        <div id="print-area" className="hidden print:block">
          {(printMode === "all" ? ordered : viewing ? [viewing] : []).map((r: any) => (
            <div key={r.student._id} className="report-page">
              <ReportCard
                report={r}
                meta={meta}
                armLabel={armLabel(armId)}
                schoolName={schoolName}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}