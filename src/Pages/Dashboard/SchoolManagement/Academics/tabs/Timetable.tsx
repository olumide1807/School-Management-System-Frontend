import { useState } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useClassArms, useClassLevels } from "../../../../../services/api-call";
import SERVER from "../../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../../Utils/toastOptions";
import Loader from "../../../../loaders/Loader";
import Modal from "../../../../../Components/Modals";
import { useNavigate } from "react-router-dom";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Timetable = () => {
  const [selectedArmId, setSelectedArmId] = useState("");
  const [editingCell, setEditingCell] = useState<{ day: string; period: number } | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [grid, setGrid] = useState<Record<string, Record<string, any>>>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const classArms = allArms?.data?.data?.data || [];
  const classLevels = allLevels?.data?.data?.data || [];

  // Fetch period settings
  const { data: settingsData, isPending: settingsLoading } = useQuery({
    queryKey: ["period-settings"],
    queryFn: async () => {
      const res = await SERVER.get("timetable-grid/settings");
      return res?.data;
    },
    retry: false,
  });

  const settings = settingsData?.data;

  // Fetch timetable for selected class arm
  const { data: timetableData, isPending: timetableLoading } = useQuery({
    queryKey: ["timetable-grid", selectedArmId],
    queryFn: async () => {
      const res = await SERVER.get(`timetable-grid/grid/${selectedArmId}`);
      return res?.data;
    },
    enabled: !!selectedArmId,
    retry: false,
  });

  // Fetch subjects for selected class arm
  const { data: subjectsData } = useQuery({
    queryKey: ["arm-subjects-for-timetable", selectedArmId],
    queryFn: async () => {
      const res = await SERVER.get(`subject/all/${selectedArmId}`);
      return res?.data;
    },
    enabled: !!selectedArmId,
    retry: false,
  });

  // Fetch all subjects to get names
  const { data: allSubjectsData } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const res = await SERVER.get("subject");
      return res?.data;
    },
  });

  const armSubjects = subjectsData?.data || [];
  const allSubjects = allSubjectsData?.data || [];

  const getSubjectName = (subjectId: string) => {
    const s = allSubjects.find((sub: any) => sub._id === subjectId);
    return s?.subjectName || "Unknown";
  };

  // Generate periods from settings
  const generatePeriods = () => {
    if (!settings) return [];
    const periods: { label: string; start: string; end: string; isBreak: boolean; index: number }[] = [];
    const [startH, startM] = settings.startTime.split(":").map(Number);
    const [endH, endM] = settings.endTime.split(":").map(Number);
    const schoolStartMin = startH * 60 + startM;
    const schoolEndMin = endH * 60 + endM;
    const dur = settings.periodDuration;

    const sortedBreaks = [...(settings.breaks || [])].sort((a: any, b: any) => {
      const aMin = parseInt(a.startTime.split(":")[0]) * 60 + parseInt(a.startTime.split(":")[1]);
      const bMin = parseInt(b.startTime.split(":")[0]) * 60 + parseInt(b.startTime.split(":")[1]);
      return aMin - bMin;
    });

    let currentMin = schoolStartMin;
    let periodNum = 1;
    let idx = 0;

    while (currentMin < schoolEndMin) {
      const nextBreak = sortedBreaks.find((b: any) => {
        const bStart = parseInt(b.startTime.split(":")[0]) * 60 + parseInt(b.startTime.split(":")[1]);
        return bStart >= currentMin && bStart < currentMin + dur;
      });

      if (nextBreak) {
        const bStart = parseInt(nextBreak.startTime.split(":")[0]) * 60 + parseInt(nextBreak.startTime.split(":")[1]);
        const bEnd = parseInt(nextBreak.endTime.split(":")[0]) * 60 + parseInt(nextBreak.endTime.split(":")[1]);

        if (bStart > currentMin) {
          periods.push({ label: `Period ${periodNum}`, start: fmt(currentMin), end: fmt(bStart), isBreak: false, index: idx++ });
          periodNum++;
        }
        periods.push({ label: nextBreak.name, start: nextBreak.startTime, end: nextBreak.endTime, isBreak: true, index: idx++ });
        currentMin = bEnd;
      } else {
        const periodEnd = Math.min(currentMin + dur, schoolEndMin);
        periods.push({ label: `Period ${periodNum}`, start: fmt(currentMin), end: fmt(periodEnd), isBreak: false, index: idx++ });
        periodNum++;
        currentMin = periodEnd;
      }
    }
    return periods;
  };

  const fmt = (totalMin: number) => {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const fmtDisplay = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${String(m).padStart(2, "0")}${ampm}`;
  };

  const periods = generatePeriods();

  // Load grid when timetable data changes
  const loadedGrid = timetableData?.data?.grid || {};

  // Use loaded grid if no local changes
  const currentGrid = hasChanges ? grid : loadedGrid;

  const handleArmChange = (armId: string) => {
    setSelectedArmId(armId);
    setHasChanges(false);
    setGrid({});
  };

  const handleCellClick = (day: string, periodIndex: number) => {
    setEditingCell({ day, period: periodIndex });
    const current = currentGrid[day.toLowerCase()]?.[String(periodIndex)];
    setSelectedSubjectId(current?.subjectId || "");
  };

  const handleAssignSubject = () => {
    if (!editingCell) return;
    const day = editingCell.day.toLowerCase();
    const periodKey = String(editingCell.period);

    const newGrid = { ...currentGrid };
    if (!newGrid[day]) newGrid[day] = {};

    if (selectedSubjectId) {
      newGrid[day][periodKey] = {
        subjectId: selectedSubjectId,
        subjectName: getSubjectName(selectedSubjectId),
      };
    } else {
      delete newGrid[day][periodKey];
    }

    setGrid(newGrid);
    setHasChanges(true);
    setEditingCell(null);
    setSelectedSubjectId("");
  };

  const handleClearCell = () => {
    if (!editingCell) return;
    const day = editingCell.day.toLowerCase();
    const periodKey = String(editingCell.period);

    const newGrid = { ...currentGrid };
    if (newGrid[day]) {
      delete newGrid[day][periodKey];
    }

    setGrid(newGrid);
    setHasChanges(true);
    setEditingCell(null);
    setSelectedSubjectId("");
  };

  const handleSave = async () => {
    if (!selectedArmId) return;
    setSaving(true);
    try {
      await SERVER.put(`timetable-grid/grid/${selectedArmId}`, { grid: currentGrid });
      toast.success("Timetable saved!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["timetable-grid", selectedArmId] });
      setHasChanges(false);
    } catch (error: any) {
      toast.error("Failed to save timetable", toastOptions);
    } finally {
      setSaving(false);
    }
  };

  // Get arm label
  const getArmLabel = (arm: any) => {
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  if (settingsLoading) return <Loader />;

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-y-5 text-center">
          <p className="text-lg text-gray-500">Timetable settings not configured yet.</p>
          <p className="text-sm text-gray-400">Set up your school schedule (start time, end time, period duration) in Settings first.</p>
          <Button
            color="tertiary"
            variant="contained"
            onClick={() => navigate("/settings")}
            sx={{ color: "white", borderRadius: "10px", paddingY: "12px" }}
          >
            Go to Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Class Selector */}
      <div className="flex items-center justify-between">
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="select-class-label">Select Class</InputLabel>
          <Select
            labelId="select-class-label"
            value={selectedArmId}
            label="Select Class"
            onChange={(e) => handleArmChange(e.target.value)}
            sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}
          >
            {classArms.map((arm: any) => (
              <MenuItem key={arm._id} value={arm._id}>
                {getArmLabel(arm)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasChanges && (
          <Button
            color="tertiary"
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ color: "white", borderRadius: "10px", paddingY: "10px", paddingX: "25px" }}
          >
            {saving ? "Saving..." : "Save Timetable"}
          </Button>
        )}
      </div>

      {/* Timetable Grid */}
      {!selectedArmId ? (
        <div className="flex items-center justify-center h-[40vh]">
          <p className="text-gray-400 text-lg">Select a class to view/build its timetable</p>
        </div>
      ) : timetableLoading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-3 text-left w-32">Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="border border-gray-200 p-3 text-center font-semibold">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.index} className={period.isBreak ? "bg-yellow-50" : ""}>
                  <td className="border border-gray-200 p-2">
                    <p className="font-semibold text-xs">{period.label}</p>
                    <p className="text-xs text-gray-500">{fmtDisplay(period.start)} - {fmtDisplay(period.end)}</p>
                  </td>
                  {DAYS.map((day) => {
                    if (period.isBreak) {
                      return (
                        <td key={day} className="border border-gray-200 p-2 text-center text-yellow-700 text-xs font-medium bg-yellow-50">
                          {period.label}
                        </td>
                      );
                    }
                    const cellData = currentGrid[day.toLowerCase()]?.[String(period.index)];
                    return (
                      <td
                        key={day}
                        className="border border-gray-200 p-2 text-center cursor-pointer hover:bg-blue-50 transition-colors min-w-[120px]"
                        onClick={() => handleCellClick(day, period.index)}
                      >
                        {cellData ? (
                          <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            {cellData.subjectName}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">+</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Subject Modal */}
      <Modal
        openModal={!!editingCell}
        closeModal={() => { setEditingCell(null); setSelectedSubjectId(""); }}
        title={editingCell ? `${editingCell.day} — ${periods.find(p => p.index === editingCell.period)?.label || ''}` : ""}
      >
        <div className="flex flex-col gap-y-6">
          {armSubjects.length === 0 ? (
            <p className="text-gray-500 text-sm">No subjects assigned to this class. Add subjects from the Subjects tab first.</p>
          ) : (
            <>
              <FormControl fullWidth>
                <InputLabel id="select-subject-label">Select Subject</InputLabel>
                <Select
                  labelId="select-subject-label"
                  value={selectedSubjectId}
                  label="Select Subject"
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}
                >
                  {armSubjects.map((sp: any) => (
                    <MenuItem key={sp._id} value={sp.subjectId}>
                      {getSubjectName(sp.subjectId)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className="flex gap-3">
                <Button
                  color="tertiary"
                  variant="contained"
                  onClick={handleAssignSubject}
                  disabled={!selectedSubjectId}
                  sx={{ color: "white", borderRadius: "10px", paddingY: "10px" }}
                >
                  Assign
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearCell}
                  sx={{ borderRadius: "10px", paddingY: "10px" }}
                >
                  Clear
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Timetable;