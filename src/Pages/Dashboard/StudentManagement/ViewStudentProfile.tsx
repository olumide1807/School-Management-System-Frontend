import { useState, useEffect } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel, Avatar, Chip } from "@mui/material";
import { KeyboardBackspace, Edit, Save, Cancel, CameraAlt, OpenInNew } from "@mui/icons-material";
import Modal from "../../../Components/Modals";
import MessageModal from "../../../Components/Modals/MessageModal";
import SERVER from "../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClassArms, useClassLevels, useSessionTerm } from "../../../services/api-call";
import { toast } from "react-toastify";
import { toastOptions } from "../../../Utils/toastOptions";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../loaders/Loader";
import { statesData } from "../../../Data/statesData";
import { printStudentIdCard } from "./printStudentIdCard";

const COUNTRIES = ['Nigeria', 'Ghana', 'Cameroon', 'Togo', 'Benin', 'South Africa', 'Kenya', 'United Kingdom', 'United States', 'Canada', 'India', 'Other'];
const RELATIONSHIPS_LIST = ['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Spouse', 'Guardian', 'Other'];

const TABS = ["Personal Info", "Parent/Guardian", "Fees", "Attendance"];

const DROPDOWN_OPTIONS: Record<string, string[]> = {
  gender: ["male", "female"],
  religion: ["Islam", "Christianity", "Traditional", "Other"],
  bloodGroup: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  nationality: ["Nigerian", "Ghanaian", "Cameroonian", "Other"],
  country: COUNTRIES,
};

const InfoRow = ({ label, value, editing, field, editData, onChange }: any) => (
  <div className="flex flex-col py-2">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    {editing && field ? (
      DROPDOWN_OPTIONS[field] ? (
        <select value={editData?.[field] || ""} onChange={(e) => onChange(field, e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm bg-white">
          <option value="">— Select —</option>
          {DROPDOWN_OPTIONS[field].map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input value={editData?.[field] || ""} onChange={(e) => onChange(field, e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm" />
      )
    ) : (
      <p className="text-sm text-black font-medium">{value || "—"}</p>
    )}
  </div>
);

export default function ViewStudentProfile() {
  const { id: studentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // Transfer
  const [openTransfer, setOpenTransfer] = useState(false);
  const [transferArmId, setTransferArmId] = useState("");

  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const classArms = allArms?.data?.data?.data || [];
  const classLevels = allLevels?.data?.data?.data || [];

  const session = useSessionTerm();
  const activeSession = session?.data?.data?.data?.session;
  const activeTerm = session?.data?.data?.data?.term;

  // Fetch student
  const { data: studentsData, isPending } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () => { const res = await SERVER.get("student"); return res?.data; },
    retry: false,
  });
  const student = studentsData?.data?.find((s: any) => s._id === studentId);

  // Fetch parents
  const { data: parentsData } = useQuery({
    queryKey: ["all-parents"],
    queryFn: async () => { const res = await SERVER.get("parent"); return res?.data; },
    retry: false,
  });
  const allParents = parentsData?.data || [];

  // Fetch fees
  const { data: feesData } = useQuery({
    queryKey: ["all-fees"],
    queryFn: async () => { const res = await SERVER.get("fee"); return res?.data; },
    retry: false,
  });

  // Fetch student payments
  const { data: paymentsData } = useQuery({
    queryKey: ["student-payments", studentId],
    queryFn: async () => { const res = await SERVER.get(`payment/student/${studentId}`); return res?.data; },
    enabled: !!studentId, retry: false,
  });

  // Fetch terms
  const { data: termsData } = useQuery({
    queryKey: ["session-terms", activeSession?._id],
    queryFn: async () => { const res = await SERVER.get(`session/term/${activeSession._id}`); return res?.data?.data || []; },
    enabled: !!activeSession?._id, retry: false,
  });

  // Fetch attendance
  const { data: attendanceData } = useQuery({
    queryKey: ["student-attendance", studentId],
    queryFn: async () => { const res = await SERVER.get(`attendance/student/${studentId}`); return res?.data; },
    enabled: !!studentId, retry: false,
  });

  const allFees = feesData?.data || [];
  const allPayments = paymentsData?.data || [];
  const allTerms = termsData || [];
  const attendanceRecords = attendanceData?.data || [];

  // Init edit data
  useEffect(() => {
    if (student && editing) {
      setEditData({
        firstName: student.firstName || "", surName: student.surName || "", otherName: student.otherName || "",
        gender: student.gender || "", dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : "",
        email: student.email || "", phoneNumber: student.phoneNumber || "",
        country: student.country || "", stateOfOrigin: student.stateOfOrigin || "",
        localGovernmentArea: student.localGovernmentArea || "",
        religion: student.religion || "", bloodGroup: student.bloodGroup || "",
        nationality: student.nationality || "",
        allergies: student.medicalInfo?.allergies || "", disabilities: student.medicalInfo?.disabilities || "",
        medicalConditions: student.medicalInfo?.medicalConditions || "",
        emergencyName: student.emergencyContact?.name || "", emergencyPhone: student.emergencyContact?.phone || "",
        emergencyRelationship: student.emergencyContact?.relationship || "",
      });
    }
  }, [student, editing]);

  const handleChange = (field: string, value: string) => setEditData((prev: any) => ({ ...prev, [field]: value }));

  const getArmLabel = (armId: string) => {
    const arm = classArms.find((a: any) => a._id === armId);
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  // Photo upload
  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("studentId", studentId || "");
      await SERVER.put(`student/${studentId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Photo updated!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["student-profile", studentId] });
      queryClient.invalidateQueries({ queryKey: ["all-students"] });
    } catch (error: any) { toast.error(error?.response?.data?.error || "Upload failed", toastOptions); }
    finally { setUploadingPhoto(false); }
  };

  // Save edit
  const handleSave = async () => {
    setSaving(true);
    try {
      await SERVER.put(`student/${studentId}`, {
        firstName: editData.firstName, surName: editData.surName, otherName: editData.otherName,
        gender: editData.gender, dateOfBirth: editData.dateOfBirth,
        email: editData.email, phoneNumber: editData.phoneNumber,
        country: editData.country, stateOfOrigin: editData.stateOfOrigin,
        localGovernmentArea: editData.localGovernmentArea,
        religion: editData.religion, bloodGroup: editData.bloodGroup, nationality: editData.nationality,
        medicalInfo: { allergies: editData.allergies, disabilities: editData.disabilities, medicalConditions: editData.medicalConditions },
        emergencyContact: { name: editData.emergencyName, phone: editData.emergencyPhone, relationship: editData.emergencyRelationship },
      });
      toast.success("Profile updated!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["student-profile", studentId] });
      queryClient.invalidateQueries({ queryKey: ["all-students"] });
      setEditing(false);
    } catch (error: any) { toast.error(error?.response?.data?.error || "Update failed", toastOptions); }
    finally { setSaving(false); }
  };

  // Transfer class
  const handleTransfer = async () => {
    if (!transferArmId) return;
    try {
      await SERVER.put(`student/${studentId}`, { classArmId: transferArmId });
      toast.success(`Student transferred to ${getArmLabel(transferArmId)}`, toastOptions);
      queryClient.invalidateQueries({ queryKey: ["student-profile", studentId] });
      queryClient.invalidateQueries({ queryKey: ["all-students"] });
      setOpenTransfer(false); setTransferArmId("");
    } catch (error: any) { toast.error(error?.response?.data?.error || "Transfer failed", toastOptions); }
  };

  if (isPending) return <Loader />;
  if (!student) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">Student not found</p>
      <Button onClick={() => navigate("/student-management")} variant="outlined" sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Back</Button>
    </div>
  );
     
  const handlePrintIdCard = () => {
     const guardian = student.guardians?.[0];
     const parent = guardian ? allParents.find((p: any) => p._id === guardian.parentId) : null;
     printStudentIdCard({
       student,
       schoolName: activeSession?.sessionName?.split("/")?.[0]
         ? "Qiblah Model School"
         : "School",
       classLabel: getArmLabel(student.classArmId),
       sessionName: activeSession?.sessionName || "",
       parentInfo: parent
         ? { name: `${parent.title || ""} ${parent.firstName} ${parent.surName}`.trim(), phone: parent.phoneNumber || "—" }
         : undefined,
     });
   };

  const fullName = `${student.firstName || ""} ${student.surName || ""}`.trim();

  // Fees calculations
  const studentFees = allFees.filter((f: any) => f.classArmId === student.classArmId);
  const getTotalFee = (fee: any) => fee.fees?.reduce((s: number, f: any) => s + (parseFloat(f.amount) || 0), 0) || 0;
  const getTotalPaid = (feeId: string) => allPayments.filter((p: any) => p.feeId === feeId).reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const totalOwed = studentFees.reduce((s: number, f: any) => s + getTotalFee(f), 0);
  const totalPaid = allPayments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const totalBalance = totalOwed - totalPaid;

  // Attendance calculations
  const totalAttDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter((r: any) => r.status === "present").length;
  const absentDays = attendanceRecords.filter((r: any) => r.status === "absent").length;
  const attRate = totalAttDays > 0 ? Math.round((presentDays / totalAttDays) * 100) : 0;

  return (
    <div className="max-w-[900px] mx-auto">
      <button onClick={() => navigate("/student-management")} className="text-tertiary flex items-center gap-1 text-sm hover:underline mb-6">
        <KeyboardBackspace fontSize="small" /> Back to Students
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <Avatar sx={{ width: 80, height: 80, fontSize: 32 }} src={student.photo || ""}>
              {student.firstName?.[0]}{student.surName?.[0]}
            </Avatar>
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingPhoto ? <span className="text-white text-xs">...</span> : <CameraAlt sx={{ color: "white", fontSize: 24 }} />}
              <input type="file" accept="image/*" className="hidden" disabled={uploadingPhoto}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-black">{fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Chip label={student.studentID} size="small" variant="outlined" />
              <Chip label={getArmLabel(student.classArmId)} size="small" sx={{ backgroundColor: "#DBEAFE", color: "#1D4ED8" }} />
              <Chip label={student.gender} size="small" variant="outlined" />
              <Chip label={student.status || "active"} size="small"
                sx={{ backgroundColor: student.status === "active" ? "#DCFCE7" : "#FEE2E2", color: student.status === "active" ? "#15803D" : "#B91C1C" }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!editing ? (
              <>
                <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditing(true)}
                  sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Edit</Button>
                <Button variant="outlined" color="info" onClick={() => setOpenTransfer(true)}
                  sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Transfer Class</Button>
                <Button variant="outlined" color="secondary" onClick={handlePrintIdCard}
                    sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Print ID Card</Button>
              </>
            ) : (
              <>
                <Button variant="outlined" startIcon={<Cancel />} onClick={() => setEditing(false)}
                  sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Cancel</Button>
                <Button variant="contained" color="tertiary" startIcon={<Save />} onClick={handleSave} disabled={saving}
                  sx={{ color: "white", borderRadius: "10px", textTransform: "capitalize" }}>
                  {saving ? "Saving..." : "Save"}</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`px-5 py-3 text-sm font-medium relative whitespace-nowrap ${activeTab === i ? "text-tertiary" : "text-gray-500 hover:text-gray-700"}`}>
              {tab}
              {activeTab === i && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary" />}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">

        {/* Tab 0: Personal Info */}
        {activeTab === 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-4 text-black">Personal Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1">
              <InfoRow label="First Name" value={student.firstName} editing={editing} field="firstName" editData={editData} onChange={handleChange} />
              <InfoRow label="Surname" value={student.surName} editing={editing} field="surName" editData={editData} onChange={handleChange} />
              <InfoRow label="Other Name" value={student.otherName} editing={editing} field="otherName" editData={editData} onChange={handleChange} />
              <InfoRow label="Student ID" value={student.studentID} />
              <InfoRow label="Gender" value={student.gender} editing={editing} field="gender" editData={editData} onChange={handleChange} />
              <InfoRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "—"}
                editing={editing} field="dateOfBirth" editData={editData} onChange={handleChange} />
              <InfoRow label="Religion" value={student.religion} editing={editing} field="religion" editData={editData} onChange={handleChange} />
              <InfoRow label="Blood Group" value={student.bloodGroup} editing={editing} field="bloodGroup" editData={editData} onChange={handleChange} />
              <InfoRow label="Nationality" value={student.nationality} editing={editing} field="nationality" editData={editData} onChange={handleChange} />
              <InfoRow label="Email" value={student.email} editing={editing} field="email" editData={editData} onChange={handleChange} />
              <InfoRow label="Phone" value={student.phoneNumber} editing={editing} field="phoneNumber" editData={editData} onChange={handleChange} />
              {!editing ? (
                <>
                  <InfoRow label="Country" value={student.country} />
                  <InfoRow label="State" value={student.stateOfOrigin} />
                  <InfoRow label="LGA" value={student.localGovernmentArea} />
                </>
              ) : (
                <>
                  <div className="flex flex-col py-2">
                    <p className="text-xs text-gray-500 mb-1">Country</p>
                    <select value={editData.country || ""} onChange={(e) => { handleChange("country", e.target.value); handleChange("stateOfOrigin", ""); handleChange("localGovernmentArea", ""); }}
                      className="border border-gray-300 rounded-lg p-2 text-sm bg-white">
                      <option value="">— Select —</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col py-2">
                    <p className="text-xs text-gray-500 mb-1">State of Origin</p>
                    <select value={editData.stateOfOrigin || ""} onChange={(e) => { handleChange("stateOfOrigin", e.target.value); handleChange("localGovernmentArea", ""); }}
                      className="border border-gray-300 rounded-lg p-2 text-sm bg-white">
                      <option value="">— Select —</option>
                      {editData.country === "Nigeria" && Object.keys(statesData).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col py-2">
                    <p className="text-xs text-gray-500 mb-1">LGA</p>
                    <select value={editData.localGovernmentArea || ""} onChange={(e) => handleChange("localGovernmentArea", e.target.value)}
                      disabled={!editData.stateOfOrigin}
                      className="border border-gray-300 rounded-lg p-2 text-sm bg-white disabled:bg-gray-100">
                      <option value="">— Select —</option>
                      {editData.country === "Nigeria" && editData.stateOfOrigin && (statesData as any)[editData.stateOfOrigin]?.map((lga: any) => {
                        const val = lga.value || lga.label || lga;
                        return <option key={val} value={val}>{val}</option>;
                      })}
                    </select>
                  </div>
                </>
              )}
              <InfoRow label="Class" value={getArmLabel(student.classArmId)} />
              <InfoRow label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "—"} />
              <InfoRow label="Previous School" value={student.previousSchool} />
            </div>

            <h3 className="font-semibold text-lg mb-4 mt-6 text-black">Medical Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1">
              <InfoRow label="Allergies" value={student.medicalInfo?.allergies} editing={editing} field="allergies" editData={editData} onChange={handleChange} />
              <InfoRow label="Disabilities" value={student.medicalInfo?.disabilities} editing={editing} field="disabilities" editData={editData} onChange={handleChange} />
              <InfoRow label="Medical Conditions" value={student.medicalInfo?.medicalConditions} editing={editing} field="medicalConditions" editData={editData} onChange={handleChange} />
            </div>

            <h3 className="font-semibold text-lg mb-4 mt-6 text-black">Emergency Contact</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1">
              <InfoRow label="Name" value={student.emergencyContact?.name} editing={editing} field="emergencyName" editData={editData} onChange={handleChange} />
              <InfoRow label="Phone" value={student.emergencyContact?.phone} editing={editing} field="emergencyPhone" editData={editData} onChange={handleChange} />
              {!editing ? (
                <InfoRow label="Relationship" value={student.emergencyContact?.relationship} />
              ) : (
                <div className="flex flex-col py-2">
                  <p className="text-xs text-gray-500 mb-1">Relationship</p>
                  <select value={editData.emergencyRelationship || ""} onChange={(e) => handleChange("emergencyRelationship", e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 text-sm bg-white">
                    <option value="">— Select —</option>
                    {RELATIONSHIPS_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Parent/Guardian */}
        {activeTab === 1 && (
          <div>
            <h3 className="font-semibold text-lg mb-4 text-black">Parent / Guardian</h3>
            {student.guardians?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {student.guardians.map((g: any, i: number) => {
                  const parent = allParents.find((p: any) => p._id === g.parentId);
                  return (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{parent ? `${parent.title || ""} ${parent.firstName} ${parent.surName}`.trim() : "Unknown"}</p>
                        <p className="text-sm text-gray-500">Relationship: {g.relationship || "—"}</p>
                        <p className="text-sm text-gray-500">Phone: {parent?.phoneNumber || "—"}</p>
                        <p className="text-sm text-gray-500">Email: {parent?.email || "—"}</p>
                      </div>
                      <Button variant="text" size="small"
                        onClick={() => navigate(`/student-management/parent-profile/${g.parentId}`)}
                        sx={{ textTransform: "capitalize" }}>View Profile</Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-10">No parent/guardian linked yet. Link one from the Admissions page.</p>
            )}
          </div>
        )}

        {/* Tab 2: Fees */}
        {activeTab === 2 && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Total Fees</p>
                <p className="text-lg font-bold text-black">₦{totalOwed.toLocaleString()}</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-green-50">
                <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                <p className="text-lg font-bold text-green-700">₦{totalPaid.toLocaleString()}</p>
              </div>
              <div className={`border border-gray-200 rounded-xl p-4 ${totalBalance > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                <p className="text-xs text-gray-500 mb-1">Outstanding</p>
                <p className={`text-lg font-bold ${totalBalance > 0 ? "text-red-700" : "text-gray-700"}`}>₦{totalBalance.toLocaleString()}</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-lg mb-4 text-black">Fees by Term</h3>
              {studentFees.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No fees set for this class yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#E9FAFF] text-left">
                    <th className="p-3 font-semibold">Term</th>
                    <th className="p-3 font-semibold text-right">Amount</th>
                    <th className="p-3 font-semibold text-right">Paid</th>
                    <th className="p-3 font-semibold text-right">Balance</th>
                    <th className="p-3 font-semibold text-center">Status</th>
                  </tr></thead>
                  <tbody>
                    {studentFees.map((fee: any) => {
                      const total = getTotalFee(fee);
                      const paid = getTotalPaid(fee._id);
                      const bal = total - paid;
                      const status = paid >= total ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
                      const termName = allTerms.find((t: any) => t._id === fee.termId)?.termName || "—";
                      return (
                        <tr key={fee._id} className="border-t border-gray-100">
                          <td className="p-3">{termName}</td>
                          <td className="p-3 text-right">₦{total.toLocaleString()}</td>
                          <td className="p-3 text-right">₦{paid.toLocaleString()}</td>
                          <td className="p-3 text-right">{bal > 0 ? `₦${bal.toLocaleString()}` : "—"}</td>
                          <td className="p-3 text-center">
                            <span className={`px-3 py-1 rounded text-xs font-medium ${
                              status === "Paid" ? "bg-green-100 text-green-700" : status === "Partial" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                            }`}>{status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {allPayments.length > 0 && (
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4 text-black">Payment History</h3>
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left">
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold">Term</th>
                    <th className="p-3 font-semibold">Method</th>
                    <th className="p-3 font-semibold">Reference</th>
                    <th className="p-3 font-semibold text-right">Amount</th>
                  </tr></thead>
                  <tbody>
                    {[...allPayments].sort((a: any, b: any) => new Date(b.paymentDate || b.createdAt).getTime() - new Date(a.paymentDate || a.createdAt).getTime())
                      .map((p: any) => {
                        const fee = allFees.find((f: any) => f._id === p.feeId);
                        const termName = fee ? allTerms.find((t: any) => t._id === fee.termId)?.termName || "—" : "—";
                        return (
                          <tr key={p._id} className="border-t border-gray-100">
                            <td className="p-3">{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</td>
                            <td className="p-3">{termName}</td>
                            <td className="p-3 capitalize">{p.paymentMethod || "—"}</td>
                            <td className="p-3">{p.reference || "—"}</td>
                            <td className="p-3 text-right font-medium">₦{parseFloat(p.amount).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Attendance */}
        {activeTab === 3 && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Days Recorded</p>
                <p className="text-2xl font-bold text-black">{totalAttDays}</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-green-50">
                <p className="text-xs text-gray-500 mb-1">Present</p>
                <p className="text-2xl font-bold text-green-700">{presentDays}</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-red-50">
                <p className="text-xs text-gray-500 mb-1">Absent</p>
                <p className="text-2xl font-bold text-red-700">{absentDays}</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-blue-50">
                <p className="text-xs text-gray-500 mb-1">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-700">{totalAttDays > 0 ? `${attRate}%` : "—"}</p>
              </div>
            </div>

            {attendanceRecords.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No attendance records yet.</p>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left">
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold text-center">Status</th>
                    <th className="p-3 font-semibold">Recorded By</th>
                  </tr></thead>
                  <tbody>
                    {attendanceRecords.map((r: any) => (
                      <tr key={r._id} className="border-t border-gray-100">
                        <td className="p-3">{new Date(r.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</td>
                        <td className="p-3 text-center">
                          <span className={`px-3 py-1 rounded text-xs font-medium ${
                            r.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>{r.status === "present" ? "Present" : "Absent"}</span>
                        </td>
                        <td className="p-3 text-gray-500 text-xs">{r.recordedByName || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transfer Class Modal */}
      <Modal openModal={openTransfer} closeModal={() => { setOpenTransfer(false); setTransferArmId(""); }}
        title="Transfer Student to Another Class" maxWidth="400px">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Current class: <strong>{getArmLabel(student.classArmId)}</strong>
          </p>
          <FormControl fullWidth size="small">
            <InputLabel>New Class</InputLabel>
            <Select value={transferArmId} label="New Class" onChange={(e) => setTransferArmId(e.target.value)} sx={{ borderRadius: "10px" }}>
              {classArms.filter((arm: any) => arm._id !== student.classArmId).map((arm: any) => (
                <MenuItem key={arm._id} value={arm._id}>{getArmLabel(arm._id)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="flex gap-3 justify-end">
            <Button variant="outlined" onClick={() => { setOpenTransfer(false); setTransferArmId(""); }}
              sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Cancel</Button>
            <Button variant="contained" color="tertiary" onClick={handleTransfer} disabled={!transferArmId}
              sx={{ color: "white", borderRadius: "10px", textTransform: "capitalize" }}>Transfer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}