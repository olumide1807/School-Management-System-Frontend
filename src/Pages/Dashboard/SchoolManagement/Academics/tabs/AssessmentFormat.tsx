import { useState } from "react";
import Button from "@mui/material/Button";
import { Add, Edit, EventAvailable } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import Modal from "../../../../../Components/Modals";
import SERVER from "../../../../../Utils/server";
import { toastOptions } from "../../../../../Utils/toastOptions";
import { useClassLevels } from "../../../../../services/api-call";
import Loader from "../../../../loaders/Loader";

type Source = "manual" | "attendance";
type Row = { name: string; maxScore: number; order: number; source: Source };

// Common Nigerian structures. Each must total 100.
const PRESETS: Record<string, { label: string; hint: string; assessments: Row[] }> = {
  standard: {
    label: "Two CAs + Exam",
    hint: "The most common structure",
    assessments: [
      { name: "CA 1", maxScore: 20, order: 1, source: "manual" },
      { name: "CA 2", maxScore: 20, order: 2, source: "manual" },
      { name: "Exam", maxScore: 60, order: 3, source: "manual" },
    ],
  },
  threeCA: {
    label: "Three CAs + Exam",
    hint: "More continuous assessment, common in primary",
    assessments: [
      { name: "CA 1", maxScore: 10, order: 1, source: "manual" },
      { name: "CA 2", maxScore: 10, order: 2, source: "manual" },
      { name: "CA 3", maxScore: 20, order: 3, source: "manual" },
      { name: "Exam", maxScore: 60, order: 4, source: "manual" },
    ],
  },
  withAttendance: {
    label: "Attendance + two CAs + Exam",
    hint: "Attendance marks computed automatically from the register",
    assessments: [
      { name: "Attendance", maxScore: 5, order: 1, source: "attendance" },
      { name: "CA 1", maxScore: 15, order: 2, source: "manual" },
      { name: "CA 2", maxScore: 20, order: 3, source: "manual" },
      { name: "Exam", maxScore: 60, order: 4, source: "manual" },
    ],
  },
};

const blankRow = (): Row => ({ name: "", maxScore: 0, order: 1, source: "manual" });

export default function AssessmentFormat() {
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [activeLevel, setActiveLevel] = useState<any>(null);
  const [mode, setMode] = useState<"choose" | "custom">("choose");
  const [rows, setRows] = useState<Row[]>([blankRow()]);
  const [saving, setSaving] = useState(false);

  const levelsData = useClassLevels();
  const classLevels = levelsData?.data?.data?.data || [];

  const { data: formatsData, isPending } = useQuery({
    queryKey: ["assessment-formats"],
    queryFn: async () => {
      const res = await SERVER.get("assessment");
      return res?.data;
    },
    retry: false,
  });
  const formats = formatsData?.data || [];

  const formatFor = (levelId: string) =>
    formats.find((f: any) => String(f.classLevel?._id || f.classLevel) === String(levelId));

  const total = rows.reduce((sum, r) => sum + (Number(r.maxScore) || 0), 0);
  const totalIsValid = total === 100;
  const hasAttendance = rows.some((r) => r.source === "attendance");

  const openFor = (level: any) => {
    const existing = formatFor(level._id);
    setActiveLevel(level);
    if (existing) {
      // Fresh objects — never mutate the cached query data
      setRows(
        existing.assessments
          .map((a: any) => ({
            name: a.name,
            maxScore: a.maxScore,
            order: a.order,
            source: (a.source || "manual") as Source,
          }))
          .sort((a: Row, b: Row) => (a.order || 0) - (b.order || 0))
      );
      setMode("custom");
    } else {
      setRows([blankRow()]);
      setMode("choose");
    }
    setOpenModal(true);
  };

  const closeAll = () => {
    setOpenModal(false);
    setActiveLevel(null);
    setMode("choose");
    setRows([blankRow()]);
  };

  const save = async (assessments: Row[]) => {
    if (!activeLevel) return;

    const sum = assessments.reduce((s, a) => s + Number(a.maxScore), 0);
    if (sum !== 100) {
      toast.error(`Assessments must add up to 100. Yours total ${sum}.`, toastOptions);
      return;
    }
    if (assessments.some((a) => !a.name.trim())) {
      toast.error("Every assessment needs a name", toastOptions);
      return;
    }

    setSaving(true);
    try {
      const existing = formatFor(activeLevel._id);
      const payload = assessments.map((a, i) => ({
        name: a.name.trim(),
        maxScore: Number(a.maxScore),
        order: i + 1,
        source: a.source || "manual",
      }));

      if (existing) {
        await SERVER.put(`assessment/${activeLevel._id}`, { assessments: payload });
      } else {
        await SERVER.post("assessment", {
          classLevel: activeLevel._id,
          assessments: payload,
        });
      }

      toast.success(`Assessment format saved for ${activeLevel.levelName}`, toastOptions);
      await queryClient.invalidateQueries({ queryKey: ["assessment-formats"] });
      closeAll();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Could not save assessment format",
        toastOptions
      );
    } finally {
      setSaving(false);
    }
  };

  const updateRow = (i: number, field: "name" | "maxScore", value: string) => {
    setRows((prev) =>
      prev.map((r, idx) =>
        idx !== i
          ? r
          : field === "maxScore"
          ? { ...r, maxScore: Number(value) }
          : { ...r, name: value }
      )
    );
  };

  const addRow = () => setRows((prev) => [...prev, { ...blankRow(), order: prev.length + 1 }]);

  // Attendance goes first, conventionally
  const addAttendanceRow = () =>
    setRows((prev) => [
      { name: "Attendance", maxScore: 0, order: 0, source: "attendance" },
      ...prev,
    ]);

  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  if (isPending) return <Loader />;

  return (
    <>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-black">Assessment Format</h2>
          <p className="text-sm text-gray-500 mt-1">
            How marks are split for each class level. Teachers enter scores against
            these when grading, so they must add up to 100.
          </p>
        </div>

        {classLevels.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-xl">
            <p className="text-gray-500">
              Create class levels first — assessment formats are set per level.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {classLevels.map((level: any) => {
              const format = formatFor(level._id);
              return (
                <div key={level._id} className="border border-gray-200 rounded-xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-semibold text-black">{level.levelName}</h3>
                      {!format && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Not set up — teachers can't enter scores for this level yet
                        </p>
                      )}
                    </div>
                    <Button
                      color="tertiary"
                      variant={format ? "outlined" : "contained"}
                      startIcon={format ? <Edit /> : <Add />}
                      onClick={() => openFor(level)}
                      sx={{
                        borderRadius: "8px",
                        textTransform: "capitalize",
                        ...(format ? {} : { color: "white" }),
                      }}
                    >
                      {format ? "Edit" : "Set up"}
                    </Button>
                  </div>

                  {format && (
                    <div className="flex flex-wrap gap-2">
                      {[...format.assessments]
                        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                        .map((a: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2"
                          >
                            {a.source === "attendance" && (
                              <EventAvailable sx={{ fontSize: 15 }} className="text-tertiary" />
                            )}
                            <span className="text-sm text-black">{a.name}</span>
                            <span className="text-xs text-tertiary tabular-nums">
                              {a.maxScore}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        openModal={openModal}
        closeModal={closeAll}
        title={`Assessment Format — ${activeLevel?.levelName || ""}`}
        maxWidth="700px"
      >
        {mode === "choose" ? (
          <div className="flex flex-col gap-y-5">
            <p className="text-gray-600 text-sm">
              Start from a common structure, or build your own.
            </p>

            <div className="flex flex-col gap-3">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => save(preset.assessments)}
                  disabled={saving}
                  className="p-4 border border-gray-200 rounded-xl text-left hover:border-tertiary hover:bg-[#f0f9fc] transition-colors disabled:opacity-50"
                >
                  <p className="font-semibold text-black">{preset.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 mb-3">{preset.hint}</p>
                  <div className="flex flex-wrap gap-2">
                    {preset.assessments.map((a, i) => (
                      <span
                        key={i}
                        className="text-xs border border-gray-200 rounded-md px-2 py-1"
                      >
                        {a.name} · {a.maxScore}
                      </span>
                    ))}
                  </div>
                </button>
              ))}

              <button
                onClick={() => setMode("custom")}
                className="p-4 border border-gray-200 rounded-xl text-left hover:border-tertiary hover:bg-[#f0f9fc] transition-colors"
              >
                <p className="font-semibold text-black">Build your own</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Name each assessment and set its marks
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-5">
            {!formatFor(activeLevel?._id) && (
              <button
                onClick={() => setMode("choose")}
                className="text-tertiary text-sm self-start"
              >
                ← Back to presets
              </button>
            )}

            <div className="flex flex-col gap-3">
              {rows.map((row, i) => {
                const isAttendance = row.source === "attendance";
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Assessment name"
                          value={row.name}
                          onChange={(e) => updateRow(i, "name", e.target.value)}
                          className={`w-full border rounded-lg p-2.5 text-sm ${
                            isAttendance
                              ? "border-tertiary bg-[#f0f9fc] pl-9"
                              : "border-gray-300"
                          }`}
                        />
                        {isAttendance && (
                          <EventAvailable
                            sx={{ fontSize: 17 }}
                            className="text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2"
                          />
                        )}
                      </div>
                      <input
                        type="number"
                        placeholder="Marks"
                        value={row.maxScore || ""}
                        onChange={(e) => updateRow(i, "maxScore", e.target.value)}
                        className="w-24 border border-gray-300 rounded-lg p-2.5 text-sm tabular-nums"
                      />
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(i)}
                          className="text-red-500 text-sm w-6 shrink-0"
                          aria-label={`Remove ${row.name || "assessment"}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {isAttendance && (
                      <p className="text-xs text-tertiary pl-1">
                        Computed from the register — days present ÷ days recorded × marks.
                        Teachers don't enter it.
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-2 mt-1">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={addRow}
                  sx={{ borderRadius: "8px", textTransform: "capitalize" }}
                >
                  Add assessment
                </Button>
                {!hasAttendance && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EventAvailable />}
                    onClick={addAttendanceRow}
                    sx={{ borderRadius: "8px", textTransform: "capitalize" }}
                  >
                    Include attendance
                  </Button>
                )}
              </div>
            </div>

            <div
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                totalIsValid
                  ? "bg-green-50 border border-green-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <span className={`text-sm ${totalIsValid ? "text-green-800" : "text-yellow-800"}`}>
                {totalIsValid
                  ? "Adds up to 100"
                  : total > 100
                  ? `${total - 100} marks over`
                  : `${100 - total} marks short`}
              </span>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  totalIsValid ? "text-green-800" : "text-yellow-800"
                }`}
              >
                {total} / 100
              </span>
            </div>

            <Button
              color="tertiary"
              variant="contained"
              onClick={() => save(rows)}
              disabled={saving || !totalIsValid}
              sx={{
                color: "white",
                borderRadius: "10px",
                paddingY: "12px",
                width: "fit-content",
                textTransform: "capitalize",
              }}
            >
              {saving ? "Saving..." : "Save format"}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}