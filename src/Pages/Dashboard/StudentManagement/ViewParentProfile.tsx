import { useState, useEffect } from "react";
import { Button, Avatar, Chip } from "@mui/material";
import { KeyboardBackspace, Edit, Save, Cancel } from "@mui/icons-material";
import SERVER from "../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClassArms, useClassLevels } from "../../../services/api-call";
import { toast } from "react-toastify";
import { toastOptions } from "../../../Utils/toastOptions";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../loaders/Loader";
import { statesData } from "../../../Data/statesData";

const COUNTRIES = ['Nigeria', 'Ghana', 'Cameroon', 'Togo', 'Benin', 'South Africa', 'Kenya', 'United Kingdom', 'United States', 'Canada', 'India', 'Other'];
const TITLES = ['Mr', 'Mrs', 'Miss', 'Dr', 'Prof'];
const OCCUPATIONS = ['Civil Servant', 'Business Owner', 'Teacher', 'Doctor', 'Lawyer', 'Engineer', 'Farmer', 'Trader', 'Other'];

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col py-2">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm text-black font-medium">{value || "—"}</p>
  </div>
);

export default function ViewParentProfile() {
  const { id: parentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const classArms = allArms?.data?.data?.data || [];
  const classLevels = allLevels?.data?.data?.data || [];

  // Fetch all parents
  const { data: parentsData, isPending } = useQuery({
    queryKey: ["all-parents"],
    queryFn: async () => { const res = await SERVER.get("parent"); return res?.data; },
    retry: false,
  });
  const parent = parentsData?.data?.find((p: any) => p._id === parentId);

  // Fetch all students to find linked ones
  const { data: studentsData } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () => { const res = await SERVER.get("student"); return res?.data; },
    retry: false,
  });
  const allStudents = studentsData?.data || [];
  const linkedStudents = allStudents.filter((s: any) =>
    s.guardians?.some((g: any) => g.parentId === parentId)
  );

  useEffect(() => {
    if (parent && editing) {
      setForm({
        title: parent.title || "",
        firstName: parent.firstName || "",
        surName: parent.surName || "",
        email: parent.email || "",
        phoneNumber: parent.phoneNumber || "",
        occupation: parent.occupation || "",
        country: parent.country || "Nigeria",
        stateOfOrigin: parent.stateOfOrigin || "",
        localGovernmentArea: parent.localGovernmentArea || "",
        street: parent.address?.street || "",
        city: parent.address?.city || "",
        state: parent.address?.state || "",
      });
    }
  }, [parent, editing]);

  const getArmLabel = (armId: string) => {
    const arm = classArms.find((a: any) => a._id === armId);
    if (!arm) return "";
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ""} ${arm.armName?.toUpperCase() || ""}`.trim();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await SERVER.put(`parent/${parentId}`, {
        title: form.title,
        firstName: form.firstName,
        surName: form.surName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        occupation: form.occupation,
        country: form.country,
        stateOfOrigin: form.stateOfOrigin,
        localGovernmentArea: form.localGovernmentArea,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
        },
      });
      toast.success("Parent profile updated!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["all-parents"] });
      setEditing(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Update failed", toastOptions);
    } finally { setSaving(false); }
  };

  const lgaOptions = form.country === "Nigeria" && form.stateOfOrigin && (statesData as any)[form.stateOfOrigin]
    ? (statesData as any)[form.stateOfOrigin].map((lga: any) => lga.value || lga.label || lga) : [];

  if (isPending) return <Loader />;
  if (!parent) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">Parent not found</p>
      <Button onClick={() => navigate("/student-management")} variant="outlined"
        sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Back</Button>
    </div>
  );

  const fullName = `${parent.title ? parent.title + " " : ""}${parent.firstName || ""} ${parent.surName || ""}`.trim();

  const Field = ({ label, field, type = "text", options }: any) => (
    <div className="flex flex-col py-2">
      <label className="text-xs text-gray-500 mb-1">{label}</label>
      {editing ? (
        options ? (
          <select value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="border border-gray-300 rounded-lg p-2 text-sm bg-white">
            <option value="">— Select —</option>
            {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} value={form[field] || ""}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="border border-gray-300 rounded-lg p-2 text-sm" />
        )
      ) : (
        <p className="text-sm font-medium text-black">{(parent as any)[field] || parent?.address?.[field] || "—"}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-[900px] mx-auto">
      <button onClick={() => navigate("/student-management")}
        className="text-tertiary flex items-center gap-1 text-sm hover:underline mb-6">
        <KeyboardBackspace fontSize="small" /> Back to Student Management
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar sx={{ width: 80, height: 80, fontSize: 28 }}>
            {parent.firstName?.[0]}{parent.surName?.[0]}
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-black">{fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {parent.occupation && (
                <Chip label={parent.occupation} size="small" variant="outlined" />
              )}
              <Chip
                label={linkedStudents.length > 0 ? `${linkedStudents.length} ward(s)` : "No wards linked"}
                size="small"
                sx={{
                  backgroundColor: linkedStudents.length > 0 ? "#DCFCE7" : "#F3F4F6",
                  color: linkedStudents.length > 0 ? "#15803D" : "#6B7280"
                }}
              />
            </div>
            {parent.email && <p className="text-sm text-gray-500 mt-1">{parent.email}</p>}
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditing(true)}
                sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Edit</Button>
            ) : (
              <>
                <Button variant="outlined" startIcon={<Cancel />} onClick={() => setEditing(false)}
                  sx={{ borderRadius: "10px", textTransform: "capitalize" }}>Cancel</Button>
                <Button variant="contained" color="tertiary" startIcon={<Save />}
                  onClick={handleSave} disabled={saving}
                  sx={{ color: "white", borderRadius: "10px", textTransform: "capitalize" }}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Personal Info */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-lg text-black mb-4">Personal Information</h3>

          {!editing ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1">
              <InfoRow label="Title" value={parent.title} />
              <InfoRow label="First Name" value={parent.firstName} />
              <InfoRow label="Surname" value={parent.surName} />
              <InfoRow label="Email" value={parent.email} />
              <InfoRow label="Phone" value={parent.phoneNumber} />
              <InfoRow label="Occupation" value={parent.occupation} />
              <InfoRow label="Country" value={parent.country} />
              <InfoRow label="State" value={parent.stateOfOrigin} />
              <InfoRow label="LGA" value={parent.localGovernmentArea} />
              <InfoRow label="Street" value={parent.address?.street} />
              <InfoRow label="City" value={parent.address?.city} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">Title</label>
                <select value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="border border-gray-300 rounded-lg p-2 text-sm bg-white">
                  <option value="">— Select —</option>
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">First Name</label>
                <input value={form.firstName || ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="border border-gray-300 rounded-lg p-2 text-sm" />
              </div>
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">Surname</label>
                <input value={form.surName || ""} onChange={(e) => setForm({ ...form, surName: e.target.value })}
                  className="border border-gray-300 rounded-lg p-2 text-sm" />
              </div>
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">Email</label>
                <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border border-gray-300 rounded-lg p-2 text-sm" />
              </div>
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">Phone</label>
                <input value={form.phoneNumber || ""} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="border border-gray-300 rounded-lg p-2 text-sm" />
              </div>
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">Occupation</label>
                <select value={form.occupation || ""} onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  className="border border-gray-300 rounded-lg p-2 text-sm bg-white">
                  <option value="">— Select —</option>
                  {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">Country</label>
                <select value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value, stateOfOrigin: "", localGovernmentArea: "" })}
                  className="border border-gray-300 rounded-lg p-2 text-sm bg-white">
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">State</label>
                <select value={form.stateOfOrigin || ""} onChange={(e) => setForm({ ...form, stateOfOrigin: e.target.value, localGovernmentArea: "" })}
                  className="border border-gray-300 rounded-lg p-2 text-sm bg-white">
                  <option value="">— Select —</option>
                  {form.country === "Nigeria" && Object.keys(statesData).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">LGA</label>
                <select value={form.localGovernmentArea || ""} onChange={(e) => setForm({ ...form, localGovernmentArea: e.target.value })}
                  disabled={!form.stateOfOrigin} className="border border-gray-300 rounded-lg p-2 text-sm bg-white disabled:bg-gray-100">
                  <option value="">— Select —</option>
                  {lgaOptions.map((l: string) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">Street</label>
                <input value={form.street || ""} onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="border border-gray-300 rounded-lg p-2 text-sm" />
              </div>
              <div className="flex flex-col py-2">
                <label className="text-xs text-gray-500 mb-1">City</label>
                <input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="border border-gray-300 rounded-lg p-2 text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Linked Students */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-lg text-black mb-4">
            Linked Students ({linkedStudents.length})
          </h3>
          {linkedStudents.length === 0 ? (
            <p className="text-sm text-gray-400">No students linked to this parent yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {linkedStudents.map((student: any) => {
                const guardian = student.guardians?.find((g: any) => g.parentId === parentId);
                return (
                  <div key={student._id}
                    className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-tertiary cursor-pointer transition-colors"
                    onClick={() => navigate(`/student-management/student-profile/${student._id}`)}>
                    <div className="flex items-center gap-3">
                      <Avatar sx={{ width: 36, height: 36, fontSize: 14 }} src={student.photo || ""}>
                        {student.firstName?.[0]}{student.surName?.[0]}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-black">
                          {student.firstName} {student.surName}
                        </p>
                        <p className="text-xs text-gray-500">{student.studentID}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Chip label={getArmLabel(student.classArmId)} size="small"
                        sx={{ backgroundColor: "#DBEAFE", color: "#1D4ED8", fontSize: "10px" }} />
                      {guardian?.relationship && (
                        <span className="text-xs text-gray-500">{guardian.relationship}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}