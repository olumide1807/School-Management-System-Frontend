import { useState, useEffect, useMemo } from "react";
import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import SERVER from "../../Utils/server";
import { toastOptions } from "../../Utils/toastOptions";
import { useClassLevels, useSessionTerm } from "../../services/api-call";
import useMyClasses from "../../hooks/useMyClasses";
import useMySubjects from "../../hooks/useMySubjects";
import Loader from "../loaders/Loader";

type Marks = Record<string, Record<string, string>>; // studentId -> assessmentName -> raw input

export default function Grading() {
  const queryClient = useQueryClient();

    const { allSpecifics, isPending: subjectsPending } = useMySubjects();
  const { myClasses, allArms, userId } = useMyClasses();

  const { data: staffData } = useQuery({
    queryKey: ["all-staff"],
    queryFn: async () => {
      const res = await SERVER.get("staff");
      return res?.data;
    },
    retry: false,
  });
  const allStaff = staffData?.data || [];

  const levelsData = useClassLevels();
  const classLevels = levelsData?.data?.data?.data || [];

  const session = useSessionTerm();
  const activeSession = session?.data?.data?.data?.session;
  const activeTerm = session?.data?.data?.data?.term;

  const [contextKey, setContextKey] = useState("");
  const [termId, setTermId] = useState("");
  const [marks, setMarks] = useState<Marks>({});
  const [saved, setSaved] = useState<Marks>({});
  const [saving, setSaving] = useState(false);

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

  const armLabel = (armId: string) => {
    const arm = allArms.find((a: any) => a._id === armId);
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  // ---------- What this teacher can grade ----------
    const contexts = useMemo(() => {
    const myArmIds = myClasses.map((c: any) => String(c._id));

    return allSpecifics
      .filter(
        (sp: any) =>
          String(sp.subjectTeacherId) === String(userId) ||
          myArmIds.includes(String(sp.classArmId))
      )
      .map((sp: any) => {
        const canEdit = String(sp.subjectTeacherId) === String(userId);
        const teacher = allStaff.find((s: any) => s._id === sp.subjectTeacherId);
        const teacherName = teacher
          ? `${teacher.firstName || ""} ${teacher.surname || ""}`.trim()
          : "Not assigned";
        const subjectName =
          allSubjects.find((s: any) => s._id === sp.subjectId)?.subjectName || "Subject";

        return {
          key: `${sp.classArmId}:${sp.subjectId}`,
          classArmId: sp.classArmId,
          subjectId: sp.subjectId,
          canEdit,
          teacherName,
          label: `${subjectName} · ${armLabel(sp.classArmId)}${canEdit ? "" : ` — ${teacherName}`}`,
        };
      });
  }, [allSpecifics, myClasses, userId, allStaff, allSubjects, allArms, classLevels]);

  useEffect(() => {
    if (!contextKey && contexts.length > 0) setContextKey(contexts[0].key);
  }, [contexts, contextKey]);

  useEffect(() => {
    if (!termId && activeTerm?._id) setTermId(activeTerm._id);
  }, [activeTerm, termId]);

    const context = contexts.find((c: any) => c.key === contextKey);
  const arm = allArms.find((a: any) => a._id === context?.classArmId);
  const isFormTeacher = myClasses.some((c: any) => c._id === context?.classArmId);
  const readOnly = !!context && !context.canEdit;

  // ---------- Terms in this session ----------
  const { data: termsData } = useQuery({
    queryKey: ["session-terms", activeSession?._id],
    queryFn: async () => {
      const res = await SERVER.get(`session/term/${activeSession._id}`);
      return res?.data?.data || [];
    },
    enabled: !!activeSession?._id,
    retry: false,
  });
  const terms = termsData || [];

  // ---------- Assessment format for this class level ----------
  const { data: formatData, isPending: formatPending } = useQuery({
    queryKey: ["assessment-format", arm?.classLevelId],
    queryFn: async () => {
      const res = await SERVER.get(`assessment/${arm.classLevelId}`);
      return res?.data;
    },
    enabled: !!arm?.classLevelId,
    retry: false,
  });
  const format = formatData?.data;
  const definitions = useMemo(
    () =>
      format?.assessments
        ? [...format.assessments].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        : [],
    [format]
  );

  // ---------- Students ----------
  const { data: studentsData, isPending: studentsPending } = useQuery({
    queryKey: ["class-students", context?.classArmId],
    queryFn: async () => {
      const res = await SERVER.get(`student/class/${context.classArmId}`);
      return res?.data;
    },
    enabled: !!context?.classArmId,
    retry: false,
  });
  const students = studentsData?.data || [];

  // ---------- Grade bands ----------
  const { data: gradesData } = useQuery({
    queryKey: ["all-grades"],
    queryFn: async () => {
      const res = await SERVER.get("grade");
      return res?.data;
    },
    retry: false,
  });
  const gradeBands = gradesData?.data?.[0]?.grades || [];

  const gradeFor = (total: number) =>
    gradeBands.find(
      (g: any) => total >= (g.scoreRange?.from ?? 0) && total <= (g.scoreRange?.to ?? 100)
    );

  // ---------- Existing scores ----------
  const { data: existingData } = useQuery({
    queryKey: ["class-subject-results", context?.classArmId, context?.subjectId, termId],
    queryFn: async () => {
      const res = await SERVER.get(
        `result/class/${context.classArmId}/subject/${context.subjectId}?termId=${termId}&sessionId=${activeSession._id}`
      );
      return res?.data;
    },
    enabled: !!context?.classArmId && !!context?.subjectId && !!termId && !!activeSession?._id,
    retry: false,
  });

  // Seed the sheet from what's stored
  useEffect(() => {
    const rows = existingData?.data || [];
    const seeded: Marks = {};
    students.forEach((s: any) => {
      const row = rows.find((r: any) => String(r.studentId) === String(s._id));
      const entry: Record<string, string> = {};
      definitions.forEach((d: any) => {
        const found = row?.scores?.find((sc: any) => sc.name === d.name);
        entry[d.name] = found ? String(found.score) : "";
      });
      seeded[s._id] = entry;
    });
    setMarks(seeded);
    setSaved(JSON.parse(JSON.stringify(seeded)));
  }, [existingData, studentsData, format, termId]);

  // ---------- Derived ----------
  const cellError = (name: string, raw: string) => {
    if (raw === "") return null;
    const def = definitions.find((d: any) => d.name === name);
    const value = Number(raw);
    if (Number.isNaN(value)) return "must be a number";
    if (value < 0 || value > (def?.maxScore ?? 100))
      return `must be between 0 and ${def?.maxScore}`;
    return null;
  };

  const errors = useMemo(() => {
    const list: { student: string; message: string }[] = [];
    students.forEach((s: any) => {
      definitions.forEach((d: any) => {
        const err = cellError(d.name, marks[s._id]?.[d.name] ?? "");
        if (err) {
          list.push({
            student: `${s.firstName || ""} ${s.surName || ""}`.trim(),
            message: `${d.name} ${err}`,
          });
        }
      });
    });
    return list;
  }, [marks, definitions, students]);

  const rowTotal = (studentId: string) =>
    definitions.reduce((sum: number, d: any) => {
      const raw = marks[studentId]?.[d.name] ?? "";
      const n = Number(raw);
      return raw === "" || Number.isNaN(n) ? sum : sum + n;
    }, 0);

  const rowComplete = (studentId: string) =>
    definitions.length > 0 &&
    definitions.every((d: any) => (marks[studentId]?.[d.name] ?? "") !== "");

  const enteredCount = students.filter((s: any) =>
    definitions.some((d: any) => (marks[s._id]?.[d.name] ?? "") !== "")
  ).length;

  const isDirty = JSON.stringify(marks) !== JSON.stringify(saved);

  // ---------- Interaction ----------
  const setCell = (studentId: string, name: string, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [name]: value },
    }));
  };

  // Enter moves DOWN the column — teachers mark one assessment at a time
  const onKeyDown = (e: any, rowIndex: number, colIndex: number) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const next = document.getElementById(`cell-${rowIndex + 1}-${colIndex}`);
    if (next) (next as HTMLInputElement).focus();
  };

  const handleDiscard = () => setMarks(JSON.parse(JSON.stringify(saved)));

  const handleSave = async () => {
    if (errors.length > 0) {
      toast.error("Fix the highlighted scores first", toastOptions);
      return;
    }

    const entries = students
      .map((s: any) => {
        const scores = definitions
          .filter((d: any) => (marks[s._id]?.[d.name] ?? "") !== "")
          .map((d: any) => ({ name: d.name, score: Number(marks[s._id][d.name]) }));
        return { studentId: s._id, scores };
      })
      .filter((e: any) => e.scores.length > 0);

    if (entries.length === 0) {
      toast.error("Enter at least one score before saving", toastOptions);
      return;
    }

    setSaving(true);
    try {
      await SERVER.post("result/batch", {
        classArmId: context.classArmId,
        subjectId: context.subjectId,
        termId,
        sessionId: activeSession._id,
        entries,
      });
      toast.success(`Scores saved for ${entries.length} students`, toastOptions);
      await queryClient.invalidateQueries({
        queryKey: ["class-subject-results", context.classArmId, context.subjectId, termId],
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Could not save scores", toastOptions);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------
  if (subjectsPending) return <Loader />;

  if (contexts.length === 0) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">Nothing to grade yet</h1>
        <p className="mt-2 text-sm text-gray-1 leading-relaxed">
          You'll enter scores here once your school administrator assigns you a
          subject to teach.
        </p>
      </div>
    );
  }

  const gridCols = `minmax(160px, 1.6fr) repeat(${definitions.length}, 72px) 64px 56px`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel>Subject &amp; class</InputLabel>
          <Select
            value={contextKey}
            label="Subject & class"
            onChange={(e) => setContextKey(e.target.value)}
            sx={{ borderRadius: "10px" }}
          >
            {contexts.map((c: any) => (
              <MenuItem key={c.key} value={c.key}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Term</InputLabel>
          <Select
            value={termId}
            label="Term"
            onChange={(e) => setTermId(e.target.value)}
            sx={{ borderRadius: "10px" }}
          >
            {terms.map((t: any) => (
              <MenuItem key={t._id} value={t._id}>
                {t.termName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isFormTeacher && (
          <span className="text-xs px-3 py-1.5 rounded-[8px] bg-bg-2 text-tertiary">
            Your form class
          </span>
        )}
      </div>

      {formatPending ? (
        <Loader />
      ) : definitions.length === 0 ? (
        <div className="border border-[#DEE0E0] rounded-[12px] p-8 text-center">
          <p className="text-[15px] text-text-pry">
            No assessment format for this class level
          </p>
          <p className="mt-1 text-sm text-text-ter">
            Your school administrator sets this in Academics → Assessment Format.
            Scores can't be entered until it exists.
          </p>
        </div>
      ) : studentsPending ? (
        <Loader />
      ) : students.length === 0 ? (
        <div className="border border-[#DEE0E0] rounded-[12px] p-8 text-center">
          <p className="text-[15px] text-text-pry">No students in this class yet</p>
        </div>
      ) : (
        <div className="border border-[#DEE0E0] rounded-[12px] overflow-hidden">
          <div className="overflow-x-auto">
            {/* Header */}
            <div
              className="grid gap-0 bg-bg-7 px-4 py-2.5 text-[11px] text-text-sec min-w-[520px]"
              style={{ gridTemplateColumns: gridCols }}
            >
              <span>Student</span>
              {definitions.map((d: any) => (
                <span key={d.name} className="text-center">
                  {d.name}
                  <br />
                  <span className="text-text-ter tabular-nums">/{d.maxScore}</span>
                </span>
              ))}
              <span className="text-center">Total</span>
              <span className="text-center">Grade</span>
            </div>

            {/* Rows */}
            {students.map((student: any, rowIndex: number) => {
              const total = rowTotal(student._id);
              const complete = rowComplete(student._id);
              const band = complete ? gradeFor(total) : null;

              return (
                <div key={student._id}>
                  <div
                    className="grid items-center px-4 py-1.5 border-t border-[#EFF5F8] text-sm min-w-[520px]"
                    style={{ gridTemplateColumns: gridCols }}
                  >
                    <span className="text-text-pry truncate pr-2">
                      {`${student.firstName || ""} ${student.surName || ""}`.trim()}
                    </span>

                    {definitions.map((d: any, colIndex: number) => {
                      const raw = marks[student._id]?.[d.name] ?? "";
                      const err = cellError(d.name, raw);
                      return (
                        <span key={d.name} className="text-center">
                          <input
                            id={`cell-${rowIndex}-${colIndex}`}
                            type="number"
                            inputMode="numeric"
                            value={raw}
                            placeholder="—"
                            aria-label={`${d.name} for ${student.firstName}`}
                            onChange={(e) => setCell(student._id, d.name, e.target.value)}
                            onKeyDown={(e) => onKeyDown(e, rowIndex, colIndex)}
                            disabled={readOnly}
                            className={`w-[52px] text-center py-1.5 rounded-[6px] border tabular-nums outline-none focus:border-tertiary ${
                              err
                                ? "border-[#C2453D] text-[#C2453D]"
                                : "border-[#DEE0E0] text-text-pry"
                            } disabled:bg-bg-7 disabled:text-text-ter`}
                          />
                        </span>
                      );
                    })}

                    <span
                      className={`text-center tabular-nums ${
                        complete ? "text-text-pry" : "text-text-ter"
                      }`}
                    >
                      {total > 0 || complete ? total : "—"}
                    </span>

                    <span
                      className="text-center text-sm font-medium"
                      style={{ color: band?.color || "#9AA5A9" }}
                    >
                      {band?.grade || "—"}
                    </span>
                  </div>

                  {definitions.map((d: any) => {
                    const err = cellError(d.name, marks[student._id]?.[d.name] ?? "");
                    if (!err) return null;
                    return (
                      <p
                        key={`err-${d.name}`}
                        className="px-4 py-1.5 bg-[#FDEEED] text-[12px] text-[#C2453D] border-t border-[#EFF5F8]"
                      >
                        {`${student.firstName || ""} ${student.surName || ""}`.trim()} ·{" "}
                        {d.name} {err}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[#DEE0E0] bg-bg-7">
            <p className="text-[13px] text-gray-1 tabular-nums">
              {enteredCount} of {students.length} entered
              {errors.length > 0 && (
                <span className="text-[#C2453D]">
                  {" "}
                  · {errors.length} need{errors.length === 1 ? "s" : ""} fixing
                </span>
              )}
            </p>
            <div className="flex gap-3">
              {isDirty && (
                <button
                  onClick={handleDiscard}
                  className="px-4 py-2.5 rounded-[10px] text-sm text-text-sec border border-[#DEE0E0] hover:border-tertiary transition-colors"
                >
                  Discard changes
                </button>
              )}
              <Button
                color="tertiary"
                variant="contained"
                onClick={handleSave}
                disabled={saving || errors.length > 0 || !isDirty}
                sx={{
                  color: "white",
                  borderRadius: "10px",
                  paddingY: "10px",
                  paddingX: "24px",
                  textTransform: "capitalize",
                }}
              >
                {saving ? "Saving..." : "Save scores"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-text-ter">
        Enter moves down the column · Tab moves across the row
      </p>
    </div>
  );
}