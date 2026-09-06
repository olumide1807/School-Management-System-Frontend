import { useState, useEffect } from "react";
import { Button, Chip } from "@mui/material";
import { Save, Lock, EventBusy, AccessTime } from "@mui/icons-material";
import SERVER from "../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionTerm } from "../../../services/api-call";
import { toast } from "react-toastify";
import { toastOptions } from "../../../Utils/toastOptions";
import Loader from "../../loaders/Loader";

// Frontend statuses admin can select (Late is auto-derived by backend)
type InputStatus = "present" | "absent" | "on_leave" | null;
type DerivedStatus = "present" | "absent" | "late" | "on_leave";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  present: { label: "Present", bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  absent: { label: "Absent", bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  late: { label: "Late", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  on_leave: { label: "On Leave", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
};

const TABS = ["Mark Attendance", "View Records"];
const getTodayISO = () => new Date().toISOString().split("T")[0];
const getDaysAgoISO = (days: number) => {
  const d = new Date(); d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
};
const getCurrentTimeHHMM = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

/**
 * Client-side preview of late status (mirrors backend logic)
 * Returns "late" if checkInTime > startTime + gracePeriod, else "present"
 */
const previewStatus = (
  inputStatus: InputStatus,
  checkInTime: string,
  schoolStartTime: string,
  gracePeriodMinutes: number
): DerivedStatus => {
  if (!inputStatus || inputStatus === "absent" || inputStatus === "on_leave") {
    return inputStatus as DerivedStatus || "absent";
  }
  if (!checkInTime) return "present";
  const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const cutoff = toMins(schoolStartTime) + gracePeriodMinutes;
  return toMins(checkInTime) <= cutoff ? "present" : "late";
};

export default function StaffAttendance() {
  const [activeTab, setActiveTab] = useState(0);
  const session = useSessionTerm();
  const sessionStatus = session?.data?.data?.data?.status;
  const activeSession = session?.data?.data?.data?.session;
  const activeTerm = session?.data?.data?.data?.term;
  const holidayType = session?.data?.data?.data?.holidayType;
  const nextTerm = session?.data?.data?.data?.nextTerm;

  return (
    <div className="flex flex-col">
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-1">
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-sm font-medium relative ${activeTab === i ? "text-tertiary" : "text-gray-500 hover:text-gray-700"}`}>
              {tab}
              {activeTab === i && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary" />}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: activeTab === 0 ? "block" : "none" }}>
        <MarkTab sessionStatus={sessionStatus} activeSession={activeSession} activeTerm={activeTerm} holidayType={holidayType} nextTerm={nextTerm} />
      </div>
      <div style={{ display: activeTab === 1 ? "block" : "none" }}>
        <RecordsTab activeSession={activeSession} activeTerm={activeTerm} />
      </div>
    </div>
  );
}

function MarkTab({ sessionStatus, activeSession, activeTerm, holidayType, nextTerm }: any) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [filterDept, setFilterDept] = useState<"all" | "academic" | "non-academic">("all");
  // Map of staffId → { status, checkInTime }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: InputStatus; checkInTime: string }>>({});
  const [saving, setSaving] = useState(false);

  const isToday = selectedDate === getTodayISO();
  const isLocked = !isToday;
  const isOnHoliday = sessionStatus !== "active";

  // Fetch school settings for start time + grace period
  const { data: settingsData } = useQuery({
    queryKey: ["school-settings"],
    queryFn: async () => { const res = await SERVER.get("settings"); return res?.data; },
    retry: false,
  });
  const schoolStartTime = settingsData?.data?.attendanceSettings?.schoolStartTime || "08:00";
  const gracePeriodMinutes = settingsData?.data?.attendanceSettings?.gracePeriodMinutes ?? 15;

  const { data: staffData, isPending: staffPending } = useQuery({
    queryKey: ["all-staff"],
    queryFn: async () => { const res = await SERVER.get("staff"); return res?.data; },
    retry: false,
  });
  const allStaff = (staffData?.data || []).filter((s: any) => s.isActive !== false);

  const { data: attendanceData, isPending: attPending } = useQuery({
    queryKey: ["staff-attendance-date", selectedDate],
    queryFn: async () => { const res = await SERVER.get(`staff-attendance?date=${selectedDate}`); return res?.data; },
    enabled: !!selectedDate && !isOnHoliday,
    retry: false,
  });
  const existingRecords = attendanceData?.data || [];

  // Init map from existing records
  useEffect(() => {
    if (!allStaff.length) { setAttendanceMap({}); return; }
    const map: Record<string, { status: InputStatus; checkInTime: string }> = {};
    allStaff.forEach((s: any) => {
      const existing = existingRecords.find((r: any) => r.staffId === s._id);
      if (existing) {
        // Map derived statuses back to input statuses
        const inputStatus: InputStatus =
          existing.status === "late" ? "present" :
          existing.status === "present" ? "present" :
          existing.status === "absent" ? "absent" :
          existing.status === "on_leave" ? "on_leave" : null;
        map[s._id] = { status: inputStatus, checkInTime: existing.checkInTime || "" };
      } else {
        map[s._id] = { status: null, checkInTime: "" };
      }
    });
    setAttendanceMap(map);
  }, [allStaff.length, existingRecords.length, selectedDate]);

  const setStaffStatus = (staffId: string, status: InputStatus) => {
    if (isLocked) return;
    setAttendanceMap(prev => ({
      ...prev,
      [staffId]: {
        // Toggle off if clicking same status
        status: prev[staffId]?.status === status ? null : status,
        // Auto-fill current time when marking present
        checkInTime: status === "present" && prev[staffId]?.status !== "present"
          ? getCurrentTimeHHMM()
          : status !== "present" ? ""
          : prev[staffId]?.checkInTime || ""
      }
    }));
  };

  const setCheckInTime = (staffId: string, time: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], checkInTime: time }
    }));
  };

  const markAllPresent = () => {
    if (isLocked) return;
    const currentTime = getCurrentTimeHHMM();
    const map: Record<string, { status: InputStatus; checkInTime: string }> = {};
    filteredStaff.forEach((s: any) => {
      map[s._id] = { status: "present", checkInTime: currentTime };
    });
    setAttendanceMap(prev => ({ ...prev, ...map }));
  };

  const markAllAbsent = () => {
    if (isLocked) return;
    const map: Record<string, { status: InputStatus; checkInTime: string }> = {};
    filteredStaff.forEach((s: any) => { map[s._id] = { status: "absent", checkInTime: "" }; });
    setAttendanceMap(prev => ({ ...prev, ...map }));
  };

  const handleSave = async () => {
    const records = allStaff
      .filter((s: any) => attendanceMap[s._id]?.status !== null && attendanceMap[s._id]?.status !== undefined)
      .map((s: any) => ({
        staffId: s._id,
        status: attendanceMap[s._id].status,
        checkInTime: attendanceMap[s._id].checkInTime || null,
      }));

    if (records.length === 0) { toast.error("Please mark at least one staff member", toastOptions); return; }

    setSaving(true);
    try {
      await SERVER.post("staff-attendance/mark", { date: selectedDate, records });
      toast.success(`Attendance saved for ${records.length} staff`, toastOptions);
      queryClient.invalidateQueries({ queryKey: ["staff-attendance-date", selectedDate] });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to save", toastOptions);
    } finally { setSaving(false); }
  };

  const academicStaff = allStaff.filter((s: any) => s.staffType === "academic");
  const nonAcademicStaff = allStaff.filter((s: any) => s.staffType !== "academic");
  const filteredStaff = filterDept === "all" ? allStaff : filterDept === "academic" ? academicStaff : nonAcademicStaff;

  // Stats using derived statuses
  const statCounts = { present: 0, absent: 0, late: 0, on_leave: 0 };
  allStaff.forEach((s: any) => {
    const entry = attendanceMap[s._id];
    if (!entry?.status) return;
    const derived = previewStatus(entry.status, entry.checkInTime, schoolStartTime, gracePeriodMinutes);
    statCounts[derived]++;
  });
  const markedCount = Object.values(statCounts).reduce((a, b) => a + b, 0);
  const hasExisting = existingRecords.length > 0;

  if (isOnHoliday) {
    let msg = "School is currently on holiday. Staff attendance can only be marked during an active term.";
    if (holidayType === "between_terms" && nextTerm?.termName) {
      msg = `School is on holiday. ${nextTerm.termName} starts on ${nextTerm.startDate ? new Date(nextTerm.startDate).toLocaleDateString() : "TBD"}.`;
    }
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 border border-yellow-200 rounded-xl bg-yellow-50">
        <EventBusy sx={{ fontSize: 64, color: "#A16207" }} />
        <h3 className="text-xl font-semibold text-yellow-900 mt-4 mb-2">Cannot Mark Attendance Right Now</h3>
        <p className="text-sm text-yellow-800 text-center max-w-md mb-3">{msg}</p>
        <p className="text-xs text-yellow-700">You can still <strong>view past records</strong> in the View Records tab.</p>
      </div>
    );
  }

  if (staffPending || attPending) return <Loader />;

  return (
    <>
      {/* Controls */}
      <div className="bg-bg-1 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600">
            {activeSession?.sessionName || "No session"}{activeTerm?.termName ? ` · ${activeTerm.termName}` : ""}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <AccessTime fontSize="small" />
            <span>School starts: <strong>{schoolStartTime}</strong> · Grace: <strong>{gracePeriodMinutes} min</strong></span>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Date</label>
            <input type="date" value={selectedDate} max={getTodayISO()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm bg-white" />
          </div>
          <div className="flex gap-1">
            {(["all", "academic", "non-academic"] as const).map((dept) => (
              <button key={dept} onClick={() => setFilterDept(dept)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filterDept === dept ? "bg-tertiary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {dept === "all" ? "All Staff" : dept === "academic" ? `Academic (${academicStaff.length})` : `Non-Academic (${nonAcademicStaff.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info about auto-late */}
      <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-600">
        <strong>Auto-late detection:</strong> Staff arriving after <strong>{schoolStartTime}</strong> + {gracePeriodMinutes} min grace = <span className="text-yellow-700 font-medium">Late</span>. Status is shown as a preview before saving.
      </div>

      {isLocked && (
        <div className="mb-4 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 flex items-start gap-3">
          <Lock fontSize="small" className="text-gray-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">This date's records are locked.</p>
            <p className="text-xs text-gray-500 mt-1">Only super admin can edit past attendance records.</p>
          </div>
        </div>
      )}

      {hasExisting && !isLocked && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
          Attendance already recorded for this date. Edit and save to update.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", value: filteredStaff.length },
          { label: "Present", value: statCounts.present },
          { label: "Absent", value: statCounts.absent },
          { label: "Late", value: statCounts.late },
          { label: "On Leave", value: statCounts.on_leave },
        ].map(({ label, value }) => (
          <div key={label} className="border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-black">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      {!isLocked && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={markAllPresent}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            Mark All Present (now)
          </button>
          <button onClick={markAllAbsent}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 border border-red-200">
            Mark All Absent
          </button>
        </div>
      )}

      {/* Staff register */}
      {[
        { label: "Academic Staff", staff: filterDept === "non-academic" ? [] : academicStaff },
        { label: "Non-Academic Staff", staff: filterDept === "academic" ? [] : nonAcademicStaff },
      ].map(({ label, staff }) => staff.length === 0 ? null : (
        <div key={label} className="mb-6">
          <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide mb-3">{label}</h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 grid grid-cols-[40px_1fr_130px_200px_120px_100px] gap-3 text-xs font-semibold text-gray-600">
              <span>S/N</span>
              <span>Staff</span>
              <span>Staff ID</span>
              <span className="text-center">Mark</span>
              <span className="text-center">Check-in Time</span>
              <span className="text-center">Status</span>
            </div>
            <div className="divide-y divide-gray-100">
              {staff.map((s: any, i: number) => {
                const entry = attendanceMap[s._id] || { status: null, checkInTime: "" };
                const derived = entry.status ? previewStatus(entry.status, entry.checkInTime, schoolStartTime, gracePeriodMinutes) : null;
                const isExisting = existingRecords.some((r: any) => r.staffId === s._id);

                const rowBg = derived === "absent" ? "bg-red-50"
                  : derived === "late" ? "bg-yellow-50"
                  : derived === "on_leave" ? "bg-blue-50"
                  : "";

                return (
                  <div key={s._id} className={`px-4 py-3 grid grid-cols-[40px_1fr_130px_200px_120px_100px] gap-3 items-center ${rowBg}`}>
                    <span className="text-sm text-gray-500">{i + 1}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{s.title ? `${s.title} ` : ""}{s.firstName} {s.surname}</span>
                      {isExisting && <span className="text-xs text-blue-500">(saved)</span>}
                    </div>
                    <span className="text-xs text-gray-500">{s.staffID || "—"}</span>

                    {/* Status buttons */}
                    <div className="flex items-center justify-center gap-1">
                      {(["present", "absent", "on_leave"] as const).map((st) => (
                        <button key={st} onClick={() => setStaffStatus(s._id, st)} disabled={isLocked}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                            entry.status === st
                              ? `${STATUS_CONFIG[st].bg} ${STATUS_CONFIG[st].text} ring-1 ring-current`
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-40"
                          }`}>
                          {st === "on_leave" ? "Leave" : st === "present" ? "Present" : "Absent"}
                        </button>
                      ))}
                    </div>

                    {/* Check-in time — only shown when present */}
                    <div className="flex items-center justify-center">
                      {entry.status === "present" ? (
                        <input
                          type="time"
                          value={entry.checkInTime || ""}
                          onChange={(e) => setCheckInTime(s._id, e.target.value)}
                          disabled={isLocked}
                          className="border border-gray-300 rounded p-1 text-xs w-24 disabled:bg-gray-100"
                        />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </div>

                    {/* Derived status preview */}
                    <div className="flex items-center justify-center">
                      {derived ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[derived].bg} ${STATUS_CONFIG[derived].text}`}>
                          {STATUS_CONFIG[derived].label}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs italic">unmarked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {!isLocked && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-gray-500">{markedCount} of {filteredStaff.length} marked. Status is auto-derived from check-in time.</p>
          <Button color="tertiary" variant="contained" onClick={handleSave}
            disabled={saving || markedCount === 0} startIcon={<Save />}
            sx={{ color: "white", borderRadius: "10px", paddingY: "10px", paddingX: "30px", textTransform: "capitalize" }}>
            {saving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      )}
    </>
  );
}

function RecordsTab({ activeSession, activeTerm }: any) {
  const [startDate, setStartDate] = useState(getDaysAgoISO(30));
  const [endDate, setEndDate] = useState(getTodayISO());
  const [viewMode, setViewMode] = useState<"summary" | "daily">("summary");

  const { data: staffData } = useQuery({
    queryKey: ["all-staff"],
    queryFn: async () => { const res = await SERVER.get("staff"); return res?.data; },
    retry: false,
  });
  const allStaff = (staffData?.data || []).filter((s: any) => s.isActive !== false);

  const { data: recordsData, isPending } = useQuery({
    queryKey: ["staff-attendance-range", startDate, endDate],
    queryFn: async () => {
      const res = await SERVER.get(`staff-attendance?startDate=${startDate}&endDate=${endDate}`);
      return res?.data;
    },
    enabled: !!startDate && !!endDate,
    retry: false,
  });
  const records = recordsData?.data || [];

  const getStaffInfo = (staffId: string) => allStaff.find((st: any) => st._id === staffId);

  const staffSummary = allStaff.map((s: any) => {
    const sr = records.filter((r: any) => r.staffId === s._id);
    const present = sr.filter((r: any) => r.status === "present").length;
    const absent = sr.filter((r: any) => r.status === "absent").length;
    const late = sr.filter((r: any) => r.status === "late").length;
    const leave = sr.filter((r: any) => r.status === "on_leave").length;
    const total = sr.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { staff: s, present, absent, late, leave, total, rate };
  }).filter((row: any) => row.total > 0);

  const byDate: Record<string, any[]> = {};
  records.forEach((r: any) => {
    const key = new Date(r.date).toISOString().split("T")[0];
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(r);
  });
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  const totals = {
    present: records.filter((r: any) => r.status === "present").length,
    absent: records.filter((r: any) => r.status === "absent").length,
    late: records.filter((r: any) => r.status === "late").length,
    on_leave: records.filter((r: any) => r.status === "on_leave").length,
  };

  return (
    <>
      <div className="bg-bg-1 rounded-xl p-5 mb-6">
        <p className="text-sm text-gray-600 mb-3">
          {activeSession?.sessionName || "No session"}{activeTerm?.termName ? ` · ${activeTerm.termName}` : ""}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col"><label className="text-xs text-gray-600 mb-1">From</label>
            <input type="date" value={startDate} max={getTodayISO()} onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm bg-white" /></div>
          <div className="flex flex-col"><label className="text-xs text-gray-600 mb-1">To</label>
            <input type="date" value={endDate} max={getTodayISO()} onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm bg-white" /></div>
        </div>
      </div>

      {isPending ? <Loader /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Days Recorded", value: sortedDates.length },
              { label: "Present", value: totals.present },
              { label: "Absent", value: totals.absent },
              { label: "Late", value: totals.late },
              { label: "On Leave", value: totals.on_leave },
            ].map(({ label, value }) => (
              <div key={label} className="border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-black">{value}</p>
              </div>
            ))}
          </div>

          {records.length === 0 ? (
            <div className="text-center py-20 border border-gray-200 rounded-xl">
              <p className="text-gray-400">No attendance records for this period</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                {(["summary", "daily"] as const).map((mode) => (
                  <Button key={mode} variant={viewMode === mode ? "contained" : "outlined"} color="tertiary"
                    size="small" onClick={() => setViewMode(mode)}
                    sx={{ color: viewMode === mode ? "white" : undefined, borderRadius: "8px", textTransform: "capitalize" }}>
                    {mode === "summary" ? "Per-Staff Summary" : "Daily Log"}
                  </Button>
                ))}
              </div>

              {viewMode === "summary" ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 grid grid-cols-[40px_1fr_80px_80px_60px_60px_80px] gap-3 text-xs font-semibold text-gray-600">
                    <span>S/N</span><span>Staff</span>
                    <span className="text-center">Present</span><span className="text-center">Absent</span>
                    <span className="text-center">Late</span><span className="text-center">Leave</span>
                    <span className="text-center">Rate</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {staffSummary.map((row: any, i: number) => (
                      <div key={row.staff._id} className="px-4 py-2 grid grid-cols-[40px_1fr_80px_80px_60px_60px_80px] gap-3 items-center text-sm">
                        <span className="text-gray-500">{i + 1}</span>
                        <div>
                          <p className="font-medium">{row.staff.title ? `${row.staff.title} ` : ""}{row.staff.firstName} {row.staff.surname}</p>
                          <p className="text-xs text-gray-500 capitalize">{row.staff.staffType}</p>
                        </div>
                        <span className="text-center text-green-700 font-semibold">{row.present}</span>
                        <span className="text-center text-red-700 font-semibold">{row.absent}</span>
                        <span className="text-center text-yellow-700 font-semibold">{row.late}</span>
                        <span className="text-center text-blue-700 font-semibold">{row.leave}</span>
                        <span className="text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            row.rate >= 75 ? "bg-green-100 text-green-700" : row.rate >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                          }`}>{row.total > 0 ? `${row.rate}%` : "—"}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {sortedDates.map((dateKey) => {
                    const dayRecords = byDate[dateKey];
                    const dp = dayRecords.filter((r: any) => r.status === "present").length;
                    const da = dayRecords.filter((r: any) => r.status === "absent").length;
                    const dl = dayRecords.filter((r: any) => r.status === "late").length;
                    const dlv = dayRecords.filter((r: any) => r.status === "on_leave").length;
                    return (
                      <div key={dateKey} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                          <p className="font-semibold text-sm">
                            {new Date(dateKey).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {[["present", dp], ["absent", da], ["late", dl], ["on_leave", dlv]].map(([st, count]: any) =>
                              count > 0 ? (
                                <Chip key={st} size="small" label={`${count} ${STATUS_CONFIG[st]?.label}`}
                                  sx={{
                                    backgroundColor: st === "present" ? "#DCFCE7" : st === "absent" ? "#FEE2E2" : st === "late" ? "#FEF9C3" : "#DBEAFE",
                                    color: st === "present" ? "#15803D" : st === "absent" ? "#B91C1C" : st === "late" ? "#A16207" : "#1D4ED8"
                                  }} />
                              ) : null
                            )}
                          </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {dayRecords.map((r: any) => {
                            const s = getStaffInfo(r.staffId);
                            return (
                              <div key={r._id} className="px-4 py-2 flex items-center justify-between text-sm">
                                <div>
                                  <span>{s ? `${s.title ? s.title + " " : ""}${s.firstName} ${s.surname}` : "Unknown"}</span>
                                  {r.checkInTime && (
                                    <span className="text-xs text-gray-500 ml-2">({r.checkInTime})</span>
                                  )}
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[r.status]?.bg} ${STATUS_CONFIG[r.status]?.text}`}>
                                  {STATUS_CONFIG[r.status]?.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}