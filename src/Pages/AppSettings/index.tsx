import { useState, useEffect } from "react";
import { Button, Avatar, IconButton, Switch, FormControlLabel } from "@mui/material";
import { Edit, Save, Cancel, CameraAlt, Visibility, VisibilityOff, Add, Delete } from "@mui/icons-material";
import SERVER from "../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../Utils/toastOptions";
import Loader from "../loaders/Loader";
import { useSessionTerm } from "../../services/api-call";

const TABS = ["My Profile", "School Details", "Academic Settings", "Fees & IDs", "Notifications", "Change Password"];

export default function Settings() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="max-w-[800px]">
      <h1 className="text-2xl font-bold text-black mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your profile, school, and system preferences</p>

      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`px-5 py-3 text-sm font-medium relative whitespace-nowrap ${
                activeTab === i ? "text-tertiary" : "text-gray-500 hover:text-gray-700"
              }`}>
              {tab}
              {activeTab === i && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary" />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: activeTab === 0 ? "block" : "none" }}><MyProfileTab /></div>
      <div style={{ display: activeTab === 1 ? "block" : "none" }}><SchoolDetailsTab /></div>
      <div style={{ display: activeTab === 2 ? "block" : "none" }}><AcademicSettingsTab /></div>
      <div style={{ display: activeTab === 3 ? "block" : "none" }}><FeesAndIdsTab /></div>
      <div style={{ display: activeTab === 4 ? "block" : "none" }}><NotificationsTab /></div>
      <div style={{ display: activeTab === 5 ? "block" : "none" }}><ChangePasswordTab /></div>
    </div>
  );
}

// ============================================================
// MY PROFILE TAB
// ============================================================
function MyProfileTab() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { data: profileData, isPending } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => { const res = await SERVER.get("superadmin/profile"); return res?.data; },
    retry: false,
  });
  const profile = profileData?.data;

  useEffect(() => {
    if (profile) {
      const names = (profile.fullName || "").split(" ");
      setFirstName(names[0] || ""); setLastName(names.slice(1).join(" ") || "");
      setEmail(profile.emailAddress || ""); setPhone(profile.phoneNumber || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await SERVER.put("superadmin/update", { firstName, lastName, emailAddress: email, phoneNumber: phone });
      toast.success("Profile updated!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      setEditing(false);
    } catch (error: any) { toast.error(error?.response?.data?.error || "Update failed", toastOptions); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      await SERVER.post("superadmin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Photo updated!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    } catch (error: any) { toast.error(error?.response?.data?.error || "Upload failed", toastOptions); }
    finally { setUploadingPhoto(false); }
  };

  if (isPending) return <Loader />;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-black">My Profile</h2>
        {!editing ? (
          <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditing(true)} sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Edit</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outlined" startIcon={<Cancel />} onClick={() => setEditing(false)} sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Cancel</Button>
            <Button variant="contained" color="tertiary" startIcon={<Save />} onClick={handleSave} disabled={saving} sx={{ color: "white", borderRadius: "10px", textTransform: "capitalize" }}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-5 mb-8">
        <div className="relative group">
          <Avatar sx={{ width: 80, height: 80, fontSize: 28 }} src={profile?.photo || ""}>{firstName?.[0]}{lastName?.[0]}</Avatar>
          <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            {uploadingPhoto ? <span className="text-white text-xs">...</span> : <CameraAlt sx={{ color: "white", fontSize: 24 }} />}
            <input type="file" accept="image/*" className="hidden" disabled={uploadingPhoto} onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
          </label>
        </div>
        <div>
          <p className="text-lg font-semibold text-black">{profile?.fullName || "—"}</p>
          <p className="text-sm text-gray-500">Super Admin</p>
          <p className="text-xs text-gray-400 mt-1">Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[["First Name", firstName, setFirstName], ["Last Name", lastName, setLastName], ["Email Address", email, setEmail], ["Phone Number", phone, setPhone]].map(([label, val, setter]: any) => (
          <div key={label} className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">{label}</label>
            {editing ? <input value={val} onChange={(e) => setter(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm" />
              : <p className="text-sm font-medium text-black py-2.5">{val || "—"}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SCHOOL DETAILS TAB (+ Registration Control)
// ============================================================
function SchoolDetailsTab() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolInitials, setSchoolInitials] = useState("");
  const [schoolMotto, setSchoolMotto] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Nigeria");

  const session = useSessionTerm();
  const activeSession = session?.data?.data?.data?.session;
  const activeTerm = session?.data?.data?.data?.term;

  const { data: profileData, isPending } = useQuery({ queryKey: ["admin-profile"], queryFn: async () => { const res = await SERVER.get("superadmin/profile"); return res?.data; }, retry: false });
  const { data: settingsData } = useQuery({ queryKey: ["school-settings"], queryFn: async () => { const res = await SERVER.get("settings"); return res?.data; }, retry: false });
  const profile = profileData?.data;
  const settings = settingsData?.data;

  useEffect(() => {
    if (profile) {
      setSchoolName(profile.schoolName || "");
      setSchoolMotto(profile.schoolMotto || "");
      setSchoolEmail(profile.schoolEmailAddress || "");
      setSchoolInitials(profile.schoolInitials || "");
      setStreet(profile.schoolAddress?.street || "");
      setCity(profile.schoolAddress?.city || "");
      setState(profile.schoolAddress?.state || "");
      setCountry(profile.schoolAddress?.country || "Nigeria");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { schoolName };
      if (schoolMotto) payload.schoolMotto = schoolMotto;
      if (schoolInitials) payload.schoolInitials = schoolInitials;
      if (schoolEmail) payload.schoolEmailAddress = schoolEmail;
      payload.schoolAddress = { street, city, state, country };
      await SERVER.put("superadmin/update", payload);
      toast.success("School details updated!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      setEditing(false);
    } catch (error: any) { toast.error(error?.response?.data?.error || "Update failed", toastOptions); }
    finally { setSaving(false); }
  };

  const handleToggleRegistration = async () => {
    try {
      const isOpen = settings?.registrationOpen !== false;
      await SERVER.put("settings", { registrationOpen: !isOpen });
      toast.success(isOpen ? "Registration closed" : "Registration opened", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["school-settings"] });
    } catch (error: any) { toast.error(error?.response?.data?.error || "Failed", toastOptions); }
  };

  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-black">School Information</h2>
          {!editing ? <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditing(true)} sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Edit</Button>
            : <div className="flex gap-2">
                <Button variant="outlined" startIcon={<Cancel />} onClick={() => setEditing(false)} sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Cancel</Button>
                <Button variant="contained" color="tertiary" startIcon={<Save />} onClick={handleSave} disabled={saving} sx={{ color: "white", borderRadius: "10px", textTransform: "capitalize" }}>{saving ? "Saving..." : "Save"}</Button>
              </div>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            ["School Name", schoolName, setSchoolName],
            ["School Initials", schoolInitials, setSchoolInitials],
            ["School Motto", schoolMotto, setSchoolMotto],
            ["School Email", schoolEmail, setSchoolEmail],
          ].map(([label, val, setter]: any) => (
            <div key={label} className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">{label}</label>
              {editing ? <input value={val} onChange={(e) => setter(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm" />
                : <p className="text-sm font-medium text-black py-2.5">{val || "—"}</p>}
            </div>
          ))}
        </div>
        <h3 className="font-semibold text-black mt-6 mb-4">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            ["Street", street, setStreet],
            ["City", city, setCity],
            ["State", state, setState],
            ["Country", country, setCountry],
          ].map(([label, val, setter]: any) => (
            <div key={label} className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">{label}</label>
              {editing ? <input value={val} onChange={(e) => setter(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm" />
                : <p className="text-sm font-medium text-black py-2.5">{val || "—"}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Registration Control</h2>
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div>
            <p className="text-sm font-medium text-black">Student Registration</p>
            <p className="text-xs text-gray-500 mt-1">When closed, new students cannot be registered.</p>
          </div>
          <FormControlLabel control={<Switch checked={settings?.registrationOpen !== false} onChange={handleToggleRegistration} color="success" />}
            label={settings?.registrationOpen !== false ? "Open" : "Closed"} labelPlacement="start" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Current Session</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Session</label><p className="text-sm font-medium py-2.5">{activeSession?.sessionName || "No active session"}</p></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Current Term</label><p className="text-sm font-medium py-2.5">{activeTerm?.termName || "No active term"}</p></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Term Period</label><p className="text-sm font-medium py-2.5">{activeTerm?.termStartDate && activeTerm?.termEndDate ? `${new Date(activeTerm.termStartDate).toLocaleDateString()} — ${new Date(activeTerm.termEndDate).toLocaleDateString()}` : "—"}</p></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ACADEMIC SETTINGS TAB (Grading Scale + Timetable link)
// ============================================================
function AcademicSettingsTab() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: settingsData, isPending } = useQuery({ queryKey: ["school-settings"], queryFn: async () => { const res = await SERVER.get("settings"); return res?.data; }, retry: false });
  const [grades, setGrades] = useState<any[]>([]);

  // Timetable settings
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("14:00");
  const [periodDuration, setPeriodDuration] = useState(40);
  const [breaks, setBreaks] = useState<any[]>([]);
  const [savingTimetable, setSavingTimetable] = useState(false);

  const { data: periodData } = useQuery({ queryKey: ["period-settings"], queryFn: async () => { const res = await SERVER.get("timetable-grid/settings"); return res?.data; }, retry: false });

  useEffect(() => {
    if (settingsData?.data?.gradingScale) setGrades(settingsData.data.gradingScale);
  }, [settingsData]);

  useEffect(() => {
    const s = periodData?.data;
    if (s) { setStartTime(s.startTime || "08:00"); setEndTime(s.endTime || "14:00"); setPeriodDuration(s.periodDuration || 40); setBreaks(s.breaks || []); }
  }, [periodData]);

  const updateGrade = (i: number, field: string, value: any) => {
    const updated = [...grades]; updated[i] = { ...updated[i], [field]: field.includes("Score") ? Number(value) : value }; setGrades(updated);
  };
  const addGrade = () => setGrades([...grades, { grade: "", minScore: 0, maxScore: 0, remark: "" }]);
  const removeGrade = (i: number) => setGrades(grades.filter((_, idx) => idx !== i));

  const handleSaveGrading = async () => {
    setSaving(true);
    try {
      await SERVER.put("settings", { gradingScale: grades });
      toast.success("Grading scale saved!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["school-settings"] });
    } catch (error: any) { toast.error(error?.response?.data?.error || "Failed", toastOptions); }
    finally { setSaving(false); }
  };

  const handleSaveTimetable = async () => {
    setSavingTimetable(true);
    try {
      await SERVER.put("timetable-grid/settings", { startTime, endTime, periodDuration, breaks });
      toast.success("Timetable settings saved!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["period-settings"] });
    } catch (error: any) { toast.error(error?.response?.data?.error || "Failed", toastOptions); }
    finally { setSavingTimetable(false); }
  };

  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      {/* Grading Scale */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-black">Grading Scale</h2>
            <p className="text-xs text-gray-500 mt-1">Define what score ranges map to each grade</p>
          </div>
          <div className="flex gap-2">
            <Button variant="text" size="small" startIcon={<Add />} onClick={addGrade} sx={{ textTransform: "capitalize", color: "#0E7094" }}>Add Grade</Button>
            <Button variant="contained" color="tertiary" size="small" startIcon={<Save />} onClick={handleSaveGrading} disabled={saving}
              sx={{ color: "white", borderRadius: "8px", textTransform: "capitalize" }}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 grid grid-cols-[60px_1fr_1fr_1fr_40px] gap-3 text-xs font-semibold text-gray-600">
            <span>Grade</span><span>Min Score</span><span>Max Score</span><span>Remark</span><span></span>
          </div>
          {grades.map((g: any, i: number) => (
            <div key={i} className="px-4 py-2 grid grid-cols-[60px_1fr_1fr_1fr_40px] gap-3 border-t border-gray-100 items-center">
              <input value={g.grade || ""} onChange={(e) => updateGrade(i, "grade", e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm text-center w-full" maxLength={2} />
              <input type="number" value={g.minScore ?? ""} onChange={(e) => updateGrade(i, "minScore", e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm w-full" />
              <input type="number" value={g.maxScore ?? ""} onChange={(e) => updateGrade(i, "maxScore", e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm w-full" />
              <input value={g.remark || ""} onChange={(e) => updateGrade(i, "remark", e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm w-full" placeholder="e.g. Excellent" />
              <IconButton size="small" onClick={() => removeGrade(i)}><Delete fontSize="small" color="error" /></IconButton>
            </div>
          ))}
        </div>
      </div>

      {/* Timetable Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-black">Timetable Settings</h2>
            <p className="text-xs text-gray-500 mt-1">Configure school hours, period duration, and breaks</p>
          </div>
          <Button variant="contained" color="tertiary" size="small" startIcon={<Save />} onClick={handleSaveTimetable} disabled={savingTimetable}
            sx={{ color: "white", borderRadius: "8px", textTransform: "capitalize" }}>{savingTimetable ? "Saving..." : "Save"}</Button>
        </div>
        <div className="flex flex-wrap gap-6 mb-6">
          <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 w-40" /></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 w-40" /></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Period Duration</label>
            <select value={periodDuration} onChange={(e) => setPeriodDuration(Number(e.target.value))} className="border border-gray-300 rounded-lg p-2.5 w-40">
              {[30, 35, 40, 45, 50, 60, 90].map(d => <option key={d} value={d}>{d} minutes</option>)}
            </select></div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm text-black">Breaks</p>
          <Button variant="text" size="small" startIcon={<Add />} onClick={() => setBreaks([...breaks, { name: "Break", startTime: "10:00", endTime: "10:30" }])}
            sx={{ textTransform: "capitalize", color: "#0E7094" }}>Add Break</Button>
        </div>
        {breaks.length === 0 ? <p className="text-sm text-gray-400 py-2">No breaks configured</p> : (
          <div className="flex flex-col gap-2">
            {breaks.map((b: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2">
                <input value={b.name} onChange={(e) => { const u = [...breaks]; u[i].name = e.target.value; setBreaks(u); }} placeholder="Name" className="border border-gray-300 rounded p-1.5 text-sm flex-1" />
                <input type="time" value={b.startTime} onChange={(e) => { const u = [...breaks]; u[i].startTime = e.target.value; setBreaks(u); }} className="border border-gray-300 rounded p-1.5 text-sm w-32" />
                <span className="text-gray-400">to</span>
                <input type="time" value={b.endTime} onChange={(e) => { const u = [...breaks]; u[i].endTime = e.target.value; setBreaks(u); }} className="border border-gray-300 rounded p-1.5 text-sm w-32" />
                <IconButton size="small" onClick={() => setBreaks(breaks.filter((_, idx) => idx !== i))}><Delete fontSize="small" color="error" /></IconButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// FEES & IDS TAB
// ============================================================
function FeesAndIdsTab() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState("NGN");
  const [platformFee, setPlatformFee] = useState("2000");
  const [platformFeeDesc, setPlatformFeeDesc] = useState("Platform Fee (Basitech)");
  const [studentPrefix, setStudentPrefix] = useState("");
  const [staffPrefix, setStaffPrefix] = useState("");

  const { data: settingsData, isPending } = useQuery({ queryKey: ["school-settings"], queryFn: async () => { const res = await SERVER.get("settings"); return res?.data; }, retry: false });

  useEffect(() => {
    const s = settingsData?.data;
    if (s) {
      setCurrency(s.feeDefaults?.currency || "NGN");
      setPlatformFee(String(s.feeDefaults?.platformFeeAmount ?? "2000"));
      setPlatformFeeDesc(s.feeDefaults?.platformFeeDescription || "Platform Fee (Basitech)");
      setStudentPrefix(s.studentIdPrefix || "");
      setStaffPrefix(s.staffIdPrefix || "");
    }
  }, [settingsData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await SERVER.put("settings", {
        feeDefaults: { currency, platformFeeAmount: Number(platformFee), platformFeeDescription: platformFeeDesc },
        studentIdPrefix: studentPrefix,
        staffIdPrefix: staffPrefix,
      });
      toast.success("Settings saved!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["school-settings"] });
    } catch (error: any) { toast.error(error?.response?.data?.error || "Failed", toastOptions); }
    finally { setSaving(false); }
  };

  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      {/* Fee Defaults */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-black">Fee Defaults</h2>
            <p className="text-xs text-gray-500 mt-1">Default currency and platform fee for all fee breakdowns</p>
          </div>
          <Button variant="contained" color="tertiary" size="small" startIcon={<Save />} onClick={handleSave} disabled={saving}
            sx={{ color: "white", borderRadius: "8px", textTransform: "capitalize" }}>{saving ? "Saving..." : "Save All"}</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Default Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm">
              <option value="NGN">Naira (₦)</option><option value="USD">Dollar ($)</option><option value="GBP">Pounds (£)</option>
            </select></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Platform Fee Amount</label>
            <input type="number" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm" /></div>
          <div className="flex flex-col"><label className="text-xs text-gray-500 mb-1">Platform Fee Description</label>
            <input value={platformFeeDesc} onChange={(e) => setPlatformFeeDesc(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm" /></div>
        </div>
      </div>

      {/* ID Format */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-black mb-2">ID Format</h2>
        <p className="text-xs text-gray-500 mb-4">Set the prefix for auto-generated student and staff IDs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Student ID Prefix</label>
            <input value={studentPrefix} onChange={(e) => setStudentPrefix(e.target.value.toUpperCase())} placeholder="e.g. QM" maxLength={5} className="border border-gray-300 rounded-lg p-2.5 text-sm" />
            <p className="text-xs text-gray-400 mt-1">Preview: {studentPrefix || "QM"}/1234</p>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Staff ID Prefix</label>
            <input value={staffPrefix} onChange={(e) => setStaffPrefix(e.target.value.toUpperCase())} placeholder="e.g. QM" maxLength={5} className="border border-gray-300 rounded-lg p-2.5 text-sm" />
            <p className="text-xs text-gray-400 mt-1">Preview: {staffPrefix || "QM"}/S1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// NOTIFICATIONS TAB
// ============================================================
function NotificationsTab() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState({
    emailOnStudentRegistration: true,
    emailOnFeePayment: true,
    emailOnStaffAdded: true,
    emailOnAttendanceMarked: false,
    emailOnPasswordReset: true,
  });

  const { data: settingsData, isPending } = useQuery({ queryKey: ["school-settings"], queryFn: async () => { const res = await SERVER.get("settings"); return res?.data; }, retry: false });

  useEffect(() => {
    if (settingsData?.data?.notifications) setNotifs({ ...notifs, ...settingsData.data.notifications });
  }, [settingsData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await SERVER.put("settings", { notifications: notifs });
      toast.success("Notification preferences saved!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["school-settings"] });
    } catch (error: any) { toast.error(error?.response?.data?.error || "Failed", toastOptions); }
    finally { setSaving(false); }
  };

  if (isPending) return <Loader />;

  const NOTIFICATION_OPTIONS = [
    { key: "emailOnStudentRegistration", label: "Student Registration", desc: "Send email when a new student is registered" },
    { key: "emailOnFeePayment", label: "Fee Payment", desc: "Send email when a fee payment is recorded" },
    { key: "emailOnStaffAdded", label: "Staff Added", desc: "Send email when a new staff member is created" },
    { key: "emailOnAttendanceMarked", label: "Attendance Marked", desc: "Send email when daily attendance is saved" },
    { key: "emailOnPasswordReset", label: "Password Reset", desc: "Send email when a password is reset" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-black">Email Notifications</h2>
          <p className="text-xs text-gray-500 mt-1">Choose which events trigger email notifications</p>
        </div>
        <Button variant="contained" color="tertiary" size="small" startIcon={<Save />} onClick={handleSave} disabled={saving}
          sx={{ color: "white", borderRadius: "8px", textTransform: "capitalize" }}>{saving ? "Saving..." : "Save"}</Button>
      </div>
      <div className="flex flex-col gap-1">
        {NOTIFICATION_OPTIONS.map((opt) => (
          <div key={opt.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-black">{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </div>
            <Switch checked={(notifs as any)[opt.key]} onChange={(e) => setNotifs({ ...notifs, [opt.key]: e.target.checked })} color="success" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CHANGE PASSWORD TAB
// ============================================================
function ChangePasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error("Fill all fields", toastOptions); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match", toastOptions); return; }
    if (newPassword.length < 6) { toast.error("Min 6 characters", toastOptions); return; }
    if (currentPassword === newPassword) { toast.error("New password must be different", toastOptions); return; }
    setSaving(true);
    try {
      await SERVER.put("superadmin/updatepassword", { currentPassword, newPassword });
      toast.success("Password changed!", toastOptions);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error: any) { toast.error(error?.response?.data?.error || "Failed", toastOptions); }
    finally { setSaving(false); }
  };

  const PwdField = ({ label, value, onChange, show, toggle }: any) => (
    <div className="flex flex-col">
      <label className="text-xs text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="••••••••" className="border border-gray-300 rounded-lg p-2.5 text-sm w-full pr-10" />
        <IconButton size="small" onClick={toggle} sx={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)" }}>
          {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
        </IconButton>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-[500px]">
      <h2 className="text-lg font-semibold text-black mb-2">Change Password</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your current password and choose a new one.</p>
      <div className="flex flex-col gap-5">
        <PwdField label="Current Password" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} toggle={() => setShowCurrent(!showCurrent)} />
        <PwdField label="New Password" value={newPassword} onChange={setNewPassword} show={showNew} toggle={() => setShowNew(!showNew)} />
        <PwdField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
        {newPassword && confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-600">Passwords don't match</p>}
        {newPassword && newPassword.length < 6 && <p className="text-xs text-orange-600">Min 6 characters</p>}
        <Button variant="contained" color="tertiary" onClick={handleChangePassword}
          disabled={saving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          sx={{ color: "white", borderRadius: "10px", paddingY: "10px", textTransform: "capitalize", width: "fit-content" }}>
          {saving ? "Changing..." : "Change Password"}</Button>
      </div>
    </div>
  );
}