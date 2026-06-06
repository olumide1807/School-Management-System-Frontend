import { useState } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel, IconButton, Switch, FormControlLabel } from "@mui/material";
import { Add, Delete, KeyboardBackspace, UploadFile, CheckCircle } from "@mui/icons-material";
import ValidatedInput from "../../../Components/Forms/ValidatedInput";
import { useForm, FormProvider } from "react-hook-form";
import SERVER from "../../../Utils/server";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../../Utils/toastOptions";
import { useNavigate } from "react-router-dom";
import { statesData } from "../../../Data/statesData";

const COUNTRIES = ['Nigeria', 'Ghana', 'Cameroon', 'Togo', 'Benin', 'South Africa', 'Kenya', 'United Kingdom', 'United States', 'Canada', 'India', 'Other'];
const RELIGIONS = ['Islam', 'Christianity', 'Traditional', 'Other'];
const TITLES = ['Mr', 'Mrs', 'Miss', 'Dr', 'Prof'];
const RELATIONSHIPS = ['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Spouse', 'Cousin', 'Friend', 'Other'];
const QUALIFICATIONS = ['SSCE/WAEC', 'OND', 'HND', 'NCE', 'B.Ed', 'B.Sc', 'B.A', 'B.Tech', 'PGDE', 'M.Ed', 'M.Sc', 'M.A', 'MBA', 'PhD', 'Other'];

const STEPS = ["Personal Info", "Contact & Location", "Employment & Qualifications", "Next of Kin"];

interface Qualification {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  yearGraduated: string;
  certificateUrl: string;
  certificateName: string;
  uploading: boolean;
}

export function AddStaffForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const methods = useForm({ mode: "all" });

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Dropdown states
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Nigeria");
  const [selectedState, setSelectedState] = useState("");
  const [selectedLGA, setSelectedLGA] = useState("");
  const [selectedReligion, setSelectedReligion] = useState("");
  const [selectedStaffType, setSelectedStaffType] = useState("academic");
  const [selectedNOKRelationship, setSelectedNOKRelationship] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Qualifications (dynamic list)
  const [qualifications, setQualifications] = useState<Qualification[]>([
    { degree: "", fieldOfStudy: "", institution: "", yearGraduated: "", certificateUrl: "", certificateName: "", uploading: false }
  ]);

  const addQualification = () => {
    setQualifications([...qualifications, { degree: "", fieldOfStudy: "", institution: "", yearGraduated: "", certificateUrl: "", certificateName: "", uploading: false }]);
  };

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const updateQualification = (index: number, field: string, value: any) => {
    const updated = [...qualifications];
    (updated[index] as any)[field] = value;
    setQualifications(updated);
  };

  // Upload certificate for a specific qualification
  const handleCertificateUpload = async (index: number, file: File) => {
    updateQualification(index, "uploading", true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await SERVER.post("staff/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const url = res?.data?.data?.url || "";
      const name = res?.data?.data?.originalName || file.name;
      updateQualification(index, "certificateUrl", url);
      updateQualification(index, "certificateName", name);
      updateQualification(index, "uploading", false);
      toast.success("Certificate uploaded!", toastOptions);
    } catch (error: any) {
      updateQualification(index, "uploading", false);
      toast.error(error?.response?.data?.error || "Upload failed", toastOptions);
    }
  };

  const nextStep = () => { if (step < STEPS.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  // EXPLICIT submit — only called from the "Create Staff" button
  const handleCreateStaff = async () => {
    const data = methods.getValues();

    if (!data.firstName || !data.surname || !data.emailAddress) {
      toast.error("Please fill in first name, surname, and email", toastOptions);
      setStep(0);
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        title: selectedTitle,
        firstName: data.firstName,
        surname: data.surname,
        otherName: data.otherName || "",
        gender: selectedGender,
        maritalStatus: selectedMaritalStatus,
        emailAddress: data.emailAddress,
        phoneNumber: data.phoneNumber || "",
        country: selectedCountry,
        stateOfOrigin: selectedState,
        localGovernmentArea: selectedLGA,
        religion: selectedReligion,
        homeAddress: data.homeAddress || "",
        staffType: selectedStaffType,
        isAdmin,
        salary: data.salary || "",
        employmentDate: data.employmentDate || null,
        nextOfKinFirstName: data.nokFirstName || "",
        nextOfKinSurname: data.nokSurname || "",
        nextOfKinPhoneNumber: data.nokPhone || "",
        nextOfKinRelationship: selectedNOKRelationship,
        qualifications: qualifications
          .filter(q => q.degree || q.institution)
          .map(q => ({
            degree: q.degree,
            fieldOfStudy: q.fieldOfStudy,
            institution: q.institution,
            yearGraduated: q.yearGraduated ? Number(q.yearGraduated) : null,
            certificateUrl: q.certificateUrl || null
          })),
      };

      await SERVER.post("staff", payload);
      toast.success("Staff created successfully! Login credentials have been sent to their email.", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["all-staff"] });
      navigate("/staff-management");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to create staff",
        toastOptions
      );
    } finally {
      setSaving(false);
    }
  };

  // LGA options
  const lgaOptions = selectedCountry === "Nigeria" && selectedState && (statesData as any)[selectedState]
    ? (statesData as any)[selectedState].map((lga: any) => lga.value || lga.label || lga)
    : [];

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/staff-management")}
          className="text-tertiary flex items-center gap-1 text-sm hover:underline"
        >
          <KeyboardBackspace fontSize="small" /> Back
        </button>
      </div>

      <h2 className="text-xl font-bold text-black mb-1">Add New Staff</h2>
      <p className="text-sm text-gray-500 mb-6">
        Staff ID will be auto-generated. Login credentials will be emailed to the staff.
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {STEPS.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              i === step ? "bg-tertiary text-white"
              : i < step ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              i === step ? "bg-white text-tertiary" : i < step ? "bg-green-600 text-white" : "bg-gray-300 text-white"
            }`}>
              {i < step ? "✓" : i + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* NO <form> wrapper — prevents accidental submission */}
      <FormProvider {...methods}>
        <div>

          {/* Step 1: Personal Info */}
          {step === 0 && (
            <div className="flex flex-col gap-y-4">
              <p className="font-semibold text-black text-lg mb-2">Personal Information</p>

              <div className="grid grid-cols-3 gap-4">
                <FormControl fullWidth>
                  <InputLabel>Title</InputLabel>
                  <Select value={selectedTitle} label="Title" onChange={(e) => setSelectedTitle(e.target.value)}
                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                    {TITLES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
                <ValidatedInput name="firstName" label="First Name *" placeholder="First name"
                  otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                <ValidatedInput name="surname" label="Surname *" placeholder="Surname"
                  otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput name="otherName" label="Other Name" placeholder="Other name (optional)"
                  otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                <FormControl fullWidth>
                  <InputLabel>Gender *</InputLabel>
                  <Select value={selectedGender} label="Gender *" onChange={(e) => setSelectedGender(e.target.value)}
                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormControl fullWidth>
                  <InputLabel>Marital Status</InputLabel>
                  <Select value={selectedMaritalStatus} label="Marital Status" onChange={(e) => setSelectedMaritalStatus(e.target.value)}
                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                    <MenuItem value="single">Single</MenuItem>
                    <MenuItem value="married">Married</MenuItem>
                    <MenuItem value="divorced">Divorced</MenuItem>
                    <MenuItem value="widowed">Widowed</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Religion</InputLabel>
                  <Select value={selectedReligion} label="Religion" onChange={(e) => setSelectedReligion(e.target.value)}
                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                    {RELIGIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Location */}
          {step === 1 && (
            <div className="flex flex-col gap-y-4">
              <p className="font-semibold text-black text-lg mb-2">Contact & Location</p>

              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput name="emailAddress" label="Email Address *" placeholder="staff@email.com" type="email"
                  otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                <ValidatedInput name="phoneNumber" label="Phone Number" placeholder="08012345678"
                  otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select value={selectedCountry} label="Country"
                    onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState(""); setSelectedLGA(""); }}
                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                    {COUNTRIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>State of Origin</InputLabel>
                  <Select value={selectedState} label="State of Origin"
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedLGA(""); }}
                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                    {selectedCountry === "Nigeria" ? (
                      Object.keys(statesData).map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)
                    ) : (
                      <MenuItem value="">Select state</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormControl fullWidth>
                  <InputLabel>Local Government Area</InputLabel>
                  <Select value={selectedLGA} label="Local Government Area"
                    onChange={(e) => setSelectedLGA(e.target.value)}
                    disabled={selectedCountry === "Nigeria" && !selectedState}
                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                    {lgaOptions.length > 0 ? (
                      lgaOptions.map((lga: string) => <MenuItem key={lga} value={lga}>{lga}</MenuItem>)
                    ) : (
                      <MenuItem value="">Select state first</MenuItem>
                    )}
                  </Select>
                </FormControl>
                <div />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Home Address</label>
                <textarea
                  {...methods.register("homeAddress")}
                  placeholder="Enter home address"
                  rows={3}
                  className="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px] p-3 text-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Employment & Qualifications */}
          {step === 2 && (
            <div className="flex flex-col gap-y-4">
              <p className="font-semibold text-black text-lg mb-2">Employment Details</p>

              <div className="grid grid-cols-3 gap-4">
                <FormControl fullWidth>
                  <InputLabel>Staff Type *</InputLabel>
                  <Select value={selectedStaffType} label="Staff Type *"
                    onChange={(e) => setSelectedStaffType(e.target.value)}
                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                    <MenuItem value="academic">Academic</MenuItem>
                    <MenuItem value="non-academic">Non-Academic</MenuItem>
                  </Select>
                </FormControl>
                <ValidatedInput name="salary" label="Salary" placeholder="e.g. 150000"
                  otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Employment Date</label>
                  <input
                    type="date"
                    {...methods.register("employmentDate")}
                    className="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px] p-2.5 text-sm h-[56px]"
                  />
                </div>
              </div>

              {/* Admin toggle */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">Admin Privileges</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Admins can manage students, fees, and other school data.
                  </p>
                </div>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAdmin}
                      onChange={(e) => setIsAdmin(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={isAdmin ? "Admin" : "Staff"}
                  labelPlacement="start"
                  sx={{ ml: 0 }}
                />
              </div>

              {/* Qualifications */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-black text-lg">Qualifications</p>
                  <Button
                    type="button" variant="text" size="small" startIcon={<Add />}
                    onClick={addQualification}
                    sx={{ textTransform: "capitalize", color: "#0E7094" }}
                  >
                    Add Qualification
                  </Button>
                </div>

                {qualifications.map((q, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 mb-3 relative">
                    {qualifications.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => removeQualification(i)}
                        sx={{ position: "absolute", top: 8, right: 8 }}
                      >
                        <Delete fontSize="small" color="error" />
                      </IconButton>
                    )}
                    <p className="text-xs text-gray-500 mb-3">Qualification {i + 1}</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <FormControl fullWidth size="small">
                        <InputLabel>Degree / Certificate</InputLabel>
                        <Select
                          value={q.degree} label="Degree / Certificate"
                          onChange={(e) => updateQualification(i, "degree", e.target.value)}
                          sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}
                        >
                          {QUALIFICATIONS.map(qual => <MenuItem key={qual} value={qual}>{qual}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <input
                        type="text" value={q.fieldOfStudy}
                        onChange={(e) => updateQualification(i, "fieldOfStudy", e.target.value)}
                        placeholder="Field of Study (e.g. Mathematics)"
                        className="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px] p-2.5 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text" value={q.institution}
                        onChange={(e) => updateQualification(i, "institution", e.target.value)}
                        placeholder="Institution (e.g. University of Lagos)"
                        className="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px] p-2.5 text-sm"
                      />
                      <input
                        type="number" value={q.yearGraduated}
                        onChange={(e) => updateQualification(i, "yearGraduated", e.target.value)}
                        placeholder="Year Graduated (e.g. 2018)"
                        min="1960" max={new Date().getFullYear()}
                        className="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px] p-2.5 text-sm"
                      />
                    </div>

                    {/* Certificate upload */}
                    <div className="flex items-center gap-3">
                      {q.certificateUrl ? (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex-1">
                          <CheckCircle fontSize="small" className="text-green-600" />
                          <span className="text-xs text-green-700 truncate flex-1">{q.certificateName || "Certificate uploaded"}</span>
                          <button
                            type="button"
                            onClick={() => { updateQualification(i, "certificateUrl", ""); updateQualification(i, "certificateName", ""); }}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors flex-1">
                          <UploadFile fontSize="small" className="text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {q.uploading ? "Uploading..." : "Upload certificate (optional)"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="hidden"
                            disabled={q.uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCertificateUpload(i, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Next of Kin */}
          {step === 3 && (
            <div className="flex flex-col gap-y-4">
              <p className="font-semibold text-black text-lg mb-2">Next of Kin</p>

              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput name="nokFirstName" label="First Name" placeholder="Next of kin first name"
                  otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                <ValidatedInput name="nokSurname" label="Surname" placeholder="Next of kin surname"
                  otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput name="nokPhone" label="Phone Number" placeholder="08012345678"
                  otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                <FormControl fullWidth>
                  <InputLabel>Relationship</InputLabel>
                  <Select value={selectedNOKRelationship} label="Relationship"
                    onChange={(e) => setSelectedNOKRelationship(e.target.value)}
                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                    {RELATIONSHIPS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button" variant="outlined"
              onClick={step === 0 ? () => navigate("/staff-management") : prevStep}
              sx={{ borderRadius: "10px", paddingY: "10px", textTransform: "capitalize" }}
            >
              {step === 0 ? "Cancel" : "Previous"}
            </Button>
            <div className="flex gap-3">
              {step < STEPS.length - 1 ? (
                <Button
                  type="button" color="tertiary" variant="contained"
                  onClick={nextStep}
                  sx={{ color: "white", borderRadius: "10px", paddingY: "10px", paddingX: "30px", textTransform: "capitalize" }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button" color="tertiary" variant="contained"
                  onClick={handleCreateStaff}
                  disabled={saving}
                  sx={{ color: "white", borderRadius: "10px", paddingY: "10px", paddingX: "30px", textTransform: "capitalize" }}
                >
                  {saving ? "Creating Staff..." : "Create Staff"}
                </Button>
              )}
            </div>
          </div>

        </div>
      </FormProvider>
    </div>
  );
}

export default AddStaffForm;