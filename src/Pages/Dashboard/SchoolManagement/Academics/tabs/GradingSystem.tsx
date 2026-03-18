import { useState } from "react";
import Button from "@mui/material/Button";
import { Add } from "@mui/icons-material";
import Modal from "../../../../../Components/Modals";
import Grades from "../../../../../Components/Grades";
import SERVER from "../../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../../Utils/toastOptions";
import Loader from "../../../../loaders/Loader";
import { Input } from "../../../../../Components/Forms";

// Preset templates
const PRESETS = {
  primary: {
    name: "Primary Format (A-E)",
    grades: [
      { scoreRange: { from: 70, to: 100 }, grade: "A", remark: "Excellent", color: "#00A82F" },
      { scoreRange: { from: 60, to: 69 }, grade: "B", remark: "Good", color: "#61AFF8" },
      { scoreRange: { from: 50, to: 59 }, grade: "C", remark: "Average", color: "#797979" },
      { scoreRange: { from: 40, to: 49 }, grade: "D", remark: "Pass", color: "#FFA370" },
      { scoreRange: { from: 0, to: 39 }, grade: "E", remark: "Fail", color: "#C74040" },
    ]
  },
  waec: {
    name: "WAEC Format (A1-F9)",
    grades: [
      { scoreRange: { from: 75, to: 100 }, grade: "A1", remark: "Excellent", color: "#9934E9" },
      { scoreRange: { from: 70, to: 74 }, grade: "B2", remark: "Very Good", color: "#61AFF8" },
      { scoreRange: { from: 65, to: 69 }, grade: "B3", remark: "Good", color: "#61AFF8" },
      { scoreRange: { from: 60, to: 64 }, grade: "C4", remark: "Credit", color: "#797979" },
      { scoreRange: { from: 55, to: 59 }, grade: "C5", remark: "Credit", color: "#797979" },
      { scoreRange: { from: 50, to: 54 }, grade: "C6", remark: "Credit", color: "#797979" },
      { scoreRange: { from: 45, to: 49 }, grade: "D7", remark: "Upper Pass", color: "#DEC806" },
      { scoreRange: { from: 40, to: 44 }, grade: "E8", remark: "Lower Pass", color: "#FFA370" },
      { scoreRange: { from: 0, to: 39 }, grade: "F9", remark: "Fail", color: "#C74040" },
    ]
  }
};

const COLORS = ["#00A82F", "#61AFF8", "#9934E9", "#797979", "#DEC806", "#FFA370", "#C74040", "#FF6B6B", "#4ECDC4"];

export default function GradingSystem() {
  const [openCreate, setOpenCreate] = useState(false);
  const [createMode, setCreateMode] = useState<"preset" | "custom" | null>(null);
  const [saving, setSaving] = useState(false);

  // Custom form state
  const [customName, setCustomName] = useState("");
  const [customGrades, setCustomGrades] = useState([
    { scoreRange: { from: 0, to: 0 }, grade: "", remark: "", color: COLORS[0] }
  ]);

  const queryClient = useQueryClient();

  // Fetch all grade systems
  const { data: gradesData, isPending } = useQuery({
    queryKey: ['all-grades'],
    queryFn: async () => {
      const res = await SERVER.get('grade');
      return res?.data;
    },
    retry: false,
  });

  const gradeFormats = gradesData?.data || [];
  const activeFormat = gradeFormats.length > 0 ? gradeFormats[0] : null;

  // Delete existing and create new
  const replaceGradeFormat = async (name: string, grades: any[]) => {
    setSaving(true);
    try {
      // Delete existing format(s) first
      for (const format of gradeFormats) {
        await SERVER.delete(`grade/${format._id}`);
      }
      // Create new one
      await SERVER.post('grade', { name, grades });
      toast.success('Grading system updated!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-grades'] });
      setOpenCreate(false);
      setCreateMode(null);
      resetCustomForm();
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || 'Failed to update grading system';
      toast.error(errMsg, toastOptions);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePreset = (presetKey: "primary" | "waec") => {
    const preset = PRESETS[presetKey];
    replaceGradeFormat(preset.name, preset.grades);
  };

  const resetCustomForm = () => {
    setCustomName("");
    setCustomGrades([{ scoreRange: { from: 0, to: 0 }, grade: "", remark: "", color: COLORS[0] }]);
  };

  const handleAddCustomRow = () => {
    setCustomGrades([...customGrades, {
      scoreRange: { from: 0, to: 0 }, grade: "", remark: "", color: COLORS[customGrades.length % COLORS.length]
    }]);
  };

  const handleRemoveCustomRow = (index: number) => {
    setCustomGrades(customGrades.filter((_, i) => i !== index));
  };

  const handleCustomChange = (index: number, field: string, value: any) => {
    const updated = [...customGrades];
    if (field === "from" || field === "to") {
      updated[index].scoreRange[field] = Number(value);
    } else {
      (updated[index] as any)[field] = value;
    }
    setCustomGrades(updated);
  };

  const handleCreateCustom = () => {
    if (!customName.trim()) {
      toast.error('Please enter a name for the grade format', toastOptions);
      return;
    }
    if (customGrades.some(g => !g.grade || !g.remark)) {
      toast.error('Please fill in all grade and remark fields', toastOptions);
      return;
    }
    replaceGradeFormat(customName, customGrades);
  };

  if (isPending) return <Loader />;

  return (
    <>
      {!activeFormat ? (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="flex flex-col items-center gap-y-7">
            <p className="text-lg text-gray-500">No grading system set</p>
            <Button
              color="tertiary"
              variant="contained"
              onClick={() => setOpenCreate(true)}
              sx={{
                color: "#fff",
                borderRadius: "10px",
                textTransform: "capitalize",
                paddingY: "12px",
                width: "221px",
              }}
            >
              Create Grade Format
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-y-10">
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-black">{activeFormat.name}</h3>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
              <Button
                color="tertiary"
                variant="outlined"
                onClick={() => setOpenCreate(true)}
                sx={{ borderRadius: "8px", textTransform: "capitalize" }}
              >
                Change
              </Button>
            </div>
            <div className="flex flex-wrap gap-4">
              {activeFormat.grades?.map((g: any, i: number) => (
                <Grades
                  key={i}
                  color={g.color}
                  grade={g.grade}
                  remark={g.remark}
                  range={`${g.scoreRange?.from} - ${g.scoreRange?.to}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create/Change Grade Format Modal */}
      <Modal
        openModal={openCreate}
        closeModal={() => {
          setOpenCreate(false);
          setCreateMode(null);
          resetCustomForm();
        }}
        title={activeFormat ? "Change Grading System" : "Create Grade Format"}
        maxWidth="800px"
      >
        {!createMode ? (
          <div className="flex flex-col gap-y-6">
            {activeFormat && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <p className="text-yellow-800 text-sm">
                  This will replace your current grading system ({activeFormat.name}).
                </p>
              </div>
            )}
            <p className="text-gray-600">Choose how you want to set your grading format:</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setCreateMode("preset")}
                className="p-5 border border-gray-200 rounded-xl text-left hover:border-[#0E7094] hover:bg-[#f0f9fc] transition-colors"
              >
                <p className="font-semibold text-black text-lg">Use a Preset Template</p>
                <p className="text-sm text-gray-500 mt-1">Choose from Primary (A-E) or WAEC (A1-F9) formats</p>
              </button>
              <button
                onClick={() => setCreateMode("custom")}
                className="p-5 border border-gray-200 rounded-xl text-left hover:border-[#0E7094] hover:bg-[#f0f9fc] transition-colors"
              >
                <p className="font-semibold text-black text-lg">Create Custom Format</p>
                <p className="text-sm text-gray-500 mt-1">Define your own grades, ranges, and remarks</p>
              </button>
            </div>
          </div>
        ) : createMode === "preset" ? (
          <div className="flex flex-col gap-y-6">
            <button onClick={() => setCreateMode(null)} className="text-[#0E7094] text-sm self-start">
              ← Back
            </button>
            <p className="text-gray-600">Select a preset template:</p>
            <div className="flex flex-col gap-4">
              <div className="p-5 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-black text-lg">Primary Format (A - E)</p>
                  <Button
                    color="tertiary"
                    variant="contained"
                    onClick={() => handleCreatePreset("primary")}
                    disabled={saving}
                    sx={{ color: "white", borderRadius: "8px", textTransform: "capitalize" }}
                  >
                    {saving ? "Saving..." : "Use This"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {PRESETS.primary.grades.map((g, i) => (
                    <Grades key={i} color={g.color} grade={g.grade} remark={g.remark} range={`${g.scoreRange.from} - ${g.scoreRange.to}`} />
                  ))}
                </div>
              </div>
              <div className="p-5 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-black text-lg">WAEC Format (A1 - F9)</p>
                  <Button
                    color="tertiary"
                    variant="contained"
                    onClick={() => handleCreatePreset("waec")}
                    disabled={saving}
                    sx={{ color: "white", borderRadius: "8px", textTransform: "capitalize" }}
                  >
                    {saving ? "Saving..." : "Use This"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {PRESETS.waec.grades.map((g, i) => (
                    <Grades key={i} color={g.color} grade={g.grade} remark={g.remark} range={`${g.scoreRange.from} - ${g.scoreRange.to}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-6">
            <button onClick={() => setCreateMode(null)} className="text-[#0E7094] text-sm self-start">
              ← Back
            </button>
            <Input
              name="formatName"
              label="Format Name"
              placeholder="e.g. My School Grading"
              value={customName}
              onChange={(e: any) => setCustomName(e.target.value)}
              otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
            />
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-black">Grade Entries</p>
              {customGrades.map((g, i) => (
                <div key={i} className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    placeholder="From"
                    value={g.scoreRange.from || ''}
                    onChange={(e) => handleCustomChange(i, "from", e.target.value)}
                    className="w-16 border border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="To"
                    value={g.scoreRange.to || ''}
                    onChange={(e) => handleCustomChange(i, "to", e.target.value)}
                    className="w-16 border border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Grade"
                    value={g.grade}
                    onChange={(e) => handleCustomChange(i, "grade", e.target.value)}
                    className="w-20 border border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Remark"
                    value={g.remark}
                    onChange={(e) => handleCustomChange(i, "remark", e.target.value)}
                    className="w-28 border border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <input
                    type="color"
                    value={g.color}
                    onChange={(e) => handleCustomChange(i, "color", e.target.value)}
                    className="w-10 h-10 border-none cursor-pointer rounded"
                  />
                  {customGrades.length > 1 && (
                    <button onClick={() => handleRemoveCustomRow(i)} className="text-red-500 text-sm">✕</button>
                  )}
                </div>
              ))}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={handleAddCustomRow}
                sx={{ width: "fit-content", borderRadius: "8px", textTransform: "capitalize", mt: 1 }}
              >
                Add Row
              </Button>
            </div>
            <Button
              color="tertiary"
              variant="contained"
              onClick={handleCreateCustom}
              disabled={saving}
              sx={{ color: "white", borderRadius: "10px", paddingY: "12px", width: "fit-content" }}
            >
              {saving ? "Saving..." : activeFormat ? "Change Grading System" : "Create Grade Format"}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}