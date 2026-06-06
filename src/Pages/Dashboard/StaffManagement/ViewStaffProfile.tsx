import { useState, useEffect } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel, Avatar, Chip, IconButton } from "@mui/material";
import { KeyboardBackspace, Edit, Save, Cancel, Add, Delete, UploadFile, CheckCircle, OpenInNew, CameraAlt, Lock, School, Assignment } from "@mui/icons-material";
import Modal from "../../../Components/Modals";
import MessageModal from "../../../Components/Modals/MessageModal";
import SERVER from "../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClassArms, useClassLevels } from "../../../services/api-call";
import { toast } from "react-toastify";
import { toastOptions } from "../../../Utils/toastOptions";
import { useNavigate, useParams } from "react-router-dom";
import { statesData } from "../../../Data/statesData";
import Loader from "../../loaders/Loader";

const COUNTRIES = ['Nigeria', 'Ghana', 'Cameroon', 'Togo', 'Benin', 'South Africa', 'Kenya', 'United Kingdom', 'United States', 'Canada', 'India', 'Other'];
const RELIGIONS = ['Islam', 'Christianity', 'Traditional', 'Other'];
const TITLES = ['Mr', 'Mrs', 'Miss', 'Dr', 'Prof'];
const RELATIONSHIPS = ['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Spouse', 'Cousin', 'Friend', 'Other'];
const DEGREE_OPTIONS = ['SSCE/WAEC', 'OND', 'HND', 'NCE', 'B.Ed', 'B.Sc', 'B.A', 'B.Tech', 'PGDE', 'M.Ed', 'M.Sc', 'M.A', 'MBA', 'PhD', 'Other'];

const TABS = ["Personal Info", "Contact & Location", "Employment & Qualifications", "Assignments", "Next of Kin"];

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col py-2">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm text-black font-medium">{value || "—"}</p>
  </div>
);

export default function ViewStaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Modals
  const [openMakeAdmin, setOpenMakeAdmin] = useState(false);
  const [openRemoveAdmin, setOpenRemoveAdmin] = useState(false);
  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);
  const [newPasswordResult, setNewPasswordResult] = useState<string | null>(null);
  const [openAssignClass, setOpenAssignClass] = useState(false);

  // Edit form state
  const [form, setForm] = useState<any>({});
  const [qualifications, setQualifications] = useState<any[]>([]);

  // Assignment state
  const [assignClassArmId, setAssignClassArmId] = useState("");

  // Shared data
  const allArmsData = useClassArms();
  const allLevelsData = useClassLevels();
  const classArms = allArmsData?.data?.data?.data || [];
  const classLevels = allLevelsData?.data?.data?.data || [];

  // Fetch staff data
  const { data: staffData, isPending } = useQuery({
    queryKey: ["staff-profile", id],
    queryFn: async () => { const res = await SERVER.get(`staff/${id}`); return res?.data; },
    enabled: !!id, retry: false,
  });
  const staff = staffData?.data;

  // Fetch all class arms to find assigned ones
  const { data: allClassArmsData } = useQuery({
    queryKey: ["all-class-arms-assignments"],
    queryFn: async () => { const res = await SERVER.get("class/arm"); return res?.data; },
    retry: false,
  });
  const allClassArms = allClassArmsData?.data || [];
  const assignedClasses = allClassArms.filter((arm: any) => arm.assignedTeacher === id);

  // Fetch all specific subjects to find assigned ones
  const { data: allSpecificsData } = useQuery({
    queryKey: ["all-specific-subjects"],
    queryFn: async () => { const res = await SERVER.get("subject?find=allSpecificSubjects"); return res?.data; },
    retry: false,
  });
  const allSpecifics = allSpecificsData?.data || [];
  const assignedSubjects = allSpecifics.filter((sp: any) => sp.subjectTeacherId === id);

  // Fetch all subjects for label lookup
  const { data: allSubjectsData } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => { const res = await SERVER.get("subject"); return res?.data; },
    retry: false,
  });
  const allSubjects = allSubjectsData?.data || [];

  // Initialize form
  useEffect(() => {
    if (staff && editing) {
      setForm({
        title: staff.title || "", firstName: staff.firstName || "", surname: staff.surname || "",
        otherName: staff.otherName || "", gender: staff.gender || "", maritalStatus: staff.maritalStatus || "",
        religion: staff.religion || "", emailAddress: staff.emailAddress || "", phoneNumber: staff.phoneNumber || "",
        country: staff.country || "Nigeria", stateOfOrigin: staff.stateOfOrigin || "",
        localGovernmentArea: staff.localGovernmentArea || "", homeAddress: staff.homeAddress || "",
        staffType: staff.staffType || "academic", salary: staff.salary || "",
        employmentDate: staff.employmentDate ? new Date(staff.employmentDate).toISOString().split("T")[0] : "",
        nextOfKinFirstName: staff.nextOfKinFirstName || "", nextOfKinSurname: staff.nextOfKinSurname || "",
        nextOfKinPhoneNumber: staff.nextOfKinPhoneNumber || "", nextOfKinRelationship: staff.nextOfKinRelationship || "",
      });
      setQualifications(
        staff.qualifications?.length > 0
          ? staff.qualifications.map((q: any) => ({ ...q, uploading: false }))
          : [{ degree: "", fieldOfStudy: "", institution: "", yearGraduated: "", certificateUrl: "", uploading: false }]
      );
    }
  }, [staff, editing]);

  // Helpers
  const updateForm = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));
  const addQualification = () => setQualifications([...qualifications, { degree: "", fieldOfStudy: "", institution: "", yearGraduated: "", certificateUrl: "", uploading: false }]);
  const removeQualification = (i: number) => setQualifications(qualifications.filter((_, idx) => idx !== i));
  const updateQualification = (i: number, field: string, value: any) => {
    const updated = [...qualifications]; updated[i] = { ...updated[i], [field]: value }; setQualifications(updated);
  };

  const getArmLabel = (armId: string) => {
    const arm = classArms.find((a: any) => a._id === armId);
    if (!arm) return "Unknown";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  const getSubjectName = (specific: any) => {
    const sub = allSubjects.find((s: any) => s._id === specific.subjectId);
    return sub?.subjectName || specific.subjectName || "Unknown Subject";
  };

  const handleCertUpload = async (i: number, file: File) => {
    updateQualification(i, "uploading", true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await SERVER.post("staff/upload-file", fd, { headers: { "Content-Type": "multipart/form-data" } });
      updateQualification(i, "certificateUrl", res?.data?.data?.url || "");
      updateQualification(i, "uploading", false);
      toast.success("Certificate uploaded!", toastOptions);
    } catch { updateQualification(i, "uploading", false); toast.error("Upload failed", toastOptions); }
  };

  // === PHOTO UPLOAD ===
  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      await SERVER.put(`staff/admin-update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Photo updated!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["staff-profile", id] });
      queryClient.invalidateQueries({ queryKey: ["all-staff"] });
    } catch (error: any) { toast.error(error?.response?.data?.error || "Upload failed", toastOptions); }
    finally { setUploadingPhoto(false); }
  };

  // === RESET PASSWORD ===
  const handleResetPassword = async () => {
    setResettingPassword(true);
    try {
      const res = await SERVER.put(`staff/reset-password/${id}`);
      const newPass = res?.data?.data?.newPassword;
      setNewPasswordResult(newPass || "Check email");
      toast.success(res?.data?.message || "Password reset!", toastOptions);
      setOpenResetPassword(false);
    } catch (error: any) { toast.error(error?.response?.data?.error || "Reset failed", toastOptions); }
    finally { setResettingPassword(false); }
  };

  // === SAVE PROFILE ===
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form, employmentDate: form.employmentDate || null,
        qualifications: qualifications.filter((q: any) => q.degree || q.institution)
          .map((q: any) => ({ degree: q.degree, fieldOfStudy: q.fieldOfStudy, institution: q.institution, yearGraduated: q.yearGraduated ? Number(q.yearGraduated) : null, certificateUrl: q.certificateUrl || null })),
      };
      await SERVER.put(`staff/admin-update/${id}`, payload);
      toast.success("Profile updated!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["staff-profile", id] });
      queryClient.invalidateQueries({ queryKey: ["all-staff"] });
      setEditing(false);
    } catch (error: any) { toast.error(error?.response?.data?.error || "Update failed", toastOptions); }
    finally { setSaving(false); }
  };

  // === ASSIGN CLASS TEACHER ===
  const handleAssignClass = async () => {
    if (!assignClassArmId) return;
    try {
      await SERVER.put(`class/${assignClassArmId}/teacher/assign/${id}`);
      toast.success(`Assigned as class teacher of ${getArmLabel(assignClassArmId)}`, toastOptions);
      queryClient.invalidateQueries({ queryKey: ["all-class-arms-assignments"] });
      setOpenAssignClass(false); setAssignClassArmId("");
    } catch (error: any) { toast.error(error?.response?.data?.error || "Assignment failed", toastOptions); }
  };

  // === UNASSIGN CLASS TEACHER ===
  const handleUnassignClass = async (armId: string) => {
    try {
      await SERVER.put(`class/${armId}/teacher/unassign`);
      toast.success(`Removed from ${getArmLabel(armId)}`, toastOptions);
      queryClient.invalidateQueries({ queryKey: ["all-class-arms-assignments"] });
    } catch (error: any) { toast.error(error?.response?.data?.error || "Failed", toastOptions); }
  };

  // === ADMIN ACTIONS ===
  const handleMakeAdmin = async () => {
    try { await SERVER.put(`staff/makeAdmin/${id}`); toast.success("Now an admin", toastOptions); queryClient.invalidateQueries({ queryKey: ["staff-profile", id] }); queryClient.invalidateQueries({ queryKey: ["all-staff"] }); setOpenMakeAdmin(false); } catch (error: any) { toast.error(error?.response?.data?.error || "Failed", toastOptions); }
  };
  const handleRemoveAdmin = async () => {
    try { await SERVER.put(`staff/removeAdmin/${id}`); toast.success("Admin removed", toastOptions); queryClient.invalidateQueries({ queryKey: ["staff-profile", id] }); queryClient.invalidateQueries({ queryKey: ["all-staff"] }); setOpenRemoveAdmin(false); } catch (error: any) { toast.error(error?.response?.data?.error || "Failed", toastOptions); }
  };
  const handleDeactivate = async () => {
    try { const isActive = staff?.isActive !== false; await SERVER.put(`staff/${isActive ? 'deactivate' : 'activate'}/${id}`); toast.success(isActive ? "Deactivated" : "Reactivated", toastOptions); queryClient.invalidateQueries({ queryKey: ["staff-profile", id] }); queryClient.invalidateQueries({ queryKey: ["all-staff"] }); setOpenDeactivate(false); } catch (error: any) { toast.error(error?.response?.data?.error || "Failed", toastOptions); }
  };

  const lgaOptions = form.country === "Nigeria" && form.stateOfOrigin && (statesData as any)[form.stateOfOrigin]
    ? (statesData as any)[form.stateOfOrigin].map((lga: any) => lga.value || lga.label || lga) : [];

  // Available class arms (not already assigned to this teacher)
  const availableClassArms = classArms.filter((arm: any) =>
    !assignedClasses.some((ac: any) => ac._id === arm._id)
  );

  if (isPending) return <Loader />;
  if (!staff) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">Staff member not found</p>
      <Button onClick={() => navigate("/staff-management")} variant="outlined" sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Back to Staff List</Button>
    </div>
  );

  const fullName = `${staff.title ? staff.title + " " : ""}${staff.firstName || ""} ${staff.surname || ""}`.trim();
  const isActive = staff.isActive !== false;

  return (
    <div className="max-w-[900px] mx-auto">
      <button onClick={() => navigate("/staff-management")} className="text-tertiary flex items-center gap-1 text-sm hover:underline mb-6">
        <KeyboardBackspace fontSize="small" /> Back to Staff List
      </button>

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with photo upload */}
          <div className="relative group">
            <Avatar sx={{ width: 80, height: 80, fontSize: 32 }} src={staff.profilePicture || ""}>
              {staff.firstName?.[0]}{staff.surname?.[0]}
            </Avatar>
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingPhoto ? (
                <span className="text-white text-xs">...</span>
              ) : (
                <CameraAlt sx={{ color: "white", fontSize: 24 }} />
              )}
              <input type="file" accept="image/*" className="hidden" disabled={uploadingPhoto}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
            </label>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-black">{fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {staff.staffID && <Chip label={staff.staffID} size="small" variant="outlined" />}
              <Chip label={staff.staffType || "staff"} size="small"
                sx={{ backgroundColor: staff.staffType === "academic" ? "#DBEAFE" : "#F3E8FF", color: staff.staffType === "academic" ? "#1D4ED8" : "#7C3AED" }} />
              {staff.isAdmin && <Chip label="Admin" size="small" sx={{ backgroundColor: "#FFEDD5", color: "#C2410C" }} />}
              <Chip label={isActive ? "Active" : "Deactivated"} size="small"
                sx={{ backgroundColor: isActive ? "#DCFCE7" : "#FEE2E2", color: isActive ? "#15803D" : "#B91C1C" }} />
            </div>
            {staff.emailAddress && <p className="text-sm text-gray-500 mt-1">{staff.emailAddress}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            {!editing ? (
              <>
                <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditing(true)}
                  sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Edit</Button>
                <Button variant="outlined" color="warning" startIcon={<Lock />}
                  onClick={() => setOpenResetPassword(true)}
                  sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Reset Password</Button>
                <Button variant="outlined" color={staff.isAdmin ? "error" : "warning"}
                  onClick={() => staff.isAdmin ? setOpenRemoveAdmin(true) : setOpenMakeAdmin(true)}
                  sx={{ borderRadius: "10px", textTransform: "capitalize" }}>
                  {staff.isAdmin ? "Remove Admin" : "Make Admin"}
                </Button>
                <Button variant="outlined" color={isActive ? "error" : "success"}
                  onClick={() => setOpenDeactivate(true)}
                  sx={{ borderRadius: "10px", textTransform: "capitalize" }}>
                  {isActive ? "Deactivate" : "Reactivate"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" startIcon={<Cancel />} onClick={() => setEditing(false)}
                  sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Cancel</Button>
                <Button variant="contained" color="tertiary" startIcon={<Save />} onClick={handleSave} disabled={saving}
                  sx={{ color: "white", borderRadius: "10px", textTransform: "capitalize" }}>
                  {saving ? "Saving..." : "Save Changes"}</Button>
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
        {activeTab === 0 && !editing && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1">
            <InfoRow label="Title" value={staff.title} />
            <InfoRow label="First Name" value={staff.firstName} />
            <InfoRow label="Surname" value={staff.surname} />
            <InfoRow label="Other Name" value={staff.otherName} />
            <InfoRow label="Gender" value={staff.gender} />
            <InfoRow label="Marital Status" value={staff.maritalStatus} />
            <InfoRow label="Religion" value={staff.religion} />
            <InfoRow label="Staff ID" value={staff.staffID} />
          </div>
        )}
        {activeTab === 0 && editing && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <FormControl fullWidth size="small"><InputLabel>Title</InputLabel>
                <Select value={form.title} label="Title" onChange={(e) => updateForm("title", e.target.value)} sx={{ borderRadius: "10px" }}>
                  {TITLES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</Select></FormControl>
              <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">First Name</label>
                <input value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Surname</label>
                <input value={form.surname} onChange={(e) => updateForm("surname", e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Other Name</label>
                <input value={form.otherName} onChange={(e) => updateForm("otherName", e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <FormControl fullWidth size="small"><InputLabel>Gender</InputLabel>
                <Select value={form.gender} label="Gender" onChange={(e) => updateForm("gender", e.target.value)} sx={{ borderRadius: "10px" }}>
                  <MenuItem value="male">Male</MenuItem><MenuItem value="female">Female</MenuItem></Select></FormControl>
              <FormControl fullWidth size="small"><InputLabel>Marital Status</InputLabel>
                <Select value={form.maritalStatus} label="Marital Status" onChange={(e) => updateForm("maritalStatus", e.target.value)} sx={{ borderRadius: "10px" }}>
                  <MenuItem value="single">Single</MenuItem><MenuItem value="married">Married</MenuItem>
                  <MenuItem value="divorced">Divorced</MenuItem><MenuItem value="widowed">Widowed</MenuItem></Select></FormControl>
            </div>
            <FormControl fullWidth size="small" sx={{ maxWidth: 300 }}><InputLabel>Religion</InputLabel>
              <Select value={form.religion} label="Religion" onChange={(e) => updateForm("religion", e.target.value)} sx={{ borderRadius: "10px" }}>
                {RELIGIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}</Select></FormControl>
          </div>
        )}

        {/* Tab 1: Contact */}
        {activeTab === 1 && !editing && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1">
            <InfoRow label="Email" value={staff.emailAddress} />
            <InfoRow label="Phone" value={staff.phoneNumber} />
            <InfoRow label="Country" value={staff.country} />
            <InfoRow label="State" value={staff.stateOfOrigin} />
            <InfoRow label="LGA" value={staff.localGovernmentArea} />
            <InfoRow label="Home Address" value={staff.homeAddress} />
          </div>
        )}
        {activeTab === 1 && editing && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Email</label>
                <input value={form.emailAddress} onChange={(e) => updateForm("emailAddress", e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Phone</label>
                <input value={form.phoneNumber} onChange={(e) => updateForm("phoneNumber", e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormControl fullWidth size="small"><InputLabel>Country</InputLabel>
                <Select value={form.country} label="Country" onChange={(e) => { updateForm("country", e.target.value); updateForm("stateOfOrigin", ""); updateForm("localGovernmentArea", ""); }} sx={{ borderRadius: "10px" }}>
                  {COUNTRIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl>
              <FormControl fullWidth size="small"><InputLabel>State</InputLabel>
                <Select value={form.stateOfOrigin} label="State" onChange={(e) => { updateForm("stateOfOrigin", e.target.value); updateForm("localGovernmentArea", ""); }} sx={{ borderRadius: "10px" }}>
                  {form.country === "Nigeria" ? Object.keys(statesData).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>) : <MenuItem value="">-</MenuItem>}</Select></FormControl>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormControl fullWidth size="small"><InputLabel>LGA</InputLabel>
                <Select value={form.localGovernmentArea} label="LGA" onChange={(e) => updateForm("localGovernmentArea", e.target.value)} disabled={!form.stateOfOrigin} sx={{ borderRadius: "10px" }}>
                  {lgaOptions.map((l: string) => <MenuItem key={l} value={l}>{l}</MenuItem>)}</Select></FormControl>
              <div />
            </div>
            <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Home Address</label>
              <textarea value={form.homeAddress} onChange={(e) => updateForm("homeAddress", e.target.value)} rows={2} className="border border-gray-300 rounded-lg p-2 text-sm resize-none" /></div>
          </div>
        )}

        {/* Tab 2: Employment & Qualifications */}
        {activeTab === 2 && !editing && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1 mb-6">
              <InfoRow label="Staff Type" value={staff.staffType} />
              <InfoRow label="Salary" value={staff.salary ? `₦${Number(staff.salary).toLocaleString()}` : "—"} />
              <InfoRow label="Employment Date" value={staff.employmentDate ? new Date(staff.employmentDate).toLocaleDateString() : "—"} />
              <InfoRow label="Admin" value={staff.isAdmin ? "Yes" : "No"} />
            </div>
            <h3 className="font-semibold text-black mb-3">Qualifications</h3>
            {staff.qualifications?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {staff.qualifications.map((q: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1">
                      <InfoRow label="Degree" value={q.degree} />
                      <InfoRow label="Field" value={q.fieldOfStudy} />
                      <InfoRow label="Institution" value={q.institution} />
                      <InfoRow label="Year" value={q.yearGraduated} />
                    </div>
                    {q.certificateUrl && (
                      <a href={q.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-tertiary hover:underline mt-2">
                        <OpenInNew fontSize="small" /> View Certificate</a>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No qualifications recorded</p>}
          </div>
        )}
        {activeTab === 2 && editing && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <FormControl fullWidth size="small"><InputLabel>Staff Type</InputLabel>
                <Select value={form.staffType} label="Staff Type" onChange={(e) => updateForm("staffType", e.target.value)} sx={{ borderRadius: "10px" }}>
                  <MenuItem value="academic">Academic</MenuItem><MenuItem value="non-academic">Non-Academic</MenuItem></Select></FormControl>
              <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Salary</label>
                <input value={form.salary} onChange={(e) => updateForm("salary", e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Employment Date</label>
                <input type="date" value={form.employmentDate} onChange={(e) => updateForm("employmentDate", e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
            <div className="flex items-center justify-between mt-4 mb-2">
              <h3 className="font-semibold text-black">Qualifications</h3>
              <Button type="button" variant="text" size="small" startIcon={<Add />} onClick={addQualification} sx={{ textTransform: "capitalize", color: "#0E7094" }}>Add</Button>
            </div>
            {qualifications.map((q: any, i: number) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 relative">
                {qualifications.length > 1 && <IconButton size="small" onClick={() => removeQualification(i)} sx={{ position: "absolute", top: 8, right: 8 }}><Delete fontSize="small" color="error" /></IconButton>}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <FormControl fullWidth size="small"><InputLabel>Degree</InputLabel>
                    <Select value={q.degree || ""} label="Degree" onChange={(e) => updateQualification(i, "degree", e.target.value)} sx={{ borderRadius: "10px" }}>
                      {DEGREE_OPTIONS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}</Select></FormControl>
                  <input value={q.fieldOfStudy || ""} onChange={(e) => updateQualification(i, "fieldOfStudy", e.target.value)} placeholder="Field of Study" className="border border-gray-300 rounded-lg p-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input value={q.institution || ""} onChange={(e) => updateQualification(i, "institution", e.target.value)} placeholder="Institution" className="border border-gray-300 rounded-lg p-2 text-sm" />
                  <input type="number" value={q.yearGraduated || ""} onChange={(e) => updateQualification(i, "yearGraduated", e.target.value)} placeholder="Year" className="border border-gray-300 rounded-lg p-2 text-sm" />
                </div>
                {q.certificateUrl ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <CheckCircle fontSize="small" className="text-green-600" />
                    <a href={q.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 hover:underline flex-1 truncate">Certificate</a>
                    <button type="button" onClick={() => updateQualification(i, "certificateUrl", "")} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100">
                    <UploadFile fontSize="small" className="text-gray-500" />
                    <span className="text-xs text-gray-600">{q.uploading ? "Uploading..." : "Upload certificate (optional)"}</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" disabled={q.uploading}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCertUpload(i, f); }} />
                  </label>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Assignments */}
        {activeTab === 3 && (
          <div className="flex flex-col gap-6">
            {/* Assigned Classes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-black flex items-center gap-2"><School fontSize="small" /> Assigned Classes</h3>
                {staff.staffType === "academic" && (
                  <Button type="button" variant="outlined" color="tertiary" size="small" startIcon={<Add />}
                    onClick={() => setOpenAssignClass(true)} sx={{ borderRadius: "8px", textTransform: "capitalize" }}>Assign Class</Button>
                )}
              </div>
              {assignedClasses.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">Not assigned as class teacher to any class</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {assignedClasses.map((arm: any) => (
                    <div key={arm._id} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                      <span className="text-sm font-medium text-blue-900">{getArmLabel(arm._id)}</span>
                      <Button type="button" variant="text" color="error" size="small" onClick={() => handleUnassignClass(arm._id)}
                        sx={{ textTransform: "capitalize" }}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assigned Subjects */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-black flex items-center gap-2"><Assignment fontSize="small" /> Assigned Subjects</h3>
                <p className="text-xs text-gray-500">Manage subject assignments from Academics → Subject Details</p>
              </div>
              {assignedSubjects.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">Not assigned to teach any subjects</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {assignedSubjects.map((sp: any) => (
                    <div key={sp._id} className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                      <div>
                        <span className="text-sm font-medium text-purple-900">{getSubjectName(sp)}</span>
                        <span className="text-xs text-purple-600 ml-2">({getArmLabel(sp.classArmId)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Next of Kin */}
        {activeTab === 4 && !editing && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1">
            <InfoRow label="First Name" value={staff.nextOfKinFirstName} />
            <InfoRow label="Surname" value={staff.nextOfKinSurname} />
            <InfoRow label="Phone" value={staff.nextOfKinPhoneNumber} />
            <InfoRow label="Relationship" value={staff.nextOfKinRelationship} />
          </div>
        )}
        {activeTab === 4 && editing && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">First Name</label>
                <input value={form.nextOfKinFirstName} onChange={(e) => updateForm("nextOfKinFirstName", e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Surname</label>
                <input value={form.nextOfKinSurname} onChange={(e) => updateForm("nextOfKinSurname", e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Phone</label>
                <input value={form.nextOfKinPhoneNumber} onChange={(e) => updateForm("nextOfKinPhoneNumber", e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm" /></div>
              <FormControl fullWidth size="small"><InputLabel>Relationship</InputLabel>
                <Select value={form.nextOfKinRelationship} label="Relationship" onChange={(e) => updateForm("nextOfKinRelationship", e.target.value)} sx={{ borderRadius: "10px" }}>
                  {RELATIONSHIPS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}</Select></FormControl>
            </div>
          </div>
        )}
      </div>

      {/* === MODALS === */}

      {/* Reset Password Confirmation */}
      <MessageModal column desc={`Reset the password for ${fullName}? A new password will be generated and sent to ${staff.emailAddress}.`}
        openModal={openResetPassword} closeModal={() => setOpenResetPassword(false)} handleClick={handleResetPassword}
        btn1Name={resettingPassword ? "Resetting..." : "Yes, reset password"} btn2Name="Cancel" />

      {/* New Password Display */}
      <Modal openModal={!!newPasswordResult} closeModal={() => setNewPasswordResult(null)} title="Password Reset Successful" maxWidth="400px">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-gray-600">The new password has been sent to the staff's email. If email delivery failed, share it manually:</p>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-2xl font-mono font-bold text-black tracking-wider">{newPasswordResult}</p>
          </div>
          <p className="text-xs text-gray-500">The staff should change this password after logging in.</p>
          <Button variant="contained" color="tertiary" onClick={() => setNewPasswordResult(null)}
            sx={{ color: "white", borderRadius: "10px", textTransform: "capitalize" }}>Done</Button>
        </div>
      </Modal>

      {/* Assign Class Modal */}
      <Modal openModal={openAssignClass} closeModal={() => { setOpenAssignClass(false); setAssignClassArmId(""); }} title="Assign as Class Teacher" maxWidth="400px">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">Select a class to assign {staff.firstName} as class teacher:</p>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={assignClassArmId} label="Class" onChange={(e) => setAssignClassArmId(e.target.value)} sx={{ borderRadius: "10px" }}>
              {availableClassArms.map((arm: any) => (
                <MenuItem key={arm._id} value={arm._id}>{getArmLabel(arm._id)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="flex gap-3 justify-end">
            <Button variant="outlined" onClick={() => { setOpenAssignClass(false); setAssignClassArmId(""); }}
              sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Cancel</Button>
            <Button variant="contained" color="tertiary" onClick={handleAssignClass} disabled={!assignClassArmId}
              sx={{ color: "white", borderRadius: "10px", textTransform: "capitalize" }}>Assign</Button>
          </div>
        </div>
      </Modal>

      <MessageModal column desc={`Give ${fullName} admin privileges?`}
        openModal={openMakeAdmin} closeModal={() => setOpenMakeAdmin(false)} handleClick={handleMakeAdmin} btn1Name="Yes" btn2Name="Cancel" />
      <MessageModal column desc={`Remove admin privileges from ${fullName}?`}
        openModal={openRemoveAdmin} closeModal={() => setOpenRemoveAdmin(false)} handleClick={handleRemoveAdmin} btn1Name="Yes" btn2Name="Cancel" />
      <MessageModal column desc={isActive ? `Deactivate ${fullName}?` : `Reactivate ${fullName}?`}
        openModal={openDeactivate} closeModal={() => setOpenDeactivate(false)} handleClick={handleDeactivate}
        btn1Name={isActive ? "Deactivate" : "Reactivate"} btn2Name="Cancel" />
    </div>
  );
}