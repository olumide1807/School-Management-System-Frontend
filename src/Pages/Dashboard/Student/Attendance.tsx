import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";

const STATES = {
  present: {
    label: "Present",
    dot: "#3B6D11",
    bg: "bg-[#EAF3DE]",
    text: "text-[#3B6D11]",
  },
  absent: {
    label: "Absent",
    dot: "#C2453D",
    bg: "bg-[#FDEEED]",
    text: "text-[#C2453D]",
  },
  not_marked: {
    label: "Register not taken",
    dot: "#9AA5A9",
    bg: "bg-[#F1F4F5]",
    text: "text-[#6B7678]",
  },
  upcoming: {
    label: "Still to come",
    dot: "#DEE0E0",
    bg: "bg-white",
    text: "text-[#B6C2C7]",
  },
};

// Dates are stored as UTC day-starts; format in UTC so a day never
// shifts backwards in a western timezone
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });

export default function StudentAttendance() {
  const [termId, setTermId] = useState("");

  const { data, isPending, isError } = useQuery({
    queryKey: ["student-attendance", termId],
    queryFn: async () => {
      const res = await SERVER.get(
        `portal/student/attendance${termId ? `?termId=${termId}` : ""}`,
      );
      return res?.data?.data;
    },
    retry: false,
  });

  // Group days by month so a bad patch is visible at a glance
  const months = useMemo(() => {
    const groups: Record<string, any[]> = {};
    (data?.days || []).forEach((r: any) => {
      const key = fmt(r.date, { month: "long", year: "numeric" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return Object.entries(groups);
  }, [data]);

  if (isPending) return <Loader />;

  if (isError) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">
          Couldn&apos;t load your attendance
        </h1>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or let your school know if this keeps happening.
        </p>
      </div>
    );
  }

  const { available = [], selected, summary, days = [] } = data || {};

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        {available.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Term</InputLabel>
            <Select
              value={selected?.termId || ""}
              label="Term"
              onChange={(e) => setTermId(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              {available.map((a: any) => (
                <MenuItem key={a.termId} value={a.termId}>
                  {a.termName} · {a.sessionName}
                  {a.isCurrent ? " (current)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      {days.length === 0 ? (
        <div className="border border-[#DEE0E0] rounded-[12px] p-8 text-center">
          <p className="text-[15px] text-text-pry">
            No attendance recorded for {selected?.termName || "this term"} yet
          </p>
          <p className="mt-1 text-sm text-text-ter">
            Your attendance appears here once your teacher starts taking the
            register.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-[#DEE0E0] rounded-[12px] p-5">
              <p className="text-[13px] text-gray-1">Attendance</p>
              <p className="text-[32px] leading-none font-bold text-tertiary tabular-nums mt-2">
                {summary.percentage === null ? "—" : `${summary.percentage}%`}
              </p>
              <p className="text-xs text-text-ter mt-1">of days recorded</p>
            </div>
            <div className="border border-[#DEE0E0] rounded-[12px] p-5">
              <p className="text-[13px] text-gray-1">Present</p>
              <p className="text-[32px] leading-none font-bold text-[#3B6D11] tabular-nums mt-2">
                {summary.present}
              </p>
              <p className="text-xs text-text-ter mt-1">days</p>
            </div>
            <div className="border border-[#DEE0E0] rounded-[12px] p-5">
              <p className="text-[13px] text-gray-1">Absent</p>
              <p className="text-[32px] leading-none font-bold text-[#C2453D] tabular-nums mt-2">
                {summary.absent}
              </p>
              <p className="text-xs text-text-ter mt-1">days</p>
            </div>
            <div className="border border-[#DEE0E0] rounded-[12px] p-5">
              <p className="text-[13px] text-gray-1">Not marked</p>
              <p className="text-[32px] leading-none font-bold text-[#9AA5A9] tabular-nums mt-2">
                {summary.notMarked}
              </p>
              <p className="text-xs text-text-ter mt-1">days</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Days */}
            <section className="w-full lg:flex-1 border border-[#DEE0E0] rounded-[12px] p-5">
              <h2 className="text-base font-semibold text-secondary mb-1">
                {selected?.termName} day by day
              </h2>
              {selected?.startDate && (
                <p className="text-[13px] text-text-ter mb-4">
                  {fmt(selected.startDate, { day: "numeric", month: "long" })} –{" "}
                  {fmt(selected.endDate, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {summary.upcoming > 0 &&
                    ` · ${summary.upcoming} school days left`}
                </p>
              )}

              <div className="flex flex-col gap-5">
                {months.map(([month, days]) => (
                  <div key={month}>
                    <p className="text-[13px] text-text-ter mb-2">{month}</p>
                    <div className="flex flex-wrap gap-2">
                      {days.map((d: any) => {
                        const state =
                          STATES[d.status as keyof typeof STATES] ||
                          STATES.not_marked;
                        return (
                          <div
                            key={d.date}
                            title={`${fmt(d.date, { weekday: "long", day: "numeric", month: "long" })} — ${state.label}`}
                            className={`w-10 h-10 rounded-[8px] flex items-center justify-center text-sm tabular-nums ${state.bg} ${state.text}`}
                          >
                            {fmt(d.date, { day: "numeric" })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Legend */}
            <aside className="w-full lg:w-[260px] shrink-0">
              <div className="border border-[#DEE0E0] rounded-[12px] p-5">
                <h2 className="text-[13px] font-semibold text-secondary mb-3">
                  What the colours mean
                </h2>
                <ul className="flex flex-col gap-3">
                  {Object.entries(STATES).map(([key, s]) => (
                    <li key={key} className="flex items-start gap-3">
                      <span
                        className={`w-5 h-5 rounded-[5px] shrink-0 mt-0.5 ${s.bg}`}
                        style={{ border: `1px solid ${s.dot}` }}
                      />
                      <div>
                        <p className="text-sm text-text-pry">{s.label}</p>
                        {key === "not_marked" && (
                          <p className="text-xs text-text-ter mt-0.5 leading-relaxed">
                            Your teacher didn&apos;t take the register that day.
                            These days don&apos;t count against you.
                          </p>
                        )}
                        {key === "upcoming" && (
                          <p className="text-xs text-text-ter mt-0.5 leading-relaxed">
                            School days later this term.
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
