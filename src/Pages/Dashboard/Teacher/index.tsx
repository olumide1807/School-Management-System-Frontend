import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import SERVER from "../../../Utils/server";
import { useClassLevels, useSessionTerm } from "../../../services/api-call";
import useMyClasses from "../../../hooks/useMyClasses";
import useMySubjects from "../../../hooks/useMySubjects";
import Loader from "../../loaders/Loader";

const todayISO = () => new Date().toISOString().split("T")[0];

const dayKey = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

// Monday of the current week, as ISO
const weekStartISO = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
};

const isWeekend = () => {
  const d = new Date().getDay();
  return d === 0 || d === 6;
};

const minutesToLabel = (total: number) => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, "0")}${ampm}`;
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const userData = useSelector((state: any) => state.user?.user);
  const firstName = userData?.firstName || "there";

  const { myClasses, allArms, isPending: classesPending } = useMyClasses();
  const { mySubjects } = useMySubjects();

  const levelsData = useClassLevels();
  const classLevels = levelsData?.data?.data?.data || [];

  const session = useSessionTerm();
  const activeTerm = session?.data?.data?.data?.term;
  const activeSession = session?.data?.data?.data?.session;
  const sessionStatus = session?.data?.data?.data?.status;

  const date = todayISO();
  const weekend = isWeekend();
  const displayDay = weekend ? "monday" : dayKey();
  const formClass = myClasses[0];

  const armLabel = (armId: string) => {
    const arm = allArms.find((a: any) => a._id === armId);
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  // ---------- Subject names ----------
  const { data: subjectsData } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const res = await SERVER.get("subject");
      return res?.data;
    },
    retry: false,
  });
  const allSubjects = subjectsData?.data || [];

  const subjectName = (subjectId: string) =>
    allSubjects.find((s: any) => s._id === subjectId)?.subjectName || "Subject";

  // ---------- Teaching contexts: one row per arm, roles merged ----------
  const contexts = useMemo(() => {
    const byArm: Record<
      string,
      { armId: string; isForm: boolean; subjects: string[] }
    > = {};

    myClasses.forEach((arm: any) => {
      byArm[arm._id] = { armId: arm._id, isForm: true, subjects: [] };
    });

    mySubjects.forEach((sp: any) => {
      if (!sp.classArmId) return;
      if (!byArm[sp.classArmId]) {
        byArm[sp.classArmId] = {
          armId: sp.classArmId,
          isForm: false,
          subjects: [],
        };
      }
      const name = subjectName(sp.subjectId);
      if (!byArm[sp.classArmId].subjects.includes(name)) {
        byArm[sp.classArmId].subjects.push(name);
      }
    });

    return Object.values(byArm);
  }, [myClasses, mySubjects, allSubjects]);

  const termProgress = useMemo(() => {
    if (!activeTerm?.termStartDate || !activeTerm?.termEndDate) return null;
    const start = new Date(activeTerm.termStartDate);
    const end = new Date(activeTerm.termEndDate);
    const now = new Date();
    const msWeek = 7 * 24 * 60 * 60 * 1000;

    if (now < start) return { state: "upcoming" as const, start, end };
    if (now > end) return { state: "ended" as const, start, end };

    const totalWeeks = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / msWeek),
    );
    const currentWeek = Math.min(
      totalWeeks,
      Math.max(1, Math.ceil((now.getTime() - start.getTime()) / msWeek)),
    );
    return { state: "active" as const, currentWeek, totalWeeks, end };
  }, [activeTerm]);

  // ---------- Today's register status (form class only) ----------
  const { data: attendanceToday } = useQuery({
    queryKey: ["class-attendance", formClass?._id, date],
    queryFn: async () => {
      const res = await SERVER.get(
        `attendance?classArmId=${formClass._id}&date=${date}`,
      );
      return res?.data;
    },
    enabled: !!formClass?._id,
    retry: false,
  });
  const todayRecords = attendanceToday?.data || [];

  const { data: studentsData } = useQuery({
    queryKey: ["class-students", formClass?._id],
    queryFn: async () => {
      const res = await SERVER.get(`student/class/${formClass._id}`);
      return res?.data;
    },
    enabled: !!formClass?._id,
    retry: false,
  });
  const students = studentsData?.data || [];

  const registerTaken = todayRecords.length > 0;

  const absentToday = useMemo(() => {
    const absentIds = todayRecords
      .filter((r: any) => r.status === "absent")
      .map((r: any) => String(r.studentId));
    return students.filter((s: any) => absentIds.includes(String(s._id)));
  }, [todayRecords, students]);

  // ---------- This week's attendance rate ----------
  const { data: weekData } = useQuery({
    queryKey: ["class-attendance-week", formClass?._id, weekStartISO()],
    queryFn: async () => {
      const res = await SERVER.get(
        `attendance?classArmId=${formClass._id}&startDate=${weekStartISO()}&endDate=${date}`,
      );
      return res?.data;
    },
    enabled: !!formClass?._id,
    retry: false,
  });
  const weekRecords = weekData?.data || [];
  const weekRate =
    weekRecords.length > 0
      ? Math.round(
          (weekRecords.filter((r: any) => r.status === "present").length /
            weekRecords.length) *
            100,
        )
      : null;

  // ---------- Period settings ----------
  const { data: settingsData } = useQuery({
    queryKey: ["period-settings"],
    queryFn: async () => {
      const res = await SERVER.get("timetable-grid/settings");
      return res?.data;
    },
    retry: false,
  });
  const settings = settingsData?.data;

  const { data: announcementsData } = useQuery({
    queryKey: ["announcements-available"],
    queryFn: async () => {
      const res = await SERVER.get("announcement?type=available");
      return res?.data;
    },
    retry: false,
  });
  const announcements = (announcementsData?.data || []).slice(0, 3);

  const { data: dayCheck } = useQuery({
    queryKey: ["school-day", date],
    queryFn: async () => {
      const res = await SERVER.get(`calendar/check?date=${date}`);
      return res?.data?.data;
    },
    retry: false,
  });
  const closure = dayCheck?.closure || null;

  // Rebuild the period sequence the same way the Timetable builder does
  const periodSlots = useMemo(() => {
    if (!settings?.startTime || !settings?.endTime) return [];
    const slots: {
      index: number;
      label: string;
      start: number;
      end: number;
      isBreak: boolean;
    }[] = [];
    const schoolStart = toMinutes(settings.startTime);
    const schoolEnd = toMinutes(settings.endTime);
    const dur = settings.periodDuration || 40;

    const breaks = [...(settings.breaks || [])].sort(
      (a: any, b: any) => toMinutes(a.startTime) - toMinutes(b.startTime),
    );

    let cursor = schoolStart;
    let periodNum = 1;
    let idx = 0;

    while (cursor < schoolEnd && idx < 40) {
      const nextBreak = breaks.find((b: any) => {
        const bStart = toMinutes(b.startTime);
        return bStart >= cursor && bStart < cursor + dur;
      });

      if (nextBreak) {
        const bStart = toMinutes(nextBreak.startTime);
        const bEnd = toMinutes(nextBreak.endTime);
        if (bStart > cursor) {
          slots.push({
            index: idx++,
            label: `Period ${periodNum++}`,
            start: cursor,
            end: bStart,
            isBreak: false,
          });
        }
        slots.push({
          index: idx++,
          label: nextBreak.name,
          start: bStart,
          end: bEnd,
          isBreak: true,
        });
        cursor = bEnd;
      } else {
        const end = Math.min(cursor + dur, schoolEnd);
        slots.push({
          index: idx++,
          label: `Period ${periodNum++}`,
          start: cursor,
          end,
          isBreak: false,
        });
        cursor = end;
      }
    }
    return slots;
  }, [settings]);

  // ---------- Grids for every arm the teacher is involved with ----------
  const armIds = contexts.map((c) => c.armId);

  const gridQueries = useQueries({
    queries: armIds.map((armId) => ({
      queryKey: ["timetable-grid", armId],
      queryFn: async () => {
        const res = await SERVER.get(`timetable-grid/grid/${armId}`);
        return { armId, grid: res?.data?.data?.grid || {} };
      },
      retry: false,
    })),
  });

  // Which subjects does this teacher own in a given arm?
  const mySubjectIdsInArm = (armId: string) =>
    mySubjects
      .filter((sp: any) => sp.classArmId === armId)
      .map((sp: any) => sp.subjectId);

  const todaysPeriods = useMemo(() => {
    const day = displayDay;
    const out: {
      start: number;
      end: number;
      label: string;
      subject: string;
      arm: string;
    }[] = [];

    gridQueries.forEach((q) => {
      const result: any = q.data;
      if (!result?.grid) return;
      const mine = mySubjectIdsInArm(result.armId);
      const dayCells = result.grid[day] || {};

      Object.entries(dayCells).forEach(([periodKey, cell]: [string, any]) => {
        if (!cell?.subjectId || !mine.includes(cell.subjectId)) return;
        const slot = periodSlots.find((s) => String(s.index) === periodKey);
        out.push({
          start: slot?.start ?? 0,
          end: slot?.end ?? 0,
          label: slot?.label || `Period ${periodKey}`,
          subject: cell.subjectName || subjectName(cell.subjectId),
          arm: armLabel(result.armId),
        });
      });
    });

    return out.sort((a, b) => a.start - b.start);
  }, [
    gridQueries.map((q) => q.dataUpdatedAt).join(","),
    periodSlots,
    mySubjects,
    allArms,
    displayDay,
  ]);

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const gridsLoading = gridQueries.some((q) => q.isPending);

  if (classesPending) return <Loader />;

  const hasNothing = contexts.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] leading-tight font-bold text-secondary tracking-[-0.01em]">
            Good day, {firstName}
          </h1>
          <p className="mt-1 text-sm text-text-ter">
            {activeTerm?.termName && activeSession?.sessionName
              ? `${activeTerm.termName}, ${activeSession.sessionName} · ${longDate(date)}`
              : longDate(date)}
          </p>
          {termProgress?.state === "active" && (
            <p className="mt-1 text-xs text-text-ter">
              Week {termProgress.currentWeek} of {termProgress.totalWeeks} ·
              term ends{" "}
              {termProgress.end.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
              })}
            </p>
          )}
          {termProgress?.state === "ended" && (
            <p className="mt-1 text-xs text-text-ter">
              Term ended{" "}
              {termProgress.end.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
              })}
            </p>
          )}
        </div>
        {formClass && (
          <span className="text-xs px-3 py-1.5 rounded-[8px] bg-bg-2 text-tertiary">
            Form teacher, {armLabel(formClass._id)}
          </span>
        )}
      </div>

      {hasNothing && (
        <div className="max-w-[520px] py-8">
          <p className="text-[15px] text-text-pry">
            You aren't assigned to a class or a subject yet.
          </p>
          <p className="mt-2 text-sm text-gray-1 leading-relaxed">
            Once your school administrator assigns you, your classes and
            subjects will appear here.
          </p>
        </div>
      )}

      {closure && (
        <div className="rounded-[12px] border border-[#DEE0E0] px-5 py-4">
          <p className="text-[15px] font-medium text-secondary">
            No school today
          </p>
          <p className="text-[13px] text-text-ter mt-0.5">{closure.name}</p>
        </div>
      )}

      {/* ---------- Register prompt ---------- */}
      {formClass &&
        !weekend &&
        !closure &&
        sessionStatus !== "holiday" &&
        (registerTaken ? (
          <div className="rounded-[12px] border border-[#DEE0E0] px-5 py-4">
            <p className="text-[15px] font-medium text-secondary">
              Register taken for {armLabel(formClass._id)}
            </p>
            {absentToday.length === 0 ? (
              <p className="text-[13px] text-text-ter mt-1">
                Everyone present today.
              </p>
            ) : (
              <>
                <p className="text-[13px] text-text-ter mt-1">
                  {absentToday.length} absent today
                </p>
                <ul className="flex flex-wrap gap-2 mt-3">
                  {absentToday.map((s: any) => (
                    <li key={s._id}>
                      <button
                        onClick={() =>
                          navigate(
                            `/student-management/student-profile/${s._id}`,
                          )
                        }
                        className="text-[13px] px-3 py-1.5 rounded-[8px] bg-[#FAEEDA] text-[#854F0B] hover:underline"
                      >
                        {`${s.firstName || ""} ${s.surName || ""}`.trim()}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] bg-[#FAEEDA] px-5 py-4">
            <div>
              <p className="text-[15px] font-medium text-[#854F0B]">
                Register not taken
              </p>
              <p className="text-[13px] text-[#854F0B] mt-0.5">
                {students.length}{" "}
                {students.length === 1 ? "student" : "students"} in{" "}
                {armLabel(formClass._id)} · you can only mark today's attendance
              </p>
            </div>
            <button
              onClick={() => navigate("/school-management/attendance")}
              className="px-5 py-2.5 rounded-[10px] text-sm font-medium text-white bg-tertiary hover:bg-secondary transition-colors whitespace-nowrap"
            >
              Take register
            </button>
          </div>
        ))}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ---------- Today's periods ---------- */}
        <section className="w-full lg:flex-1 border border-[#DEE0E0] rounded-[12px] p-5">
          <h2 className="text-base font-semibold text-secondary mb-4">
            {weekend ? "Monday's periods" : "Your periods today"}
          </h2>

          {gridsLoading ? (
            <Loader />
          ) : todaysPeriods.length === 0 ? (
            <p className="text-sm text-text-ter py-4">
              {periodSlots.length === 0
                ? "School hours haven't been set up yet, so periods can't be shown."
                : weekend
                  ? "Nothing timetabled for you on Monday."
                  : "Nothing timetabled for you today."}
            </p>
          ) : (
            <ul>
              {todaysPeriods.map((p, i) => {
                const isNow =
                  !weekend && nowMinutes >= p.start && nowMinutes < p.end;
                const isPast = !weekend && nowMinutes >= p.end;
                return (
                  <li
                    key={i}
                    className={`flex gap-4 py-3 border-b border-[#EFF5F8] last:border-b-0 ${
                      isNow ? "bg-bg-2 -mx-5 px-5" : ""
                    }`}
                  >
                    <span
                      className={`w-[70px] shrink-0 text-[13px] tabular-nums ${
                        isNow
                          ? "text-tertiary font-medium"
                          : isPast
                            ? "text-text-ter"
                            : "text-text-sec"
                      }`}
                    >
                      {minutesToLabel(p.start)}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm ${
                          isNow
                            ? "text-tertiary font-medium"
                            : isPast
                              ? "text-text-ter"
                              : "text-text-pry"
                        }`}
                      >
                        {p.subject} · {p.arm}
                      </p>
                      {isNow && (
                        <p className="text-xs text-tertiary mt-0.5">
                          Now · ends {minutesToLabel(p.end)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ---------- Rail ---------- */}
        <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-6">
          {formClass && (
            <div className="border border-[#DEE0E0] rounded-[12px] p-5">
              <p className="text-[13px] text-gray-1">
                {armLabel(formClass._id)} this week
              </p>
              {weekRate === null ? (
                <>
                  <p className="text-[32px] leading-none font-bold text-[#B6C2C7] tabular-nums mt-2">
                    —
                  </p>
                  <p className="text-xs text-text-ter mt-1">
                    No attendance recorded yet this week
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[32px] leading-none font-bold text-tertiary tabular-nums mt-2">
                    {weekRate}%
                  </p>
                  <p className="text-xs text-text-ter mt-1">
                    average attendance
                  </p>
                </>
              )}
            </div>
          )}

          <div className="border border-[#DEE0E0] rounded-[12px] p-5">
            <h2 className="text-[13px] font-semibold text-secondary mb-3">
              Your classes
            </h2>
            {contexts.length === 0 ? (
              <p className="text-sm text-text-ter">Nothing assigned yet.</p>
            ) : (
              <ul className="flex flex-col">
                {contexts.map((c) => (
                  <li
                    key={c.armId}
                    className="border-b border-[#EFF5F8] last:border-b-0 py-2.5"
                  >
                    <button
                      onClick={() => navigate("/my-students")}
                      className="text-left w-full group"
                    >
                      <span className="block text-sm text-text-pry group-hover:text-tertiary">
                        {armLabel(c.armId)}
                      </span>
                      <span className="block text-xs text-text-ter mt-0.5">
                        {[c.isForm ? "Form teacher" : null, ...c.subjects]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

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
                    <p className="text-xs text-text-ter mt-0.5">
                      Until{" "}
                      {new Date(a.endDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
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
