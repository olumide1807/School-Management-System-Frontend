import { useState, useEffect } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel, Chip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CheckCircle, Cancel, Save, EventBusy, Lock } from "@mui/icons-material";
import SERVER from "../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClassArms, useClassLevels, useSessionTerm } from "../../../../services/api-call";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../Utils/toastOptions";
import Loader from "../../../loaders/Loader";
import usePermissions from "../../../../hooks/usePermissions";
import useMyClasses from "../../../../hooks/useMyClasses";

interface Student {
  _id: string;
  firstName: string;
  surName: string;
  studentID: string;
  classArmId: string;
}

interface AttendanceRecord {
  _id: string;
  studentId: string;
  status: "present" | "absent";
  date: string;
  classArmId: string;
  recordedByName?: string;
}

type StatusValue = "present" | "absent" | null;

const getTodayISO = () => new Date().toISOString().split("T")[0];
const getDaysAgoISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
};

// Treats two ISO date strings as the same calendar day
const isSameLocalDay = (isoA: string, isoB: string) => {
  return new Date(isoA).toDateString() === new Date(isoB).toDateString();
};

export default function Attendance() {
  const [activeTab, setActiveTab] = useState<"mark" | "records">("mark");

  const session = useSessionTerm();
  const activeSession = session?.data?.data?.data?.session;
  const activeTerm = session?.data?.data?.data?.term;
  const sessionStatus = session?.data?.data?.data?.status;
  const holidayType = session?.data?.data?.data?.holidayType;
  const nextTerm = session?.data?.data?.data?.nextTerm;

  return (
    <div className="flex flex-col">
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("mark")}
            className={`px-6 py-3 text-sm font-medium relative ${
              activeTab === "mark" ? "text-tertiary" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mark Attendance
            {activeTab === "mark" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`px-6 py-3 text-sm font-medium relative ${
              activeTab === "records" ? "text-tertiary" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            View Records
            {activeTab === "records" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary" />
            )}
          </button>
        </div>
      </div>

      {activeTab === "mark" && (
        <MarkAttendanceTab
          activeSession={activeSession}
          activeTerm={activeTerm}
          sessionStatus={sessionStatus}
          holidayType={holidayType}
          nextTerm={nextTerm}
        />
      )}

      {activeTab === "records" && (
        <ViewRecordsTab
          activeSession={activeSession}
          activeTerm={activeTerm}
        />
      )}
    </div>
  );
}

// ============================================================
// MARK ATTENDANCE TAB
// ============================================================
function MarkAttendanceTab({
  activeSession, activeTerm, sessionStatus, holidayType, nextTerm,
}: any) {
  const queryClient = useQueryClient();

  const [selectedClassArmId, setSelectedClassArmId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  // null means "not yet marked"
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StatusValue>>({});
  const [saving, setSaving] = useState(false);

  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const permissions = usePermissions();
  const { myClasses } = useMyClasses();
  const allClassArms = allArms?.data?.data?.data || [];
  const classArms = permissions.canViewAllClasses ? allClassArms : myClasses;
  const classLevels = allLevels?.data?.data?.data || [];

  const isOnHoliday = sessionStatus !== "active";
  const isToday = isSameLocalDay(selectedDate, getTodayISO());
  // Class teacher can only edit today's records (super admin role: handled by backend)
  const selectedDay = new Date(selectedDate).getDay();
  const isWeekendDate = selectedDay === 0 || selectedDay === 6;
  const isLocked = !isToday || isWeekendDate;

  const { data: studentsData, isPending: studentsPending } = useQuery({
    queryKey: ["students-in-class", selectedClassArmId],
    queryFn: async () => {
      const res = await SERVER.get(`student/class/${selectedClassArmId}`);
      return res?.data;
    },
    enabled: !!selectedClassArmId && !isOnHoliday,
    retry: false,
  });
  const students: Student[] = studentsData?.data || [];

  const { data: attendanceData, isPending: attendancePending } = useQuery({
    queryKey: ["class-attendance", selectedClassArmId, selectedDate],
    queryFn: async () => {
      const res = await SERVER.get(
        `attendance?classArmId=${selectedClassArmId}&date=${selectedDate}`
      );
      return res?.data;
    },
    enabled: !!selectedClassArmId && !!selectedDate && !isOnHoliday,
    retry: false,
  });
  const existingRecords: AttendanceRecord[] = attendanceData?.data || [];

  useEffect(() => {
    if (!selectedClassArmId && classArms.length === 1) {
      setSelectedClassArmId(classArms[0]._id);
    }
  }, [classArms, selectedClassArmId]);

  // Initialise the map: existing records = their saved status, others = null (unmarked)
  useEffect(() => {
    if (!students.length) {
      setAttendanceMap({});
      return;
    }
    const map: Record<string, StatusValue> = {};
    students.forEach((s) => {
      const existing = existingRecords.find((r) => r.studentId === s._id);
      map[s._id] = existing?.status || null;
    });
    setAttendanceMap(map);
  }, [students, existingRecords]);

  const getArmLabel = (armId: string) => {
    const arm = classArms.find((a: any) => a._id === armId);
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  const setStudentStatus = (studentId: string, status: StatusValue) => {
    if (isLocked) return;
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    if (isLocked) return;
    const map: Record<string, StatusValue> = { ...attendanceMap };
    students.forEach((s) => {
      // Don't override already-saved records (they have a status from the server)
      const existing = existingRecords.find((r) => r.studentId === s._id);
      if (!existing) map[s._id] = "present";
      else map[s._id] = "present";
    });
    setAttendanceMap(map);
  };

  const markAllAbsent = () => {
    if (isLocked) return;
    const map: Record<string, StatusValue> = { ...attendanceMap };
    students.forEach((s) => {
      map[s._id] = "absent";
    });
    setAttendanceMap(map);
  };

  const handleSave = async () => {
    if (!selectedClassArmId || !selectedDate) {
      toast.error("Please select a class and date", toastOptions);
      return;
    }
    // Only send students that have a status set (skip "not yet marked")
    const records = students
      .map((s) => ({
        studentId: s._id,
        status: attendanceMap[s._id],
      }))
      .filter((r) => r.status === "present" || r.status === "absent") as
        { studentId: string; status: "present" | "absent" }[];

    if (records.length === 0) {
      toast.error("Please mark at least one student before saving", toastOptions);
      return;
    }

    setSaving(true);
    try {
      await SERVER.post("attendance/class", {
        classArmId: selectedClassArmId,
        date: selectedDate,
        records,
      });
      toast.success(
        `Attendance saved for ${records.length} student${records.length !== 1 ? "s" : ""}`,
        toastOptions
      );
      queryClient.invalidateQueries({
        queryKey: ["class-attendance", selectedClassArmId, selectedDate],
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to save attendance",
        toastOptions
      );
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((v) => v === "present").length;
  const absentCount = Object.values(attendanceMap).filter((v) => v === "absent").length;
  const unmarkedCount = students.length - presentCount - absentCount;
  const totalCount = students.length;
  const markedCount = presentCount + absentCount;
  const rate = markedCount > 0 ? Math.round((presentCount / markedCount) * 100) : 0;

  // Holiday block
  if (isOnHoliday) {
    let holidayMessage = "School is currently on holiday. Attendance can only be marked during an active term.";
    if (holidayType === "between_terms" && nextTerm?.termName) {
      const nextDate = nextTerm.startDate
        ? new Date(nextTerm.startDate).toLocaleDateString()
        : "TBD";
      holidayMessage = `School is on holiday between terms. ${nextTerm.termName} starts on ${nextDate}. You can mark attendance once the term begins.`;
    } else if (holidayType === "between_sessions") {
      holidayMessage = "School is on holiday between sessions. You can mark attendance once a new session and term begins.";
    } else if (holidayType === "no_next_session") {
      holidayMessage = "The current session has ended and no upcoming session has been set up. Please create a new session first.";
    } else if (holidayType === "awaiting_session") {
      holidayMessage = "No session is currently active. Please activate a session before marking attendance.";
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 border border-yellow-200 rounded-xl bg-yellow-50">
        <EventBusy sx={{ fontSize: 64, color: "#A16207" }} />
        <h3 className="text-xl font-semibold text-yellow-900 mt-4 mb-2">
          Cannot Mark Attendance Right Now
        </h3>
        <p className="text-sm text-yellow-800 text-center max-w-md mb-4">
          {holidayMessage}
        </p>
        <p className="text-xs text-yellow-700">
          You can still <strong>view past records</strong> in the View Records tab.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header / Controls */}
      <div className="bg-bg-1 rounded-xl p-5 mb-6">
        <p className="text-sm text-gray-600 mb-3">
          {activeSession?.sessionName || "No session"}
          {activeTerm?.termName ? ` · ${activeTerm.termName}` : ""}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          {classArms.length > 1 ? (
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select
              value={selectedClassArmId} label="Class"
              onChange={(e) => setSelectedClassArmId(e.target.value)}
              sx={{ borderRadius: "10px", backgroundColor: "white" }}
            >
              {classArms.map((arm: any) => (
                <MenuItem key={arm._id} value={arm._id}>{getArmLabel(arm._id)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          ) : classArms.length === 1 ? (
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Class</label>
              <p className="text-sm font-medium text-secondary py-2">
                {getArmLabel(classArms[0]._id)}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Date</label>
            <input
              type="date" value={selectedDate}
              max={getTodayISO()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {!selectedClassArmId ? (
        <div className="text-center py-20 border border-gray-200 rounded-xl">
          <p className="text-gray-500">Select a class to start marking attendance</p>
        </div>
      ) : studentsPending || attendancePending ? (
        <Loader />
      ) : students.length === 0 ? (
        <div className="text-center py-20 border border-gray-200 rounded-xl">
          <p className="text-gray-500">No students in this class</p>
        </div>
      ) : (
        <>

          {isWeekendDate && (
            <div className="mb-4 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-700 font-medium">
                {new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "long" })} isn't a school day.
              </p>
            </div>
          )}

          {/* Lock notice for past dates */}
          {isLocked && !isWeekendDate && (
            <div className="mb-4 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 flex items-start gap-3">
              <Lock fontSize="small" className="text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium">This date's records are locked.</p>
                <p className="text-xs text-gray-600 mt-1">
                  Class teachers can only mark or edit attendance for the current day.
                  Only a super admin can change past records.
                </p>
              </div>
            </div>
          )}

          

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-black">{totalCount}</p>
              {unmarkedCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">{unmarkedCount} unmarked</p>
              )}
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-green-50">
              <p className="text-xs text-gray-500 mb-1">Present</p>
              <p className="text-2xl font-bold text-green-700">{presentCount}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-red-50">
              <p className="text-xs text-gray-500 mb-1">Absent</p>
              <p className="text-2xl font-bold text-red-700">{absentCount}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-blue-50">
              <p className="text-xs text-gray-500 mb-1">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-700">
                {markedCount > 0 ? `${rate}%` : "—"}
              </p>
              {markedCount > 0 && markedCount < totalCount && (
                <p className="text-xs text-gray-500 mt-1">of marked</p>
              )}
            </div>
          </div>

          {/* Quick actions */}
          {!isLocked && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Button
                variant="outlined" color="success" size="small"
                onClick={markAllPresent} startIcon={<CheckCircle />}
                sx={{ borderRadius: "8px", textTransform: "capitalize" }}
              >
                Mark All Present
              </Button>
              <Button
                variant="outlined" color="error" size="small"
                onClick={markAllAbsent} startIcon={<Cancel />}
                sx={{ borderRadius: "8px", textTransform: "capitalize" }}
              >
                Mark All Absent
              </Button>
            </div>
          )}

          {/* Student register */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 grid grid-cols-[40px_1fr_180px_240px] gap-4 items-center text-xs font-semibold text-gray-600">
              <span>S/N</span>
              <span>Student</span>
              <span>Student ID</span>
              <span className="text-center">Status</span>
            </div>
            <div className="divide-y divide-gray-100">
              {students.map((student, i) => {
                const status = attendanceMap[student._id];
                const isExisting = existingRecords.some((r) => r.studentId === student._id);
                const rowBg =
                  status === "absent" ? "bg-red-50"
                  : status === "present" ? ""
                  : "bg-gray-50";
                return (
                  <div
                    key={student._id}
                    className={`px-4 py-3 grid grid-cols-[40px_1fr_180px_240px] gap-4 items-center transition-colors ${rowBg}`}
                  >
                    <span className="text-sm text-gray-500">{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {student.firstName} {student.surName}
                      </span>
                      {isExisting && (
                        <span className="text-xs text-blue-600">(saved)</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{student.studentID}</span>
                    <div className="flex items-center justify-center">
                      <ToggleButtonGroup
                        value={status}
                        exclusive
                        size="small"
                        disabled={isLocked}
                        onChange={(_, newValue) => {
                          // Allow setting present/absent OR clearing back to null
                          setStudentStatus(student._id, newValue);
                        }}
                      >
                        <ToggleButton
                          value="present"
                          sx={{
                            textTransform: "capitalize",
                            paddingY: "4px",
                            paddingX: "12px",
                            "&.Mui-selected": {
                              backgroundColor: "#DCFCE7",
                              color: "#15803D",
                              "&:hover": { backgroundColor: "#BBF7D0" },
                            },
                          }}
                        >
                          Present
                        </ToggleButton>
                        <ToggleButton
                          value="absent"
                          sx={{
                            textTransform: "capitalize",
                            paddingY: "4px",
                            paddingX: "12px",
                            "&.Mui-selected": {
                              backgroundColor: "#FEE2E2",
                              color: "#B91C1C",
                              "&:hover": { backgroundColor: "#FECACA" },
                            },
                          }}
                        >
                          Absent
                        </ToggleButton>
                      </ToggleButtonGroup>
                      {!status && !isLocked && (
                        <span className="ml-2 text-xs text-gray-400 italic">unmarked</span>
                      )}
                      {!status && isLocked && (
                        <span className="ml-2 text-xs text-gray-400 italic">no record</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save button */}
          {!isLocked && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-xs text-gray-500">
                Only marked students will be saved. Unmarked students are skipped.
              </p>
              <Button
                color="tertiary" variant="contained"
                onClick={handleSave} disabled={saving || markedCount === 0}
                startIcon={<Save />}
                sx={{
                  color: "white", borderRadius: "10px",
                  paddingY: "10px", paddingX: "30px", textTransform: "capitalize",
                }}
              >
                {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ============================================================
// VIEW RECORDS TAB (unchanged from previous version)
// ============================================================
function ViewRecordsTab({ activeSession, activeTerm }: any) {
  const [selectedClassArmId, setSelectedClassArmId] = useState("");
  const [startDate, setStartDate] = useState(getDaysAgoISO(30));
  const [endDate, setEndDate] = useState(getTodayISO());
  const [viewMode, setViewMode] = useState<"summary" | "daily">("summary");

  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const permissions = usePermissions();
  const { myClasses } = useMyClasses();
  const allClassArms = allArms?.data?.data?.data || [];
  const classArms = permissions.canViewAllClasses ? allClassArms : myClasses;
  const classLevels = allLevels?.data?.data?.data || [];

  useEffect(() => {
    if (!selectedClassArmId && classArms.length === 1) {
      setSelectedClassArmId(classArms[0]._id);
    }
  }, [classArms, selectedClassArmId]);

  const { data: studentsData } = useQuery({
    queryKey: ["students-in-class-records", selectedClassArmId],
    queryFn: async () => {
      const res = await SERVER.get(`student/class/${selectedClassArmId}`);
      return res?.data;
    },
    enabled: !!selectedClassArmId,
    retry: false,
  });
  const students: Student[] = studentsData?.data || [];

  const { data: recordsData, isPending } = useQuery({
    queryKey: ["attendance-range", selectedClassArmId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        classArmId: selectedClassArmId, startDate, endDate,
      });
      const res = await SERVER.get(`attendance?${params.toString()}`);
      return res?.data;
    },
    enabled: !!selectedClassArmId && !!startDate && !!endDate,
    retry: false,
  });
  const records: AttendanceRecord[] = recordsData?.data || [];

  const getArmLabel = (armId: string) => {
    const arm = classArms.find((a: any) => a._id === armId);
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  const studentSummary = students.map((s) => {
    const studentRecords = records.filter((r) => r.studentId === s._id);
    const present = studentRecords.filter((r) => r.status === "present").length;
    const absent = studentRecords.filter((r) => r.status === "absent").length;
    const total = studentRecords.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { student: s, present, absent, total, rate };
  });

  const recordsByDate: Record<string, AttendanceRecord[]> = {};
  records.forEach((r) => {
    const dateKey = new Date(r.date).toISOString().split("T")[0];
    if (!recordsByDate[dateKey]) recordsByDate[dateKey] = [];
    recordsByDate[dateKey].push(r);
  });
  const sortedDates = Object.keys(recordsByDate).sort((a, b) => b.localeCompare(a));

  const totalRecords = records.length;
  const totalPresent = records.filter((r) => r.status === "present").length;
  const totalAbsent = records.filter((r) => r.status === "absent").length;
  const overallRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
  const uniqueDates = sortedDates.length;

  return (
    <>
      <div className="bg-bg-1 rounded-xl p-5 mb-6">
        <p className="text-sm text-gray-600 mb-3">
          {activeSession?.sessionName || "No session"}
          {activeTerm?.termName ? ` · ${activeTerm.termName}` : ""}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          {classArms.length > 1 ? (
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select
                value={selectedClassArmId} label="Class"
                onChange={(e) => setSelectedClassArmId(e.target.value)}
                sx={{ borderRadius: "10px", backgroundColor: "white" }}
              >
                {classArms.map((arm: any) => (
                  <MenuItem key={arm._id} value={arm._id}>{getArmLabel(arm._id)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : classArms.length === 1 ? (
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Class</label>
              <p className="text-sm font-medium text-secondary py-2">
                {getArmLabel(classArms[0]._id)}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">From</label>
            <input
              type="date" value={startDate} max={getTodayISO()}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">To</label>
            <input
              type="date" value={endDate} max={getTodayISO()}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {!selectedClassArmId ? (
        <div className="text-center py-20 border border-gray-200 rounded-xl">
          <p className="text-gray-500">
            {classArms.length === 0
              ? "You aren't the form teacher of any class, so there's no register for you to take."
              : "Select a class to start marking attendance"}
          </p>
        </div>
      ) : isPending ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Days Recorded</p>
              <p className="text-2xl font-bold text-black">{uniqueDates}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-green-50">
              <p className="text-xs text-gray-500 mb-1">Total Present</p>
              <p className="text-2xl font-bold text-green-700">{totalPresent}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-red-50">
              <p className="text-xs text-gray-500 mb-1">Total Absent</p>
              <p className="text-2xl font-bold text-red-700">{totalAbsent}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-blue-50">
              <p className="text-xs text-gray-500 mb-1">Overall Rate</p>
              <p className="text-2xl font-bold text-blue-700">{overallRate}%</p>
            </div>
          </div>

          {totalRecords === 0 ? (
            <div className="text-center py-20 border border-gray-200 rounded-xl">
              <p className="text-gray-500">No attendance records found for this period</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={viewMode === "summary" ? "contained" : "outlined"}
                  color="tertiary" size="small"
                  onClick={() => setViewMode("summary")}
                  sx={{
                    color: viewMode === "summary" ? "white" : undefined,
                    borderRadius: "8px", textTransform: "capitalize",
                  }}
                >
                  Per-Student Summary
                </Button>
                <Button
                  variant={viewMode === "daily" ? "contained" : "outlined"}
                  color="tertiary" size="small"
                  onClick={() => setViewMode("daily")}
                  sx={{
                    color: viewMode === "daily" ? "white" : undefined,
                    borderRadius: "8px", textTransform: "capitalize",
                  }}
                >
                  Daily Log
                </Button>
              </div>

              {viewMode === "summary" ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 grid grid-cols-[40px_1fr_140px_80px_80px_100px] gap-4 items-center text-xs font-semibold text-gray-600">
                    <span>S/N</span>
                    <span>Student</span>
                    <span>Student ID</span>
                    <span className="text-center">Present</span>
                    <span className="text-center">Absent</span>
                    <span className="text-center">Rate</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {studentSummary.map((row, i) => (
                      <div
                        key={row.student._id}
                        className="px-4 py-3 grid grid-cols-[40px_1fr_140px_80px_80px_100px] gap-4 items-center text-sm"
                      >
                        <span className="text-gray-500">{i + 1}</span>
                        <span className="font-medium">
                          {row.student.firstName} {row.student.surName}
                        </span>
                        <span className="text-xs text-gray-500">{row.student.studentID}</span>
                        <span className="text-center text-green-700 font-semibold">{row.present}</span>
                        <span className="text-center text-red-700 font-semibold">{row.absent}</span>
                        <span className="text-center">
                          {row.total > 0 ? (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              row.rate >= 75 ? "bg-green-100 text-green-700"
                              : row.rate >= 50 ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                            }`}>{row.rate}%</span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {sortedDates.map((dateKey) => {
                    const dayRecords = recordsByDate[dateKey];
                    const dayPresent = dayRecords.filter((r) => r.status === "present").length;
                    const dayAbsent = dayRecords.filter((r) => r.status === "absent").length;
                    const dayRate = dayRecords.length > 0
                      ? Math.round((dayPresent / dayRecords.length) * 100) : 0;
                    return (
                      <div key={dateKey} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                          <p className="font-semibold text-sm">
                            {new Date(dateKey).toLocaleDateString("en-US", {
                              weekday: "long", year: "numeric", month: "long", day: "numeric",
                            })}
                          </p>
                          <div className="flex items-center gap-2">
                            <Chip size="small" label={`${dayPresent} present`}
                              sx={{ backgroundColor: "#DCFCE7", color: "#15803D" }} />
                            <Chip size="small" label={`${dayAbsent} absent`}
                              sx={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }} />
                            <Chip size="small" label={`${dayRate}%`}
                              sx={{ backgroundColor: "#DBEAFE", color: "#1D4ED8" }} />
                          </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {dayRecords.map((r) => {
                            const student = students.find((s) => s._id === r.studentId);
                            return (
                              <div key={r._id} className="px-4 py-2 flex items-center justify-between text-sm">
                                <span>
                                  {student ? `${student.firstName} ${student.surName}` : "Unknown student"}
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({student?.studentID || "—"})
                                  </span>
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  r.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                  {r.status === "present" ? "Present" : "Absent"}
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