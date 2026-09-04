import { useState } from "react";
import {
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
} from "@mui/material";
import { Search, PersonAdd } from "@mui/icons-material";
import TableComponent from "../../../Components/Tables";
import SERVER from "../../../Utils/server";
import { useQuery } from "@tanstack/react-query";
import {
  useClassArms,
  useClassLevels,
  useSessionTerm,
} from "../../../services/api-call";
import { toast } from "react-toastify";
import { toastOptions } from "../../../Utils/toastOptions";
import { useNavigate } from "react-router-dom";
import Loader from "../../loaders/Loader";
import { printStudentIdCard } from "./printStudentIdCard";

const TABS = ["Students", "Parents/Guardians"];

export default function StudentManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-1">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-sm font-medium relative ${
                activeTab === i
                  ? "text-tertiary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {activeTab === i && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 0 && <StudentListTab />}
      {activeTab === 1 && <ParentListTab />}
    </div>
  );
}

// ============================================================
// STUDENT LIST TAB
// ============================================================
function StudentListTab() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const classArms = allArms?.data?.data?.data || [];
  const classLevels = allLevels?.data?.data?.data || [];

  const session = useSessionTerm();
  const activeSession = session?.data?.data?.data?.session;
  const activeTerm = session?.data?.data?.data?.term;

  // Fetch all students
  const { data: studentsData, isPending } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () => {
      const res = await SERVER.get("student");
      return res?.data;
    },
    retry: false,
  });
  const students = studentsData?.data || [];

  // Fetch fees + payments for fee status
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

  const { data: feesData } = useQuery({
    queryKey: ["all-fees"],
    queryFn: async () => {
      const res = await SERVER.get("fee");
      return res?.data;
    },
    retry: false,
  });
  const allFees = feesData?.data || [];

  // Reference term for fee status
  const referenceTerm = (() => {
    if (activeTerm?._id) return activeTerm;
    const now = new Date();
    const endOfDay = (d: Date) => {
      const e = new Date(d);
      e.setHours(23, 59, 59, 999);
      return e;
    };
    const upcoming = [...terms]
      .filter((t: any) => t.termStartDate && new Date(t.termStartDate) > now)
      .sort(
        (a: any, b: any) =>
          new Date(a.termStartDate).getTime() -
          new Date(b.termStartDate).getTime(),
      );
    if (upcoming.length > 0) return upcoming[0];
    const completed = [...terms]
      .filter(
        (t: any) => t.termEndDate && endOfDay(new Date(t.termEndDate)) < now,
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.termEndDate).getTime() - new Date(a.termEndDate).getTime(),
      );
    return completed[0] || null;
  })();

  const feesInRefTerm = referenceTerm
    ? allFees.filter((f: any) => f.termId === referenceTerm._id)
    : [];

  const { data: allPaymentsData } = useQuery({
    queryKey: [
      "student-fee-payments",
      referenceTerm?._id,
      feesInRefTerm.length,
    ],
    queryFn: async () => {
      if (feesInRefTerm.length === 0) return [];
      const results = await Promise.all(
        feesInRefTerm.map((fee: any) =>
          SERVER.get(`payment/fee/${fee._id}`)
            .then((r) => r?.data?.data || [])
            .catch(() => []),
        ),
      );
      return results.flat();
    },
    enabled: !!referenceTerm?._id && feesInRefTerm.length > 0,
    retry: false,
  });
  const refTermPayments = allPaymentsData || [];

  const getArmLabel = (armId: string) => {
    const arm = classArms.find((a: any) => a._id === armId);
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  const getStudentFeeStatus = (student: any) => {
    if (!referenceTerm?._id) return { label: "N/A", color: "gray" };
    const fee = feesInRefTerm.find(
      (f: any) => f.classArmId === student.classArmId,
    );
    if (!fee) return { label: "No fee", color: "gray" };
    const totalOwed =
      fee.fees?.reduce(
        (s: number, f: any) => s + (parseFloat(f.amount) || 0),
        0,
      ) || 0;
    const paid = refTermPayments
      .filter((p: any) => p.studentId === student._id && p.feeId === fee._id)
      .reduce((s: number, p: any) => s + (p.amount || 0), 0);
    if (paid >= totalOwed) return { label: "Paid", color: "green" };
    if (paid > 0) return { label: "Partial", color: "yellow" };
    return { label: "Unpaid", color: "red" };
  };

  // Filtering
  const filteredStudents = students
    .filter((s: any) => {
      if (filterClass === "All") return true;
      return s.classArmId === filterClass;
    })
    .filter((s: any) => {
      if (filterGender === "All") return true;
      return s.gender === filterGender.toLowerCase();
    })
    .filter((s: any) => {
      if (filterStatus === "All") return true;
      return s.status === filterStatus.toLowerCase();
    })
    .filter((s: any) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const fullName =
        `${s.firstName || ""} ${s.surName || ""} ${s.otherName || ""}`.toLowerCase();
      return fullName.includes(q) || s.studentID?.toLowerCase().includes(q);
    });

  // Stats
  const totalStudents = students.length;
  const activeStudents = students.filter(
    (s: any) => s.status === "active",
  ).length;
  const maleStudents = students.filter((s: any) => s.gender === "male").length;
  const femaleStudents = students.filter(
    (s: any) => s.gender === "female",
  ).length;

  // Table
  const feeStatusColors: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };

  const tableData = filteredStudents.map((student: any, i: number) => {
    const feeStatus = getStudentFeeStatus(student);
    return {
      sn: i + 1,
      student: (
        <div className="flex gap-x-3 items-center">
          <Avatar
            sx={{ width: 36, height: 36 }}
            src={student.photo || ""}
            alt={student.firstName?.[0]}
          />
          <div className="flex flex-col">
            <p className="text-sm font-medium">
              {student.firstName} {student.surName}
            </p>
            <p className="text-xs text-gray-500">{student.studentID}</p>
          </div>
        </div>
      ),
      gender: student.gender === "male" ? "M" : "F",
      level: getArmLabel(student.classArmId),
      feeStatus: (
        <span
          className={`px-3 py-1 rounded text-xs font-medium ${feeStatusColors[feeStatus.color]}`}
        >
          {feeStatus.label}
        </span>
      ),
      status: (
        <span
          className={`px-3 py-1 rounded text-xs font-medium ${
            student.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {student.status}
        </span>
      ),
      actions: "",
      id: student._id,
      _raw: student,
    };
  });

  const headcells = [
    { key: "sn", name: "S/N" },
    { key: "student", name: "Student" },
    { key: "gender", name: "Gender" },
    { key: "level", name: "Class" },
    { key: "feeStatus", name: "Fee Status" },
    { key: "status", name: "Status" },
    {
      key: "actions",
      name: [
        {
          name: "View Profile",
          handleClick: (row: any) =>
            navigate(`/student-management/student-profile/${row._raw._id}`),
        },
        {
          name: "Record Fee Payment",
          handleClick: (row: any) =>
            navigate(`/school-management/fee-management`),
        },
        {
          name: "Print ID Card",
          handleClick: (row: any) => {
            printStudentIdCard({
              student: row._raw,
              schoolName: activeSession?.sessionName || "School",
              classLabel: getArmLabel(row._raw.classArmId),
              sessionName: activeSession?.sessionName || "",
            });
          },
        },
      ],
    },
  ];

  if (isPending) return <Loader />;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">All registered students</p>
        <Button
          color="tertiary"
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => navigate("/school-management/admission")}
          sx={{
            color: "white",
            borderRadius: "10px",
            paddingY: "10px",
            paddingX: "20px",
            textTransform: "capitalize",
          }}
        >
          Admit Student
        </Button>
        <Button
          variant="outlined"
          color="tertiary"
          onClick={() => navigate("/student-management/promote")}
          sx={{
            borderRadius: "10px",
            paddingY: "10px",
            paddingX: "20px",
            textTransform: "capitalize",
          }}
        >
          Promote Students
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-black">{totalStudents}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-green-50">
          <p className="text-xs text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-700">{activeStudents}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-blue-50">
          <p className="text-xs text-gray-500 mb-1">Male</p>
          <p className="text-2xl font-bold text-blue-700">{maleStudents}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-pink-50">
          <p className="text-xs text-gray-500 mb-1">Female</p>
          <p className="text-2xl font-bold text-pink-700">{femaleStudents}</p>
        </div>
      </div>

      {/* Filters */}
      {students.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-[400px]">
            <Search fontSize="small" className="text-gray-400 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="flex-1 outline-none text-sm"
            />
          </div>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={filterClass}
              label="Class"
              onChange={(e) => setFilterClass(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value="All">All Classes</MenuItem>
              {classArms.map((arm: any) => (
                <MenuItem key={arm._id} value={arm._id}>
                  {getArmLabel(arm._id)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Gender</InputLabel>
            <Select
              value={filterGender}
              label="Gender"
              onChange={(e) => setFilterGender(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Deactivated">Deactivated</MenuItem>
            </Select>
          </FormControl>
        </div>
      )}

      {students.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] border border-gray-100 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-500">No students registered yet</p>
            <Button
              color="tertiary"
              variant="contained"
              onClick={() => navigate("/school-management/admission")}
              sx={{
                color: "white",
                borderRadius: "10px",
                textTransform: "capitalize",
              }}
            >
              Admit Student
            </Button>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] border border-gray-100 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-500">No students match your filters</p>
            <Button
              variant="outlined"
              color="tertiary"
              onClick={() => {
                setSearchTerm("");
                setFilterClass("All");
                setFilterGender("All");
                setFilterStatus("All");
              }}
              sx={{ borderRadius: "10px", textTransform: "capitalize" }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      ) : (
        <TableComponent
          headcells={headcells}
          tableData={tableData}
          message="No students found"
        />
      )}
    </>
  );
}

// ============================================================
// PARENT LIST TAB
// ============================================================
function ParentListTab() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: parentsData, isPending } = useQuery({
    queryKey: ["all-parents"],
    queryFn: async () => {
      const res = await SERVER.get("parent");
      return res?.data;
    },
    retry: false,
  });
  const parents = parentsData?.data || [];

  const { data: studentsData } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () => {
      const res = await SERVER.get("student");
      return res?.data;
    },
    retry: false,
  });
  const students = studentsData?.data || [];

  const filteredParents = parents.filter((p: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const name = `${p.firstName || ""} ${p.surName || ""}`.toLowerCase();
    return (
      name.includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phoneNumber?.includes(q)
    );
  });

  const getLinkedStudents = (parentId: string) => {
    return students.filter((s: any) =>
      s.guardians?.some((g: any) => g.parentId === parentId),
    );
  };

  const tableData = filteredParents.map((parent: any, i: number) => {
    const linked = getLinkedStudents(parent._id);
    return {
      sn: i + 1,
      guardian: (
        <div className="flex gap-x-3 items-center">
          <Avatar sx={{ width: 36, height: 36 }}>
            {parent.firstName?.[0] || "P"}
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">
              {parent.title || ""} {parent.firstName} {parent.surName}
            </p>
            <p className="text-xs text-gray-500">{parent.email || "-"}</p>
          </div>
        </div>
      ),
      phone: parent.phoneNumber || "-",
      wards:
        linked.length > 0 ? (
          linked.map((s: any) => `${s.firstName} ${s.surName}`).join(", ")
        ) : (
          <span className="text-gray-400 text-xs">No student linked</span>
        ),
      wardCount: `${linked.length} student${linked.length !== 1 ? "s" : ""}`,
      actions: "",
      id: parent._id,
      _raw: parent,
    };
  });

  const headcells = [
    { key: "sn", name: "S/N" },
    { key: "guardian", name: "Parent/Guardian" },
    { key: "phone", name: "Phone" },
    { key: "wards", name: "Ward(s)" },
    { key: "wardCount", name: "Linked" },
    {
      key: "actions",
      name: [
        {
          name: "View Profile",
          handleClick: (row: any) =>
            navigate(`/student-management/parent-profile/${row._raw._id}`),
        },
      ],
    },
  ];

  if (isPending) return <Loader />;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">
          All registered parents and guardians
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Parents</p>
          <p className="text-2xl font-bold text-black">{parents.length}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-green-50">
          <p className="text-xs text-gray-500 mb-1">With Linked Students</p>
          <p className="text-2xl font-bold text-green-700">
            {
              parents.filter((p: any) => getLinkedStudents(p._id).length > 0)
                .length
            }
          </p>
        </div>
      </div>

      {parents.length > 0 && (
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 max-w-[400px] mb-6">
          <Search fontSize="small" className="text-gray-400 mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="flex-1 outline-none text-sm"
          />
        </div>
      )}

      {parents.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] border border-gray-100 rounded-lg">
          <p className="text-gray-500">
            No parents registered yet. Parents are added during student
            admission.
          </p>
        </div>
      ) : (
        <TableComponent
          headcells={headcells}
          tableData={tableData}
          message="No parents match your search"
        />
      )}
    </>
  );
}
