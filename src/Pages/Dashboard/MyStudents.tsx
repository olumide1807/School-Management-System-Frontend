import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import SERVER from "../../Utils/server";
import { useClassLevels } from "../../services/api-call";
import useMyClasses from "../../hooks/useMyClasses";
import Loader from "../loaders/Loader";
import BasicTable from "../../Components/Tables/BasicTable";
import SearchInput from "../../Components/Forms/SearchInput";

export default function MyStudents() {
  const navigate = useNavigate();

  const { myClasses, isPending: classesPending } = useMyClasses();
  const levelsData = useClassLevels();
  const classLevels = levelsData?.data?.data?.data || [];

  const [activeArmId, setActiveArmId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!activeArmId && myClasses.length > 0) setActiveArmId(myClasses[0]._id);
  }, [myClasses, activeArmId]);

  const armLabel = (arm: any) => {
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  const activeArm = myClasses.find((a: any) => a._id === activeArmId);

  const { data: studentsData, isPending: studentsPending } = useQuery({
    queryKey: ["class-students", activeArmId],
    queryFn: async () => {
      const res = await SERVER.get(`student/class/${activeArmId}`);
      return res?.data;
    },
    enabled: !!activeArmId,
    retry: false,
  });

  const students = studentsData?.data || [];

  const filtered = students.filter((s: any) => {
    const name = `${s.firstName || ""} ${s.surName || ""}`.toLowerCase();
    const idText = (s.studentID || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || idText.includes(q);
  });

  const headcells = [
    { key: "sn", name: "S/N" },
    { key: "name", name: "Student" },
    { key: "studentId", name: "Student ID" },
    { key: "gender", name: "Gender" },
    { key: "action", name: "" },
  ];

  const tableData = filtered.map((student: any, i: number) => ({
    sn: i + 1,
    name: `${student.firstName || ""} ${student.surName || ""}`.trim(),
    studentId: student.studentID || "-",
    gender:
      student.gender === "male" ? "M" : student.gender === "female" ? "F" : "-",
    action: (
      <button
        onClick={() =>
          navigate(`/student-management/student-profile/${student._id}`)
        }
        className="text-sm text-tertiary hover:underline whitespace-nowrap"
      >
        View profile
      </button>
    ),
  }));

  if (classesPending) return <Loader />;

  if (myClasses.length === 0) {
    return (
      <div className="max-w-[520px] py-10">
        <h1 className="text-xl font-semibold text-secondary">No class yet</h1>
        <p className="mt-2 text-sm text-gray-1 leading-relaxed">
          You'll see your students here once your school administrator makes you
          the form teacher of a class.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-secondary">
            {armLabel(activeArm)}
          </h1>
          <p className="text-sm text-text-ter mt-1">
            {students.length} {students.length === 1 ? "student" : "students"}
          </p>
        </div>
        <SearchInput
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          placeholder="Search by name or ID"
        />
      </div>

      {myClasses.length > 1 && (
        <div className="flex gap-2 mb-5">
          {myClasses.map((arm: any) => (
            <button
              key={arm._id}
              onClick={() => setActiveArmId(arm._id)}
              className={`px-4 py-2 rounded-[10px] text-sm transition-colors ${
                arm._id === activeArmId
                  ? "bg-tertiary text-white"
                  : "text-text-sec border border-[#DEE0E0] hover:border-tertiary"
              }`}
            >
              {armLabel(arm)}
            </button>
          ))}
        </div>
      )}

      {studentsPending ? (
        <Loader />
      ) : students.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-[15px] text-text-pry">
            No students in {armLabel(activeArm)} yet
          </p>
          <p className="mt-1 text-sm text-text-ter">
            Students appear here once they're admitted into this class.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-[15px] text-text-pry">No student matches "{search}"</p>
        </div>
      ) : (
        <BasicTable
          headcells={headcells}
          tableData={tableData}
          onClick={() => {}}
          sideIcon={false}
        />
      )}
    </div>
  );
}