import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";

const longDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export default function StudentDashboard() {
  const navigate = useNavigate();

  const { data, isPending, isError } = useQuery({
    queryKey: ["student-portal-home"],
    queryFn: async () => {
      const res = await SERVER.get("portal/student/me");
      return res?.data?.data;
    },
    retry: false,
  });

  if (isPending) return <Loader />;

  if (isError || !data) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">
          Couldn&apos;t load your details
        </h1>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or let your school know if this keeps happening.
        </p>
      </div>
    );
  }

  const {
    student,
    classArm,
    term,
    session,
    attendance,
    subjects,
    announcements,
    resultsPublished,
  } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] leading-tight font-bold text-secondary tracking-[-0.01em]">
            Hello, {student.firstName}
          </h1>
          <p className="mt-1 text-sm text-text-ter">
            {term?.termName && session?.sessionName
              ? `${term.termName}, ${session.sessionName} · ${longDate(new Date())}`
              : longDate(new Date())}
          </p>
        </div>
        {classArm && (
          <span className="text-xs px-3 py-1.5 rounded-[8px] bg-bg-2 text-tertiary">
            {classArm.label}
          </span>
        )}
      </div>

      {/* Results banner — only once the school has released them */}
      {resultsPublished && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] bg-[#EAF3DE] px-5 py-4">
          <div>
            <p className="text-[15px] font-medium text-[#3B6D11]">
              Your {term?.termName} result is ready
            </p>
            <p className="text-[13px] text-[#3B6D11] mt-0.5">
              See your scores, grades and position
            </p>
          </div>
          <button
            onClick={() => navigate("/my-results")}
            className="px-5 py-2.5 rounded-[10px] text-sm font-medium text-white bg-tertiary hover:bg-secondary transition-colors whitespace-nowrap"
          >
            View result
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Subjects */}
        <section className="w-full lg:flex-1 border border-[#DEE0E0] rounded-[12px] p-5">
          <h2 className="text-base font-semibold text-secondary mb-4">
            Your subjects
          </h2>
          {subjects.length === 0 ? (
            <p className="text-sm text-text-ter py-3">
              No subjects have been set for your class yet.
            </p>
          ) : (
            <ul>
              {subjects.map((s: any) => (
                <li
                  key={s._id}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-3 border-b border-[#EFF5F8] last:border-b-0"
                >
                  <span className="text-sm text-text-pry">{s.subjectName}</span>
                  <span className="text-xs text-text-ter">
                    {s.teacher || "No teacher assigned"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Rail */}
        <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-6">
          <div className="border border-[#DEE0E0] rounded-[12px] p-5">
            <h2 className="text-[13px] font-semibold text-secondary mb-3">
              Attendance this term
            </h2>
            {attendance.percentage === null ? (
              <>
                <p className="text-[32px] leading-none font-bold text-[#B6C2C7] tabular-nums">
                  —
                </p>
                <p className="text-xs text-text-ter mt-1">
                  Nothing recorded yet
                </p>
              </>
            ) : (
              <>
                <p className="text-[32px] leading-none font-bold text-tertiary tabular-nums">
                  {attendance.percentage}%
                </p>
                <p className="text-xs text-text-ter mt-1 tabular-nums">
                  Present {attendance.present} of {attendance.total} days
                </p>
              </>
            )}
          </div>

          {classArm?.formTeacher && (
            <div className="border border-[#DEE0E0] rounded-[12px] p-5">
              <h2 className="text-[13px] font-semibold text-secondary mb-2">
                Your form teacher
              </h2>
              <p className="text-sm text-text-pry">{classArm.formTeacher}</p>
            </div>
          )}

          <div className="border border-[#DEE0E0] rounded-[12px] p-5">
            <h2 className="text-[13px] font-semibold text-secondary mb-3">
              From the school
            </h2>
            {announcements.length === 0 ? (
              <p className="text-sm text-text-ter">
                No announcements right now.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {announcements.map((a: any) => (
                  <li
                    key={a._id}
                    className="border-b border-[#EFF5F8] last:border-b-0 pb-3 last:pb-0"
                  >
                    <p className="text-sm text-text-pry">{a.title}</p>
                    {a.description && (
                      <p className="text-xs text-text-ter mt-0.5 line-clamp-2">
                        {a.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
