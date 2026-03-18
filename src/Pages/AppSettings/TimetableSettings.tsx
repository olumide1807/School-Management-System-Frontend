import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import SERVER from "../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../Utils/toastOptions";

interface Break {
  name: string;
  startTime: string;
  endTime: string;
}

const TimetableSettings = () => {
  const queryClient = useQueryClient();
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("14:00");
  const [periodDuration, setPeriodDuration] = useState(40);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch existing settings
  const { data: settingsData, isPending } = useQuery({
    queryKey: ["period-settings"],
    queryFn: async () => {
      const res = await SERVER.get("timetable-grid/settings");
      return res?.data;
    },
    retry: false,
  });

  // Populate form when data loads
  useEffect(() => {
    const settings = settingsData?.data;
    if (settings) {
      setStartTime(settings.startTime || "08:00");
      setEndTime(settings.endTime || "14:00");
      setPeriodDuration(settings.periodDuration || 40);
      setBreaks(settings.breaks || []);
    }
  }, [settingsData]);

  const handleAddBreak = () => {
    setBreaks([...breaks, { name: "Break", startTime: "10:00", endTime: "10:30" }]);
  };

  const handleRemoveBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const handleBreakChange = (index: number, field: string, value: string) => {
    const updated = [...breaks];
    (updated[index] as any)[field] = value;
    setBreaks(updated);
  };

  // Generate preview of periods
  const generatePeriods = () => {
    const periods: { label: string; start: string; end: string; isBreak: boolean }[] = [];
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const schoolStartMin = startH * 60 + startM;
    const schoolEndMin = endH * 60 + endM;

    // Safety: don't generate if invalid settings
    if (schoolEndMin <= schoolStartMin || periodDuration <= 0) return periods;

    // Validate and filter breaks
    const validBreaks = breaks
      .map((b) => {
        const bStart = parseInt(b.startTime.split(":")[0]) * 60 + parseInt(b.startTime.split(":")[1]);
        const bEnd = parseInt(b.endTime.split(":")[0]) * 60 + parseInt(b.endTime.split(":")[1]);
        return { ...b, bStart, bEnd };
      })
      .filter((b) => b.bEnd > b.bStart && b.bStart >= schoolStartMin && b.bEnd <= schoolEndMin)
      .sort((a, b) => a.bStart - b.bStart);

    let currentMin = schoolStartMin;
    let periodNum = 1;
    let maxIterations = 50; // Safety limit

    while (currentMin < schoolEndMin && maxIterations-- > 0) {
      // Check if a break starts before the next period would end
      const nextBreak = validBreaks.find(
        (b) => b.bStart >= currentMin && b.bStart < currentMin + periodDuration
      );

      if (nextBreak) {
        // Add period before break if there's time
        if (nextBreak.bStart > currentMin) {
          periods.push({
            label: `Period ${periodNum}`,
            start: formatMinutes(currentMin),
            end: formatMinutes(nextBreak.bStart),
            isBreak: false,
          });
          periodNum++;
        }

        // Add break
        periods.push({
          label: nextBreak.name,
          start: nextBreak.startTime,
          end: nextBreak.endTime,
          isBreak: true,
        });
        currentMin = nextBreak.bEnd;
      } else {
        const periodEnd = Math.min(currentMin + periodDuration, schoolEndMin);
        if (periodEnd <= currentMin) break; // Safety
        periods.push({
          label: `Period ${periodNum}`,
          start: formatMinutes(currentMin),
          end: formatMinutes(periodEnd),
          isBreak: false,
        });
        periodNum++;
        currentMin = periodEnd;
      }
    }

    return periods;
  };

  const formatMinutes = (totalMin: number) => {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await SERVER.put("timetable-grid/settings", {
        startTime,
        endTime,
        periodDuration,
        breaks,
      });
      toast.success("Timetable settings saved!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["period-settings"] });
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || "Failed to save settings";
      toast.error(errMsg, toastOptions);
    } finally {
      setSaving(false);
    }
  };

  const periods = generatePeriods();

  return (
    <section className="my-8 border border-gray-200 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-black mb-6">Timetable Settings</h2>

      <div className="flex flex-col gap-6">
        {/* Time Settings */}
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">School Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border border-gray-300 rounded-lg p-2.5 w-40"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">School End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border border-gray-300 rounded-lg p-2.5 w-40"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Period Duration (mins)</label>
            <select
              value={periodDuration}
              onChange={(e) => setPeriodDuration(Number(e.target.value))}
              className="border border-gray-300 rounded-lg p-2.5 w-40"
            >
              {[30, 35, 40, 45, 50, 60, 90].map((d) => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>
        </div>

        {/* Breaks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-black">Breaks</p>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={handleAddBreak}
              sx={{ borderRadius: "8px", textTransform: "capitalize" }}
            >
              Add Break
            </Button>
          </div>
          {breaks.length === 0 ? (
            <p className="text-sm text-gray-400">No breaks configured</p>
          ) : (
            <div className="flex flex-col gap-3">
              {breaks.map((b, i) => (
                <div key={i} className="flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    value={b.name}
                    onChange={(e) => handleBreakChange(i, "name", e.target.value)}
                    placeholder="Break name"
                    className="border border-gray-300 rounded-lg p-2 text-sm w-36"
                  />
                  <input
                    type="time"
                    value={b.startTime}
                    onChange={(e) => handleBreakChange(i, "startTime", e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 text-sm w-32"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="time"
                    value={b.endTime}
                    onChange={(e) => handleBreakChange(i, "endTime", e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 text-sm w-32"
                  />
                  <button onClick={() => handleRemoveBreak(i)} className="text-red-500">
                    <Delete fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div>
          <p className="font-semibold text-black mb-3">Preview ({periods.filter(p => !p.isBreak).length} periods)</p>
          <div className="flex flex-wrap gap-2">
            {periods.map((p, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-xs ${
                  p.isBreak
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
                }`}
              >
                <p className="font-semibold">{p.label}</p>
                <p>{formatTimeDisplay(p.start)} - {formatTimeDisplay(p.end)}</p>
              </div>
            ))}
          </div>
        </div>

        <Button
          color="tertiary"
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{
            color: "white",
            borderRadius: "10px",
            paddingY: "12px",
            width: "fit-content",
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </section>
  );
};

export default TimetableSettings;