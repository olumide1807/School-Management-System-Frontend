import { useState } from "react";
import {
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
} from "@mui/material";
import { ArrowForward, School, Warning } from "@mui/icons-material";
import SERVER from "../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClassArms, useClassLevels } from "../../../services/api-call";
import { toast } from "react-toastify";
import { toastOptions } from "../../../Utils/toastOptions";
import { useNavigate } from "react-router-dom";
import Loader from "../../loaders/Loader";
import MessageModal from "../../../Components/Modals/MessageModal";

export default function PromoteStudents() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fromClassArmId, setFromClassArmId] = useState("");
  const [toClassArmId, setToClassArmId] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const classArms = allArms?.data?.data?.data || [];
  const classLevels = allLevels?.data?.data?.data || [];

  // Fetch all students
  const { data: studentsData } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () => {
      const res = await SERVER.get("student");
      return res?.data;
    },
    retry: false,
  });
  const allStudents = studentsData?.data || [];

  const getArmLabel = (armId: string) => {
    const arm = classArms.find((a: any) => a._id === armId);
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  const getLevelName = (armId: string) => {
    const arm = classArms.find((a: any) => a._id === armId);
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return level?.levelName || "";
  };

  // Students in source class
  const studentsInFromClass = allStudents.filter(
    (s: any) => s.classArmId === fromClassArmId && s.status === "active",
  );

  // Available destination classes (exclude the source class)
  const destinationArms = classArms.filter(
    (a: any) => a._id !== fromClassArmId,
  );

  const handlePromote = async () => {
    setPromoting(true);
    try {
      const res = await SERVER.put("student/promote", {
        fromClassArmId,
        toClassArmId,
      });
      const data = res?.data?.data;
      setResult(data);
      toast.success(
        `${data?.promoted} student(s) promoted successfully!`,
        toastOptions,
      );
      queryClient.invalidateQueries({ queryKey: ["all-students"] });
      setOpenConfirm(false);
      setFromClassArmId("");
      setToClassArmId("");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Promotion failed",
        toastOptions,
      );
    } finally {
      setPromoting(false);
    }
  };

  const canPromote =
    fromClassArmId &&
    toClassArmId &&
    fromClassArmId !== toClassArmId &&
    studentsInFromClass.length > 0;

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black mb-1">Promote Students</h2>
        <p className="text-sm text-gray-500">
          Move all active students from one class to another. This is typically
          done at the end of an academic session.
        </p>
      </div>

      {/* Warning banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Warning sx={{ color: "#A16207", fontSize: 20, mt: 0.5 }} />
        <div>
          <p className="text-sm font-medium text-yellow-900">
            Before promoting students
          </p>
          <ul className="text-xs text-yellow-800 mt-1 list-disc list-inside space-y-1">
            <li>Make sure the current session results have been finalized</li>
            <li>This will move ALL active students from the source class</li>
            <li>Students with "deactivated" status will not be moved</li>
            <li>
              This action cannot be undone automatically — you'd need to
              transfer individually
            </li>
          </ul>
        </div>
      </div>

      {/* Class selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-black mb-4">Select Classes</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              FROM (Current Class)
            </p>
            <FormControl fullWidth size="small">
              <InputLabel>Source Class</InputLabel>
              <Select
                value={fromClassArmId}
                label="Source Class"
                onChange={(e) => {
                  setFromClassArmId(e.target.value);
                  setToClassArmId("");
                  setResult(null);
                }}
                sx={{ borderRadius: "10px" }}
              >
                {classArms.map((arm: any) => (
                  <MenuItem key={arm._id} value={arm._id}>
                    {getArmLabel(arm._id)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="flex items-center justify-center">
            <div className="bg-tertiary rounded-full p-2">
              <ArrowForward sx={{ color: "white", fontSize: 24 }} />
            </div>
          </div>

          <div className="flex-1 w-full">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              TO (Destination Class)
            </p>
            <FormControl fullWidth size="small">
              <InputLabel>Destination Class</InputLabel>
              <Select
                value={toClassArmId}
                label="Destination Class"
                onChange={(e) => {
                  setToClassArmId(e.target.value);
                  setResult(null);
                }}
                disabled={!fromClassArmId}
                sx={{ borderRadius: "10px" }}
              >
                {destinationArms.map((arm: any) => (
                  <MenuItem key={arm._id} value={arm._id}>
                    {getArmLabel(arm._id)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Arrow label */}
        {fromClassArmId && toClassArmId && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-tertiary">
                {getArmLabel(fromClassArmId)}
              </span>
              {" → "}
              <span className="font-semibold text-tertiary">
                {getArmLabel(toClassArmId)}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Preview: students to be promoted */}
      {fromClassArmId && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <School fontSize="small" />
              Students in {getArmLabel(fromClassArmId)}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                studentsInFromClass.length > 0
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {studentsInFromClass.length} active student
              {studentsInFromClass.length !== 1 ? "s" : ""}
            </span>
          </div>

          {studentsInFromClass.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No active students in this class
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {studentsInFromClass.map((student: any) => (
                <div
                  key={student._id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  <Avatar
                    sx={{ width: 32, height: 32, fontSize: 12 }}
                    src={student.photo || ""}
                  >
                    {student.firstName?.[0]}
                    {student.surName?.[0]}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-black">
                      {student.firstName} {student.surName}
                    </p>
                    <p className="text-xs text-gray-500">{student.studentID}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result banner */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-green-800">
            ✓ Promotion complete — {result.promoted} student(s) moved
            successfully
          </p>
          <p className="text-xs text-green-700 mt-1">
            All active students have been transferred to their new class.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outlined"
          onClick={() => navigate("/student-management")}
          sx={{ borderRadius: "10px", textTransform: "capitalize" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="tertiary"
          onClick={() => setOpenConfirm(true)}
          disabled={!canPromote}
          sx={{
            color: "white",
            borderRadius: "10px",
            paddingX: "30px",
            textTransform: "capitalize",
          }}
        >
          Promote{" "}
          {studentsInFromClass.length > 0
            ? `${studentsInFromClass.length} Student${studentsInFromClass.length !== 1 ? "s" : ""}`
            : "Students"}
        </Button>
      </div>

      {/* Confirmation modal */}
      <MessageModal
        column
        desc={`This will move all ${studentsInFromClass.length} active student(s) from ${getArmLabel(fromClassArmId)} to ${getArmLabel(toClassArmId)}. Are you sure?`}
        openModal={openConfirm}
        closeModal={() => setOpenConfirm(false)}
        handleClick={handlePromote}
        btn1Name={
          promoting
            ? "Promoting..."
            : `Yes, promote ${studentsInFromClass.length} student(s)`
        }
        btn2Name="Cancel"
      />
    </div>
  );
}
