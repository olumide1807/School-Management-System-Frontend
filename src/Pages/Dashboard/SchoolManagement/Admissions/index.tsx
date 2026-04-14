import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Button, Chip, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import EditIcon from "@mui/icons-material/Edit";

import Student from "./tabs/Student";
import Parent from "./tabs/Parent";
import MessageModal from "../../../../Components/Modals/MessageModal";
import Modal from "../../../../Components/Modals";
import SERVER from "../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClassArms, useClassLevels, useSessionTerm } from "../../../../services/api-call";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../Utils/toastOptions";

// ===== EDITABLE INFO ROW =====
function InfoRow({ label, value, editing, field, editData, onChange }: {
  label: string; value?: string; editing?: boolean; field?: string;
  editData?: Record<string, string>; onChange?: (field: string, val: string) => void;
}) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-sm text-gray-500 whitespace-nowrap">{label}</span>
      {editing && field && onChange ? (
        <input
          type="text"
          value={editData?.[field] || ''}
          onChange={(e) => onChange(field, e.target.value)}
          className="text-sm text-black font-medium text-right border border-gray-300 rounded-lg px-2 py-1 w-full max-w-[200px] bg-white focus:outline-none focus:border-[#0E7094]"
        />
      ) : (
        <span className="text-sm text-black font-medium capitalize text-right">{value || '-'}</span>
      )}
    </div>
  );
}

// ===== STUDENT PROFILE VIEW =====
function StudentProfileView() {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [presentStep, setPresentStep] = useState(1);
  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [openLinkParent, setOpenLinkParent] = useState(false);
  const [linkParentId, setLinkParentId] = useState("");
  const [linkRelationship, setLinkRelationship] = useState("");
  const [linking, setLinking] = useState(false);

  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const classArms = allArms?.data?.data?.data || [];
  const classLevels = allLevels?.data?.data?.data || [];

  const { data: studentsData } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => { const res = await SERVER.get('student'); return res?.data; },
    retry: false,
  });

  const { data: parentsData } = useQuery({
    queryKey: ['all-parents'],
    queryFn: async () => { const res = await SERVER.get('parent'); return res?.data; },
    retry: false,
  });

  const students = studentsData?.data || [];
    const allParents = parentsData?.data || [];
    const student = students.find((s: any) => s._id === studentId);
 
    // Fetch all fees for the Fees tab
    const { data: feesData } = useQuery({
      queryKey: ['all-fees'],
      queryFn: async () => { const res = await SERVER.get('fee'); return res?.data; },
      retry: false,
    });
 
    // Fetch payment history for this student
    const { data: paymentsData } = useQuery({
      queryKey: ['student-payments', studentId],
      queryFn: async () => { const res = await SERVER.get(`payment/student/${studentId}`); return res?.data; },
      enabled: !!studentId,
      retry: false,
    });
 
    // Fetch current session and its terms (for mapping termId to name)
    const sessionInfo = useSessionTerm();
    const currentSessionForFees = sessionInfo?.data?.data?.data?.session;
 
    const { data: termsData } = useQuery({
      queryKey: ['session-terms', currentSessionForFees?._id],
      queryFn: async () => {
        const res = await SERVER.get(`session/term/${currentSessionForFees._id}`);
        return res?.data?.data || [];
      },
      enabled: !!currentSessionForFees?._id,
      retry: false,
    });

  const getParentName = (parentId: string) => {
    const parent = allParents.find((p: any) => p._id === parentId);
    return parent ? `${parent.title || ''} ${parent.firstName} ${parent.surName}`.trim() : 'Unknown';
  };

  const getParentPhone = (parentId: string) => {
    const parent = allParents.find((p: any) => p._id === parentId);
    return parent?.phoneNumber || '-';
  };

  const handleLinkParent = async () => {
    if (!linkParentId || !linkRelationship) {
      toast.error('Select a parent and relationship', toastOptions);
      return;
    }
    setLinking(true);
    try {
      await SERVER.put(`student/guardian/link/${studentId}`, {
        parentId: linkParentId,
        relationship: linkRelationship,
      });
      toast.success('Parent linked!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      setLinkParentId("");
      setLinkRelationship("");
      setOpenLinkParent(false);
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || 'Failed to link parent';
      toast.error(errMsg, toastOptions);
    } finally {
      setLinking(false);
    }
  };

  // Populate edit data when student loads or editing starts
  useEffect(() => {
    if (student && editing) {
      setEditData({
        firstName: student.firstName || '',
        surName: student.surName || '',
        otherName: student.otherName || '',
        gender: student.gender || '',
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: student.bloodGroup || '',
        religion: student.religion || '',
        nationality: student.nationality || '',
        email: student.email || '',
        phoneNumber: student.phoneNumber || '',
        country: student.country || '',
        stateOfOrigin: student.stateOfOrigin || '',
        localGovernmentArea: student.localGovernmentArea || '',
        street: student.address?.street || '',
        city: student.address?.city || '',
        addrState: student.address?.state || '',
        previousSchool: student.previousSchool || '',
        lastClassAttended: student.lastClassAttended || '',
        reasonForLeaving: student.reasonForLeaving || '',
        allergies: student.medicalInfo?.allergies || '',
        disabilities: student.medicalInfo?.disabilities || '',
        medicalConditions: student.medicalInfo?.medicalConditions || '',
        emergencyName: student.emergencyContact?.name || '',
        emergencyPhone: student.emergencyContact?.phone || '',
        emergencyRelationship: student.emergencyContact?.relationship || '',
      });
    }
  }, [student, editing]);

  const handleChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!student) return;
    setSaving(true);
    try {
      await SERVER.put(`student/${student._id}`, {
        firstName: editData.firstName,
        surName: editData.surName,
        otherName: editData.otherName,
        gender: editData.gender,
        dateOfBirth: editData.dateOfBirth,
        bloodGroup: editData.bloodGroup,
        religion: editData.religion,
        nationality: editData.nationality,
        email: editData.email,
        phoneNumber: editData.phoneNumber,
        country: editData.country,
        stateOfOrigin: editData.stateOfOrigin,
        localGovernmentArea: editData.localGovernmentArea,
        address: {
          street: editData.street,
          city: editData.city,
          state: editData.addrState,
          country: editData.country,
        },
        previousSchool: editData.previousSchool,
        lastClassAttended: editData.lastClassAttended,
        reasonForLeaving: editData.reasonForLeaving,
        medicalInfo: {
          allergies: editData.allergies,
          disabilities: editData.disabilities,
          medicalConditions: editData.medicalConditions,
        },
        emergencyContact: {
          name: editData.emergencyName,
          phone: editData.emergencyPhone,
          relationship: editData.emergencyRelationship,
        },
      });
      toast.success('Student updated successfully!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      setEditing(false);
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || 'Failed to update student';
      toast.error(errMsg, toastOptions);
    } finally {
      setSaving(false);
    }
  };

  const getArmLabel = (classArmId: string) => {
    const arm = classArms.find((a: any) => a._id === classArmId);
    if (!arm) return '';
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ''} ${arm.armName?.toUpperCase() || ''}`.trim();
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    const d = new Date(date);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const handleDeactivateActivate = async () => {
    if (!student) return;
    const action = student.status === "active" ? "deactivate" : "activate";
    try {
      await SERVER.put(`student/${action}/${student._id}`);
      toast.success(`Student ${action}d successfully!`, toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      setOpenDeactivate(false);
    } catch (error: any) {
      toast.error(`Failed to ${action} student`, toastOptions);
    }
  };

  const handleDeleteStudent = async () => {
    if (!student) return;
    try {
      await SERVER.delete(`student/${student._id}`);
      toast.success('Student deleted!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      setOpenDelete(false);
      navigate('/school-management/admission');
    } catch (error: any) {
      toast.error('Failed to delete student', toastOptions);
    }
  };

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-gray-500">Student not found</p>
        <Link to="/school-management/admission" className="text-[#0E7094]">← Back to Students</Link>
      </div>
    );
  }

  const profileSteps = [
      { id: 1, name: "Personal Bio Data" },
      { id: 2, name: "Parent/Guardian" },
      { id: 3, name: "Fees" },
      { id: 4, name: "Attendance" },
    ];

  return (
    <>
      <div className="flex flex-col">
        <span className="mb-10">
          <Link to="/school-management/admission" className="flex text-base items-center text-tertiary gap-x-2.5">
            <KeyboardBackspaceIcon /> Back to Students
          </Link>
        </span>

        {/* Header */}
        <div className="mb-12 bg-bg-1 rounded-[10px] p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex md:flex-row flex-col md:items-center gap-8">
              <Avatar src={student.photo || ""} alt={student.firstName?.[0]}
                sx={{ height: "150px", width: "150px", borderRadius: "10px", fontSize: "3rem" }} />
              <div>
                <p className="text-xl font-semibold mb-2.5">
                  {student.firstName} {student.surName} {student.otherName || ''}
                </p>
                <div className="flex items-center gap-x-2.5 mb-4">
                  <Chip label={student.studentID} />
                  <Chip label={getArmLabel(student.classArmId)} />
                  <Chip label={student.status}
                    sx={{ backgroundColor: student.status === 'active' ? '#dcfce7' : '#fee2e2',
                      color: student.status === 'active' ? '#15803d' : '#dc2626',
                      fontWeight: 600, textTransform: 'capitalize' }} />
                </div>
                {student.guardians?.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Parent/Guardian</p>
                    <p className="text-sm font-medium">Linked ({student.guardians.length})</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button variant="outlined" color="tertiary" startIcon={<EditIcon />}
                onClick={() => { if (editing) { setEditing(false); } else { setEditing(true); setPresentStep(1); } }}
                sx={{ borderRadius: "10px", paddingY: "10px", paddingX: "16px", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button variant="contained"
                onClick={() => setOpenDeactivate(true)}
                sx={{ background: student.status === 'active' ? "#1F2122" : "#0E7094", color: "white",
                  borderRadius: "10px", paddingY: "10px", paddingX: "16px", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                {student.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="contained" onClick={() => setOpenDelete(true)}
                sx={{ background: "#dc2626", color: "white", borderRadius: "10px", paddingY: "10px",
                  paddingX: "16px", textTransform: "capitalize", whiteSpace: "nowrap", '&:hover': { background: '#b91c1c' } }}>
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Save bar when editing */}
        {editing && (
          <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">You are editing this student's profile. Click on any value to change it.</p>
            <div className="flex gap-3">
              <Button variant="outlined" size="small" onClick={() => setEditing(false)}
                sx={{ borderRadius: "8px", textTransform: "capitalize" }}>Cancel</Button>
              <Button color="tertiary" variant="contained" size="small" onClick={handleSave} disabled={saving}
                sx={{ color: "white", borderRadius: "8px", textTransform: "capitalize" }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 w-full max-w-[825px] overflow-x-auto">
          <div className="flex min-w-full border-b border-bg-2">
            {profileSteps.map((s) => (
              <button key={s.id} onClick={() => setPresentStep(s.id)}
                className={`w-full text-center flex flex-col gap-y-1 relative text-sm sm:text-base ${
                  s.id === presentStep ? "text-tertiary" : "text-gray-400"
                } py-2 px-5 sm:px-4 md:px-8`}>
                <p className="text-base whitespace-nowrap">{s.name}</p>
                {s.id === presentStep && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Personal Bio */}
        {presentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-lg mb-4 text-black">Personal Information</h3>
              <div className="flex flex-col gap-3">
                <InfoRow label="First Name" value={student.firstName} editing={editing} field="firstName" editData={editData} onChange={handleChange} />
                <InfoRow label="Surname" value={student.surName} editing={editing} field="surName" editData={editData} onChange={handleChange} />
                <InfoRow label="Other Name" value={student.otherName} editing={editing} field="otherName" editData={editData} onChange={handleChange} />
                <InfoRow label="Gender" value={student.gender} editing={editing} field="gender" editData={editData} onChange={handleChange} />
                <InfoRow label="Date of Birth" value={editing ? editData.dateOfBirth : formatDate(student.dateOfBirth)} editing={editing} field="dateOfBirth" editData={editData} onChange={handleChange} />
                <InfoRow label="Blood Group" value={student.bloodGroup} editing={editing} field="bloodGroup" editData={editData} onChange={handleChange} />
                <InfoRow label="Religion" value={student.religion} editing={editing} field="religion" editData={editData} onChange={handleChange} />
                <InfoRow label="Nationality" value={student.nationality} editing={editing} field="nationality" editData={editData} onChange={handleChange} />
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-lg mb-4 text-black">Contact & Address</h3>
              <div className="flex flex-col gap-3">
                <InfoRow label="Email" value={student.email} editing={editing} field="email" editData={editData} onChange={handleChange} />
                <InfoRow label="Phone" value={student.phoneNumber} editing={editing} field="phoneNumber" editData={editData} onChange={handleChange} />
                <InfoRow label="Country" value={student.country} editing={editing} field="country" editData={editData} onChange={handleChange} />
                <InfoRow label="State of Origin" value={student.stateOfOrigin} editing={editing} field="stateOfOrigin" editData={editData} onChange={handleChange} />
                <InfoRow label="LGA" value={student.localGovernmentArea} editing={editing} field="localGovernmentArea" editData={editData} onChange={handleChange} />
                <InfoRow label="Street" value={student.address?.street} editing={editing} field="street" editData={editData} onChange={handleChange} />
                <InfoRow label="City" value={student.address?.city} editing={editing} field="city" editData={editData} onChange={handleChange} />
                <InfoRow label="State" value={student.address?.state} editing={editing} field="addrState" editData={editData} onChange={handleChange} />
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-lg mb-4 text-black">Academic Information</h3>
              <div className="flex flex-col gap-3">
                <InfoRow label="Student ID" value={student.studentID} />
                <InfoRow label="Class" value={getArmLabel(student.classArmId)} />
                <InfoRow label="Admission Date" value={formatDate(student.admissionDate || student.createdAt)} />
                <InfoRow label="Previous School" value={student.previousSchool} editing={editing} field="previousSchool" editData={editData} onChange={handleChange} />
                <InfoRow label="Last Class Attended" value={student.lastClassAttended} editing={editing} field="lastClassAttended" editData={editData} onChange={handleChange} />
                <InfoRow label="Reason for Leaving" value={student.reasonForLeaving} editing={editing} field="reasonForLeaving" editData={editData} onChange={handleChange} />
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-lg mb-4 text-black">Medical Information</h3>
              <div className="flex flex-col gap-3">
                <InfoRow label="Allergies" value={student.medicalInfo?.allergies} editing={editing} field="allergies" editData={editData} onChange={handleChange} />
                <InfoRow label="Disabilities" value={student.medicalInfo?.disabilities} editing={editing} field="disabilities" editData={editData} onChange={handleChange} />
                <InfoRow label="Medical Conditions" value={student.medicalInfo?.medicalConditions} editing={editing} field="medicalConditions" editData={editData} onChange={handleChange} />
              </div>
              <h3 className="font-semibold text-lg mb-4 mt-6 text-black">Emergency Contact</h3>
              <div className="flex flex-col gap-3">
                <InfoRow label="Name" value={student.emergencyContact?.name} editing={editing} field="emergencyName" editData={editData} onChange={handleChange} />
                <InfoRow label="Phone" value={student.emergencyContact?.phone} editing={editing} field="emergencyPhone" editData={editData} onChange={handleChange} />
                <InfoRow label="Relationship" value={student.emergencyContact?.relationship} editing={editing} field="emergencyRelationship" editData={editData} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Parent/Guardian */}
        {presentStep === 2 && (
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-black">Parent / Guardian</h3>
              <Button variant="outlined" color="tertiary" size="small"
                onClick={() => setOpenLinkParent(true)}
                sx={{ borderRadius: "8px", textTransform: "capitalize" }}>
                Link Parent
              </Button>
            </div>
            {student.guardians?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {student.guardians.map((g: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{getParentName(g.parentId)}</p>
                      <p className="text-sm text-gray-500">Relationship: {g.relationship || '-'}</p>
                      <p className="text-sm text-gray-500">Phone: {getParentPhone(g.parentId)}</p>
                    </div>
                    <Button variant="text" size="small"
                      onClick={() => navigate(`?profile=parent&id=${g.parentId}`)}
                      sx={{ textTransform: "capitalize" }}>
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-3">No parent/guardian linked yet</p>
                <Button variant="outlined" color="tertiary" size="small"
                  onClick={() => setOpenLinkParent(true)}
                  sx={{ borderRadius: "8px", textTransform: "capitalize" }}>
                  Link a Parent/Guardian
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Fees */}
        {presentStep === 3 && (() => {
          const allFees = feesData?.data || [];
          const allPayments = paymentsData?.data || [];
          const allTerms = termsData || [];
 
          // Fees for this student's class arm
          const studentFees = allFees.filter((f: any) => f.classArmId === student.classArmId);
 
          // Sort by term start date (newest first)
          const sortedFees = [...studentFees].sort((a: any, b: any) => {
            const termA = allTerms.find((t: any) => t._id === a.termId);
            const termB = allTerms.find((t: any) => t._id === b.termId);
            const dateA = termA?.termStartDate ? new Date(termA.termStartDate).getTime() : 0;
            const dateB = termB?.termStartDate ? new Date(termB.termStartDate).getTime() : 0;
            return dateB - dateA;
          });
 
          const getTermName = (termId: string) =>
            allTerms.find((t: any) => t._id === termId)?.termName || '-';
 
          const getTotalFee = (fee: any) =>
            fee.fees?.reduce((s: number, f: any) => s + (parseFloat(f.amount) || 0), 0) || 0;
 
          const getTotalPaid = (feeId: string) =>
            allPayments
              .filter((p: any) => p.feeId === feeId)
              .reduce((s: number, p: any) => s + (p.amount || 0), 0);
 
          const totalOwed = sortedFees.reduce((s: number, f: any) => s + getTotalFee(f), 0);
          const totalPaid = allPayments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
          const totalBalance = totalOwed - totalPaid;
 
          return (
            <div className="flex flex-col gap-5">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Total Fees</p>
                  <p className="text-lg font-bold text-black">₦{totalOwed.toLocaleString()}</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 bg-green-50">
                  <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                  <p className="text-lg font-bold text-green-700">₦{totalPaid.toLocaleString()}</p>
                </div>
                <div className={`border border-gray-200 rounded-xl p-4 ${totalBalance > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 mb-1">Outstanding Balance</p>
                  <p className={`text-lg font-bold ${totalBalance > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                    ₦{totalBalance.toLocaleString()}
                  </p>
                </div>
              </div>
 
              {/* Fees by term */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4 text-black">Fees by Term</h3>
                {sortedFees.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No fees set for this class yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#E9FAFF] text-left">
                          <th className="p-3 font-semibold">Term</th>
                          <th className="p-3 font-semibold text-right">Amount</th>
                          <th className="p-3 font-semibold text-right">Paid</th>
                          <th className="p-3 font-semibold text-right">Balance</th>
                          <th className="p-3 font-semibold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedFees.map((fee: any) => {
                          const total = getTotalFee(fee);
                          const paid = getTotalPaid(fee._id);
                          const balance = total - paid;
                          const status = paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
                          return (
                            <tr key={fee._id} className="border-t border-gray-100">
                              <td className="p-3">{getTermName(fee.termId)}</td>
                              <td className="p-3 text-right">₦{total.toLocaleString()}</td>
                              <td className="p-3 text-right">₦{paid.toLocaleString()}</td>
                              <td className="p-3 text-right">
                                {balance > 0 ? `₦${balance.toLocaleString()}` : '-'}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-3 py-1 rounded text-xs font-medium ${
                                  status === 'Paid' ? 'bg-green-100 text-green-700' :
                                  status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
 
              {/* Payment history */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4 text-black">Payment History</h3>
                {allPayments.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No payments recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="p-3 font-semibold">Date</th>
                          <th className="p-3 font-semibold">Term</th>
                          <th className="p-3 font-semibold">Method</th>
                          <th className="p-3 font-semibold">Reference</th>
                          <th className="p-3 font-semibold text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...allPayments]
                          .sort((a: any, b: any) =>
                            new Date(b.paymentDate || b.createdAt).getTime() -
                            new Date(a.paymentDate || a.createdAt).getTime()
                          )
                          .map((p: any) => {
                            const fee = allFees.find((f: any) => f._id === p.feeId);
                            return (
                              <tr key={p._id} className="border-t border-gray-100">
                                <td className="p-3">
                                  {new Date(p.paymentDate || p.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3">{fee ? getTermName(fee.termId) : '-'}</td>
                                <td className="p-3 capitalize">{p.paymentMethod || '-'}</td>
                                <td className="p-3">{p.reference || '-'}</td>
                                <td className="p-3 text-right font-medium">
                                  ₦{parseFloat(p.amount).toLocaleString()}
                                </td>
                              </tr>
                            );
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
 
        {/* Tab 4: Attendance */}
        {presentStep === 4 && (
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-4 text-black">Attendance</h3>
            <div className="text-center py-10">
              <p className="text-gray-400">Attendance records will appear here once tracking is set up.</p>
            </div>
          </div>
        )}
      </div>

      {/* Link Parent Modal */}
      <Modal openModal={openLinkParent} closeModal={() => { setOpenLinkParent(false); setLinkParentId(""); setLinkRelationship(""); }}
        title="Link Parent/Guardian">
        <div className="flex flex-col gap-y-6">
          {allParents.length === 0 ? (
            <p className="text-gray-500">No parents registered yet. Add a parent from the Parent tab first.</p>
          ) : (
            <>
              <FormControl fullWidth>
                <InputLabel>Select Parent/Guardian</InputLabel>
                <Select value={linkParentId} label="Select Parent/Guardian" onChange={(e) => setLinkParentId(e.target.value)}
                  sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                  {allParents.map((p: any) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.title} {p.firstName} {p.surName} — {p.phoneNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Relationship</InputLabel>
                <Select value={linkRelationship} label="Relationship" onChange={(e) => setLinkRelationship(e.target.value)}
                  sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                  <MenuItem value="father">Father</MenuItem>
                  <MenuItem value="mother">Mother</MenuItem>
                  <MenuItem value="uncle">Uncle</MenuItem>
                  <MenuItem value="aunt">Aunt</MenuItem>
                  <MenuItem value="guardian">Guardian</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <Button color="tertiary" variant="contained" onClick={handleLinkParent} disabled={linking}
                sx={{ color: "white", borderRadius: "10px", paddingY: "12px", width: "fit-content" }}>
                {linking ? "Linking..." : "Link Parent"}
              </Button>
            </>
          )}
        </div>
      </Modal>

      <MessageModal column
        desc={`Are you sure you want to ${student.status === 'active' ? 'deactivate' : 'activate'} ${student.firstName} ${student.surName}?`}
        openModal={openDeactivate} closeModal={() => setOpenDeactivate(false)}
        handleClick={handleDeactivateActivate}
        btn1Name={student.status === 'active' ? 'Yes, Deactivate' : 'Yes, Activate'} />
      <MessageModal column
        desc={`This will permanently remove ${student.firstName} ${student.surName}. Are you sure?`}
        openModal={openDelete} closeModal={() => setOpenDelete(false)}
        handleClick={handleDeleteStudent} btn1Name="Yes, Delete" />
    </>
  );
}

// ===== PARENT PROFILE VIEW =====
function ParentProfileView() {
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get("id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [openDelete, setOpenDelete] = useState(false);
  const [openLinkStudent, setOpenLinkStudent] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedRelationship, setSelectedRelationship] = useState("");
  const [linking, setLinking] = useState(false);

  const { data: parentsData } = useQuery({
    queryKey: ['all-parents'],
    queryFn: async () => { const res = await SERVER.get('parent'); return res?.data; },
    retry: false,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => { const res = await SERVER.get('student'); return res?.data; },
    retry: false,
  });

  const parents = parentsData?.data || [];
  const allStudents = studentsData?.data || [];
  const parent = parents.find((p: any) => p._id === parentId);

  const linkedStudents = allStudents.filter((s: any) =>
    s.guardians?.some((g: any) => g.parentId === parentId)
  );

  const unlinkedStudents = allStudents.filter((s: any) =>
    !s.guardians?.some((g: any) => g.parentId === parentId)
  );

  useEffect(() => {
    if (parent && editing) {
      setEditData({
        title: parent.title || '',
        firstName: parent.firstName || '',
        surName: parent.surName || '',
        email: parent.email || '',
        phoneNumber: parent.phoneNumber || '',
        occupation: parent.occupation || '',
        homeAddress: parent.homeAddress || '',
      });
    }
  }, [parent, editing]);

  const handleChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!parent) return;
    setSaving(true);
    try {
      await SERVER.put(`parent/${parent._id}`, editData);
      toast.success('Parent updated!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-parents'] });
      setEditing(false);
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || 'Failed to update';
      toast.error(errMsg, toastOptions);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteParent = async () => {
    if (!parent) return;
    try {
      await SERVER.delete(`parent/${parent._id}`);
      toast.success('Parent deleted!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-parents'] });
      setOpenDelete(false);
      navigate('/school-management/admission');
    } catch (error: any) {
      toast.error('Failed to delete', toastOptions);
    }
  };

  const handleLinkStudent = async () => {
    if (!selectedStudentId || !selectedRelationship) {
      toast.error('Select a student and relationship', toastOptions);
      return;
    }
    setLinking(true);
    try {
      await SERVER.put(`parent/student/link/${parentId}`, {
        studentID: selectedStudentId,
        relationship: selectedRelationship,
      });
      toast.success('Student linked!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      queryClient.invalidateQueries({ queryKey: ['all-parents'] });
      setSelectedStudentId("");
      setSelectedRelationship("");
      setOpenLinkStudent(false);
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || 'Failed to link student';
      toast.error(errMsg, toastOptions);
    } finally {
      setLinking(false);
    }
  };

  if (!parent) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-gray-500">Parent not found</p>
        <Link to="/school-management/admission" className="text-[#0E7094]">← Back</Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <span className="mb-10">
          <Link to="/school-management/admission" className="flex text-base items-center text-tertiary gap-x-2.5">
            <KeyboardBackspaceIcon /> Back to Parents
          </Link>
        </span>

        {/* Header */}
        <div className="mb-12 bg-bg-1 rounded-[10px] p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xl font-semibold mb-2">
                {parent.title} {parent.firstName} {parent.surName}
              </p>
              <p className="text-sm text-gray-500">{parent.email}</p>
              <p className="text-sm text-gray-500">{parent.phoneNumber}</p>
              <p className="text-sm text-gray-500 capitalize mt-1">{parent.occupation}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button variant="outlined" color="tertiary" startIcon={<EditIcon />}
                onClick={() => { if (editing) { setEditing(false); } else { setEditing(true); } }}
                sx={{ borderRadius: "10px", paddingY: "10px", paddingX: "16px", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button variant="contained" onClick={() => setOpenDelete(true)}
                sx={{ background: "#dc2626", color: "white", borderRadius: "10px", paddingY: "10px",
                  paddingX: "16px", textTransform: "capitalize", whiteSpace: "nowrap", '&:hover': { background: '#b91c1c' } }}>
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Save bar when editing */}
        {editing && (
          <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">Editing parent profile. Click values to change them.</p>
            <div className="flex gap-3">
              <Button variant="outlined" size="small" onClick={() => setEditing(false)} sx={{ borderRadius: "8px", textTransform: "capitalize" }}>Cancel</Button>
              <Button color="tertiary" variant="contained" size="small" onClick={handleSave} disabled={saving}
                sx={{ color: "white", borderRadius: "8px", textTransform: "capitalize" }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Details */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-4 text-black">Personal Details</h3>
            <div className="flex flex-col gap-3">
              <InfoRow label="Title" value={parent.title} editing={editing} field="title" editData={editData} onChange={handleChange} />
              <InfoRow label="First Name" value={parent.firstName} editing={editing} field="firstName" editData={editData} onChange={handleChange} />
              <InfoRow label="Surname" value={parent.surName} editing={editing} field="surName" editData={editData} onChange={handleChange} />
              <InfoRow label="Gender" value={parent.gender} />
              <InfoRow label="Marital Status" value={parent.maritalStatus} />
              <InfoRow label="Email" value={parent.email} editing={editing} field="email" editData={editData} onChange={handleChange} />
              <InfoRow label="Phone" value={parent.phoneNumber} editing={editing} field="phoneNumber" editData={editData} onChange={handleChange} />
              <InfoRow label="Occupation" value={parent.occupation} editing={editing} field="occupation" editData={editData} onChange={handleChange} />
              <InfoRow label="Address" value={parent.homeAddress} editing={editing} field="homeAddress" editData={editData} onChange={handleChange} />
            </div>
          </div>

          {/* Linked Students */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-black">Linked Students ({linkedStudents.length})</h3>
              <Button variant="outlined" color="tertiary" size="small" onClick={() => setOpenLinkStudent(true)}
                sx={{ borderRadius: "8px", textTransform: "capitalize" }}>
                Link Student
              </Button>
            </div>
            {linkedStudents.length === 0 ? (
              <p className="text-gray-400 text-center py-6">No students linked yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {linkedStudents.map((s: any) => {
                  const guardian = s.guardians?.find((g: any) => g.parentId === parentId);
                  return (
                    <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{s.firstName} {s.surName}</p>
                        <p className="text-xs text-gray-500">{s.studentID}</p>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{guardian?.relationship || '-'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link Student Modal */}
      <Modal openModal={openLinkStudent} closeModal={() => { setOpenLinkStudent(false); setSelectedStudentId(""); setSelectedRelationship(""); }}
        title="Link Student to Parent">
        <div className="flex flex-col gap-y-6">
          {unlinkedStudents.length === 0 ? (
            <p className="text-gray-500">All students are already linked to this parent.</p>
          ) : (
            <>
              <FormControl fullWidth>
                <InputLabel>Select Student</InputLabel>
                <Select value={selectedStudentId} label="Select Student" onChange={(e) => setSelectedStudentId(e.target.value)}
                  sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                  {unlinkedStudents.map((s: any) => (
                    <MenuItem key={s._id} value={s._id}>{s.firstName} {s.surName} ({s.studentID})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Relationship</InputLabel>
                <Select value={selectedRelationship} label="Relationship" onChange={(e) => setSelectedRelationship(e.target.value)}
                  sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                  <MenuItem value="father">Father</MenuItem>
                  <MenuItem value="mother">Mother</MenuItem>
                  <MenuItem value="uncle">Uncle</MenuItem>
                  <MenuItem value="aunt">Aunt</MenuItem>
                  <MenuItem value="guardian">Guardian</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <Button color="tertiary" variant="contained" onClick={handleLinkStudent} disabled={linking}
                sx={{ color: "white", borderRadius: "10px", paddingY: "12px", width: "fit-content" }}>
                {linking ? "Linking..." : "Link Student"}
              </Button>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <MessageModal column
        desc={`This will permanently remove ${parent.title} ${parent.firstName} ${parent.surName}. Are you sure?`}
        openModal={openDelete} closeModal={() => setOpenDelete(false)}
        handleClick={handleDeleteParent} btn1Name="Yes, Delete" />
    </>
  );
}

// ===== MAIN ADMISSIONS PAGE =====
export default function Admissions() {
  const [presentStep, setPresentStep] = useState(1);
  const [searchParams] = useSearchParams();
  const isProfile = searchParams.get("profile");

  if (isProfile === "student") return <StudentProfileView />;
  if (isProfile === "parent") return <ParentProfileView />;

  const stepComponents: Record<number, JSX.Element> = {
    1: <Student />,
    2: <Parent />,
  };

  return (
    <div>
      <div className="mb-[22px]">
        <div className="flex items-center w-full">
          {steps.map((step) => (
            <button key={step.id} onClick={() => setPresentStep(step.id)}
              className={`text-center text-lg ${step.id === presentStep ? "custom-rule relative" : ""} py-[15px] px-[62px]`}>
              {step.name}
            </button>
          ))}
        </div>
        <hr className="border border-[#CCE9F4]" />
      </div>
      {stepComponents[presentStep]}
    </div>
  );
}

const steps = [
  { id: 1, name: "Student" },
  { id: 2, name: "Parent" },
];