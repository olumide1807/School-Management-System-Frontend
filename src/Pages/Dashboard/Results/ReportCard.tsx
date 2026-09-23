// Presentational only — takes one student's report plus the class-level
// metadata from GET /result/report/class/:armId, and renders it.
// Reused later by the parent and student portals, so keep it free of
// data fetching and page chrome.

export const ordinal = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "—";
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};

type Props = {
  report: any;
  meta: {
    assessments: { name: string; maxScore: number }[];
    subjects: { subjectId: string; subjectName: string; stats: any }[];
    term: { termName: string };
    session: { sessionName: string };
    gradeBands: { grade: string; remark: string; from: number; to: number }[];
  };
  armLabel: string;
  schoolName?: string;
  principalName?: string;
  formTeacherName?: string;
};

export default function ReportCard({
  report,
  meta,
  armLabel,
  schoolName,
  principalName,
  formTeacherName,
}: Props) {
  const { student, subjects, summary, attendance } = report;
  const statsFor = (subjectId: string) =>
    meta.subjects.find((s) => s.subjectId === subjectId)?.stats;

  const fullName = [student.surName, student.firstName, student.otherName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-white text-black border border-[#DEE0E0] rounded-[12px] p-6 print:border-0 print:rounded-none print:p-0">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#DEE0E0] pb-4 mb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-tight">
            {schoolName || "Student Report"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {meta.term.termName} report · {meta.session.sessionName} session
          </p>
        </div>
      </div>

      {/* Student details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 mb-5 text-sm">
        <div>
          <p className="text-xs text-gray-500">Name</p>
          <p className="font-medium">{fullName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Student ID</p>
          <p className="font-medium">{student.studentID || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Class</p>
          <p className="font-medium">{armLabel}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Attendance</p>
          <p className="font-medium">
            {attendance.total > 0
              ? `${attendance.present} of ${attendance.total} days`
              : "Not recorded"}
          </p>
        </div>
      </div>

      {/* Subjects */}
      <div className="overflow-x-auto mb-5">
        <table className="w-full text-sm border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-[#F5F8F9] text-[11px] text-gray-600">
              <th className="text-left font-medium px-3 py-2">Subject</th>
              {meta.assessments.map((a) => (
                <th key={a.name} className="font-medium px-2 py-2 text-center">
                  {a.name}
                  <span className="block text-gray-400 font-normal">
                    /{a.maxScore}
                  </span>
                </th>
              ))}
              <th className="font-medium px-2 py-2 text-center">Total</th>
              <th className="font-medium px-2 py-2 text-center">Grade</th>
              <th className="font-medium px-2 py-2 text-left">Remark</th>
              <th className="font-medium px-2 py-2 text-center">Pos</th>
              <th className="font-medium px-2 py-2 text-center">Class avg</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s: any) => {
              const stats = statsFor(s.subjectId);
              return (
                <tr key={s.subjectId} className="border-t border-[#EFF5F8]">
                  <td className="px-3 py-2">{s.subjectName}</td>
                  {meta.assessments.map((a) => {
                    const found = s.scores?.find(
                      (sc: any) => sc.name === a.name,
                    );
                    return (
                      <td
                        key={a.name}
                        className="px-2 py-2 text-center tabular-nums"
                      >
                        {found ? (
                          found.score
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center font-medium tabular-nums">
                    {s.entered ? (
                      s.Total
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td
                    className="px-2 py-2 text-center font-medium"
                    style={{ color: s.color || undefined }}
                  >
                    {s.grade || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-2 py-2 text-gray-600">
                    {s.entered ? (
                      s.remark || "—"
                    ) : (
                      <span className="italic text-gray-400">
                        Not yet entered
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums">
                    {s.entered ? (
                      ordinal(s.position)
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums text-gray-600">
                    {stats?.average ?? <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-[#F5F8F9] rounded-[8px] px-4 py-3">
          <p className="text-xs text-gray-500">Average</p>
          <p className="text-xl font-semibold tabular-nums mt-0.5">
            {summary.average ?? "—"}
          </p>
        </div>
        <div className="bg-[#F5F8F9] rounded-[8px] px-4 py-3">
          <p className="text-xs text-gray-500">Position</p>
          <p className="text-xl font-semibold tabular-nums mt-0.5">
            {ordinal(summary.position)}
            {summary.position !== null && (
              <span className="text-sm text-gray-500 font-normal">
                {" "}
                of {summary.outOf}
              </span>
            )}
          </p>
        </div>
        <div className="bg-[#F5F8F9] rounded-[8px] px-4 py-3">
          <p className="text-xs text-gray-500">Subjects graded</p>
          <p className="text-xl font-semibold tabular-nums mt-0.5">
            {summary.subjectsGraded}
            <span className="text-sm text-gray-500 font-normal">
              {" "}
              of {summary.subjectsOffered}
            </span>
          </p>
        </div>
      </div>

      {summary.subjectsGraded < summary.subjectsOffered && (
        <p className="text-xs text-gray-500 mb-5">
          Average and position are based on graded subjects only, and will
          change as remaining scores are entered.
        </p>
      )}

      {/* Grade key */}
      {meta.gradeBands.length > 0 && (
        <div className="border-t border-[#DEE0E0] pt-3">
          <p className="text-xs text-gray-500 mb-2">Grading key</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            {[...meta.gradeBands]
              .sort((a, b) => (b.from ?? 0) - (a.from ?? 0))
              .map((b) => (
                <span key={b.grade}>
                  <span className="font-medium text-black">{b.grade}</span>{" "}
                  {b.from}–{b.to} {b.remark}
                </span>
              ))}
          </div>

          {/* Comments */}
          <div className="border-t border-[#DEE0E0] pt-4 mt-4 flex flex-col gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Form teacher's comment
              </p>
              <p className="text-sm text-black">
                {report.comments?.teacher || "—"}
              </p>
              <div className="mt-6 border-b border-gray-300 w-56" />
              <p className="text-xs text-gray-500 mt-1">
                {formTeacherName || "Form teacher"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Principal's comment</p>
              <p className="text-sm text-black">
                {report.comments?.principal || "—"}
              </p>
              <div className="mt-6 border-b border-gray-300 w-56" />
              <p className="text-xs text-gray-500 mt-1">
                {principalName || "Principal"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
