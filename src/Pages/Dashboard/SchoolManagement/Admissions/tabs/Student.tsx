import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import { DashboardCard2 } from "../../../../../Components/DashboardCard";
import FilterComponent from "../../../../../Components/FilterComponent";
import SearchInput from "../../../../../Components/Forms/SearchInput";
import TableComponent from "../../../../../Components/Tables";
import Modal from "../../../../../Components/Modals";
import MessageModal from "../../../../../Components/Modals/MessageModal";
import ValidatedInput from "../../../../../Components/Forms/ValidatedInput";
import { useForm, FormProvider } from "react-hook-form";
import SERVER from "../../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClassArms, useClassLevels, useSessionTerm } from "../../../../../services/api-call";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../../Utils/toastOptions";
import Loader from "../../../../loaders/Loader";
import { statesData } from "../../../../../Data/statesData";

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELIGIONS = ['Islam', 'Christianity', 'Traditional', 'Other'];
const NATIONALITIES = ['Nigerian', 'Ghanaian', 'Cameroonian', 'Togolese', 'Beninese', 'South African', 'Kenyan', 'British', 'American', 'Canadian', 'Indian', 'Other'];
const COUNTRIES = ['Nigeria', 'Ghana', 'Cameroon', 'Togo', 'Benin', 'South Africa', 'Kenya', 'United Kingdom', 'United States', 'Canada', 'India', 'Other'];

const STEPS = ["Personal Info", "Contact & Address", "Academic Info", "Medical & Emergency", "Parent/Guardian"];

export default function Student() {
  const [choiceStatus, setChoiceStatus] = useState("All students");
  const [openAddStudent, setOpenAddStudent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedClassArmId, setSelectedClassArmId] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [selectedReligion, setSelectedReligion] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("Nigerian");
  const [selectedCountry, setSelectedCountry] = useState("Nigeria");
  const [selectedState, setSelectedState] = useState("");
  const [selectedLGA, setSelectedLGA] = useState("");
  const [studentToAction, setStudentToAction] = useState<any>(null);
  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [parentMode, setParentMode] = useState<"skip" | "existing" | "new">("skip");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedRelationship, setSelectedRelationship] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const methods = useForm({ mode: "all" });

  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const classArms = allArms?.data?.data?.data || [];
  const classLevels = allLevels?.data?.data?.data || [];

  const { data: studentsData, isPending } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => { const res = await SERVER.get('student'); return res?.data; },
    retry: false,
  });

  const { data: parentsData } = useQuery({
    queryKey: ['all-parents'],
    queryFn: async () => { const res = await SERVER.get('parent'); return res?.data; },
    retry: false,
  });

  const allParents = parentsData?.data || [];
 
    const students = studentsData?.data || [];
    const totalStudents = students.length;
    const activeStudents = students.filter((s: any) => s.status === "active").length;
    const deactivatedStudents = students.filter((s: any) => s.status === "deactivated").length;
    const maleStudents = students.filter((s: any) => s.gender === "male").length;
    const femaleStudents = students.filter((s: any) => s.gender === "female").length;
 
    // ===== FEE STATUS SETUP =====
    // Get current session and active term
    const sessionInfo = useSessionTerm();
    const activeSession = sessionInfo?.data?.data?.data?.session;
    const activeTerm = sessionInfo?.data?.data?.data?.term;
 
    // Fetch all terms in the current session (for finding a reference term when on holiday)
    const { data: termsData } = useQuery({
      queryKey: ['session-terms', activeSession?._id],
      queryFn: async () => {
        const res = await SERVER.get(`session/term/${activeSession._id}`);
        return res?.data?.data || [];
      },
      enabled: !!activeSession?._id,
      retry: false,
    });
    const terms = termsData || [];
 
    // Determine the "reference term" for fee status:
    // If a term is active, use that. Otherwise, use most recently started term.
    const referenceTerm = (() => {
      if (activeTerm?._id) return activeTerm;
 
      const now = new Date();
      const parseDate = (d: any) => d ? new Date(d) : null;
      const endOfDay = (d: Date) => { const e = new Date(d); e.setHours(23, 59, 59, 999); return e; };
      const startOfDay = (d: Date) => { const s = new Date(d); s.setHours(0, 0, 0, 0); return s; };
 
      // Priority 2: term where today falls between start and end
      const current = terms.find((t: any) => {
        const s = parseDate(t.termStartDate);
        const e = parseDate(t.termEndDate);
        return s && e && startOfDay(s) <= now && now <= endOfDay(e);
      });
      if (current) return current;
 
      // Priority 3: next upcoming term (earliest future start date)
      const upcoming = [...terms]
        .filter((t: any) => {
          const s = parseDate(t.termStartDate);
          return s && s > now;
        })
        .sort((a: any, b: any) =>
          new Date(a.termStartDate).getTime() - new Date(b.termStartDate).getTime()
        );
      if (upcoming.length > 0) return upcoming[0];
 
      // Priority 4: most recently completed term
      const completed = [...terms]
        .filter((t: any) => {
          const e = parseDate(t.termEndDate);
          return e && endOfDay(e) < now;
        })
        .sort((a: any, b: any) =>
          new Date(b.termEndDate).getTime() - new Date(a.termEndDate).getTime()
        );
      return completed[0] || null;
    })();
 
    // Fetch all fees
    const { data: feesData } = useQuery({
      queryKey: ['all-fees'],
      queryFn: async () => { const res = await SERVER.get('fee'); return res?.data; },
      retry: false,
    });
    const allFees = feesData?.data || [];
 
    // Fetch all payments (we'll filter per student in the table)
    // Note: we hit the "get by student" endpoint for each student via React Query below
    // A better approach would be a "get all school payments" endpoint — can add later
    const { data: allPaymentsData } = useQuery({
      queryKey: ['all-school-payments', activeSession?._id],
      queryFn: async () => {
        // Gather all payments for each fee in the reference term
        if (!referenceTerm?._id) return [];
        const feesInTerm = allFees.filter((f: any) => f.termId === referenceTerm._id);
        const results = await Promise.all(
          feesInTerm.map((fee: any) =>
            SERVER.get(`payment/fee/${fee._id}`).then(r => r?.data?.data || []).catch(() => [])
          )
        );
        return results.flat();
      },
      enabled: !!referenceTerm?._id && allFees.length > 0,
      retry: false,
    });
    const allPayments = allPaymentsData || [];
 
    // Helper: compute fee status for a given student
    const getStudentFeeStatus = (student: any) => {
      if (!referenceTerm?._id) return { label: 'N/A', color: 'gray' };
 
      // Find the fee for this student's class in the reference term
      const fee = allFees.find(
        (f: any) => f.classArmId === student.classArmId && f.termId === referenceTerm._id
      );
      if (!fee) return { label: 'No fee', color: 'gray' };
 
      const totalOwed = fee.fees?.reduce(
        (s: number, f: any) => s + (parseFloat(f.amount) || 0), 0
      ) || 0;
      const paid = allPayments
        .filter((p: any) => p.studentId === student._id && p.feeId === fee._id)
        .reduce((s: number, p: any) => s + (p.amount || 0), 0);
 
      if (paid >= totalOwed) return { label: 'Paid', color: 'green' };
      if (paid > 0) return { label: 'Partial', color: 'yellow' };
      return { label: 'Unpaid', color: 'red' };
    };

  const getArmLabel = (classArmId: string) => {
    const arm = classArms.find((a: any) => a._id === classArmId);
    if (!arm) return '';
    const level = classLevels.find((l: any) => l._id === arm.classLevelId);
    return `${level?.levelShortName || ''} ${arm.armName?.toUpperCase() || ''}`.trim();
  };

  const filteredStudents = students
    .filter((s: any) => {
      if (choiceStatus === "Active students") return s.status === "active";
      if (choiceStatus === "Deactivated students") return s.status === "deactivated";
      return true;
    })
    .filter((s: any) => {
      if (!searchTerm) return true;
      const name = `${s.firstName} ${s.surName}`.toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || s.studentID?.toLowerCase().includes(searchTerm.toLowerCase());
    });

  const tableData = filteredStudents.map((student: any, i: number) => {
    const feeStatus = getStudentFeeStatus(student);
    const feeStatusColors: Record<string, string> = {
      green: 'bg-green-100 text-green-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      red: 'bg-red-100 text-red-700',
      gray: 'bg-gray-100 text-gray-600',
    };
    return {
      sn: i + 1,
      student: (
        <div className="flex gap-x-3 items-center">
          <Avatar sx={{ width: 36, height: 36 }} src={student.photo || ""} alt={student.firstName?.[0]} />
          <div className="flex flex-col">
            <p className="text-sm font-medium">{student.firstName} {student.surName}</p>
            <p className="text-xs text-gray-500">{student.studentID}</p>
          </div>
        </div>
      ),
      gender: student.gender === "male" ? "M" : "F",
      level: getArmLabel(student.classArmId),
      feeStatus: (
        <span className={`px-3 py-1 rounded text-xs font-medium ${feeStatusColors[feeStatus.color]}`}>
          {feeStatus.label}
        </span>
      ),
      status: (
        <span className={`px-3 py-1 rounded text-xs font-medium ${student.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {student.status}
        </span>
      ),
      actions: '',
      id: student._id,
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
          name: "View profile",
          handleClick: (row: any) =>
            navigate(`?profile=student&id=${row.id}`, { state: { from: location.pathname } }),
        },
        {
          name: "Deactivate / Activate",
          handleClick: (row: any) => {
            setStudentToAction(row);
            setOpenDeactivate(true);
          },
        },
        {
          name: "Delete student",
          handleClick: (row: any) => {
            setStudentToAction(row);
            setOpenDelete(true);
          },
        },
      ],
    },
  ];

  const handleDeactivateActivate = async () => {
    if (!studentToAction) return;
    const student = students.find((s: any) => s._id === studentToAction.id);
    const action = student?.status === "active" ? "deactivate" : "activate";
    try {
      await SERVER.put(`student/${action}/${studentToAction.id}`);
      toast.success(`Student ${action}d successfully!`, toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      setOpenDeactivate(false);
      setStudentToAction(null);
    } catch (error: any) {
      toast.error(`Failed to ${action} student`, toastOptions);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToAction) return;
    try {
      await SERVER.delete(`student/${studentToAction.id}`);
      toast.success('Student deleted successfully!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      setOpenDelete(false);
      setStudentToAction(null);
    } catch (error: any) {
      toast.error('Failed to delete student', toastOptions);
    }
  };

  const handleAddStudent = async (data: any) => {
    if (!selectedClassArmId || !selectedGender) {
      toast.error("Please select a class and gender", toastOptions);
      return;
    }
    if (!selectedState || !selectedLGA) {
      toast.error("Please select state and LGA", toastOptions);
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        firstName: data.firstName,
        surName: data.surName,
        otherName: data.otherName || "",
        email: data.email || "",
        classArmId: selectedClassArmId,
        gender: selectedGender,
        dateOfBirth: data.dateOfBirth,
        phoneNumber: data.phoneNumber || "",
        country: selectedCountry,
        stateOfOrigin: selectedState,
        localGovernmentArea: selectedLGA,
        address: {
          street: data.street || "",
          city: data.city || "",
          state: selectedState,
          country: selectedCountry,
        },
        bloodGroup: selectedBloodGroup,
        religion: selectedReligion,
        nationality: selectedNationality,
        previousSchool: data.previousSchool || "",
        lastClassAttended: data.lastClassAttended || "",
        reasonForLeaving: data.reasonForLeaving || "",
        medicalInfo: {
          allergies: data.allergies || "",
          disabilities: data.disabilities || "",
          medicalConditions: data.medicalConditions || "",
        },
        emergencyContact: {
          name: data.emergencyName || "",
          phone: data.emergencyPhone || "",
          relationship: data.emergencyRelationship || "",
        },
      };

      // Add parent data if provided
      if (parentMode === "existing" && selectedParentId) {
        payload.parentID = selectedParentId;
        payload.relationship = selectedRelationship;
      } else if (parentMode === "new") {
        payload.parentTitle = data.parentTitle || "";
        payload.parentFirstName = data.parentFirstName || "";
        payload.parentSurName = data.parentSurName || "";
        payload.parentGender = data.parentGender || "male";
        payload.maritalStatus = data.parentMaritalStatus || "married";
        payload.parentEmail = data.parentEmail || "";
        payload.parentPhoneNumber = data.parentPhone || "";
        payload.parentCountry = data.parentCountry || "Nigeria";
        payload.occupation = data.parentOccupation || "";
        payload.relationship = selectedRelationship;
        payload.parentAddress = {
          number: 0,
          street: data.parentStreet || "",
          city: data.parentCity || "",
          state: data.parentState || "",
          postalCode: "",
          country: data.parentCountry || "Nigeria",
        };
      }

      const res = await SERVER.post('student/register', payload);
      const studentId = res?.data?.data?.student?.studentID;
      toast.success(`Student registered! ID: ${studentId}`, toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      resetForm();
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || 'Failed to register student';
      toast.error(errMsg, toastOptions);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    methods.reset();
    setSelectedClassArmId("");
    setSelectedGender("");
    setSelectedBloodGroup("");
    setSelectedReligion("");
    setSelectedNationality("Nigerian");
    setSelectedCountry("Nigeria");
    setSelectedState("");
    setSelectedLGA("");
    setParentMode("skip");
    setSelectedParentId("");
    setSelectedRelationship("");
    setStep(0);
    setOpenAddStudent(false);
  };

  const nextStep = () => { if (step < STEPS.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  // ===== DOWNLOAD FUNCTIONS =====
  const downloadCSV = () => {
    const headers = ['S/N', 'Student ID', 'First Name', 'Surname', 'Other Name', 'Gender', 'Date of Birth', 'Class', 'Email', 'Phone', 'Country', 'State', 'LGA', 'Status', 'Blood Group', 'Religion', 'Nationality', 'Previous School'];
    const rows = filteredStudents.map((s: any, i: number) => [
      i + 1,
      s.studentID || '',
      s.firstName || '',
      s.surName || '',
      s.otherName || '',
      s.gender || '',
      s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : '',
      getArmLabel(s.classArmId),
      s.email || '',
      s.phoneNumber || '',
      s.country || '',
      s.stateOfOrigin || '',
      s.localGovernmentArea || '',
      s.status || '',
      s.bloodGroup || '',
      s.religion || '',
      s.nationality || '',
      s.previousSchool || '',
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV downloaded!', toastOptions);
  };

  const printPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const tableRows = filteredStudents.map((s: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td>${s.studentID || ''}</td>
        <td>${s.firstName || ''} ${s.surName || ''}</td>
        <td>${s.gender === 'male' ? 'M' : 'F'}</td>
        <td>${getArmLabel(s.classArmId)}</td>
        <td>${s.email || '-'}</td>
        <td>${s.phoneNumber || '-'}</td>
        <td>${s.status || ''}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html><head><title>Student Records</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 20px; margin-bottom: 5px; }
        p { color: #666; font-size: 12px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #0E7094; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <h1>Student Records</h1>
      <p>Generated on ${new Date().toLocaleDateString()} &bull; Total: ${filteredStudents.length} students</p>
      <table>
        <thead><tr><th>S/N</th><th>ID</th><th>Name</th><th>Gender</th><th>Class</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const [choiceDownload, setChoiceDownload] = useState("Download");
  const [choiceAdd, setChoiceAdd] = useState("Add Student");
  const [openBulkUpload, setOpenBulkUpload] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, errors: 0 });

  const menuOptionsDownloadList = [
    { label: "Export as CSV (Excel)", value: "csv", handleClick: () => downloadCSV() },
    { label: "Export as PDF (Print)", value: "pdf", handleClick: () => printPDF() },
  ];

  const menuOptionsAdd = [
    { label: "Manual Registration", value: "manual", handleClick: () => setOpenAddStudent(true) },
    { label: "Bulk Upload (CSV)", value: "bulk", handleClick: () => setOpenBulkUpload(true) },
  ];

  // ===== BULK UPLOAD FUNCTIONS =====
  const downloadTemplate = () => {
    const headers = ['firstName', 'surName', 'otherName', 'gender', 'dateOfBirth', 'email', 'phoneNumber', 'className', 'country', 'stateOfOrigin', 'localGovernmentArea', 'street', 'city', 'state', 'bloodGroup', 'religion', 'nationality', 'previousSchool', 'lastClassAttended', 'reasonForLeaving', 'allergies', 'disabilities', 'medicalConditions', 'emergencyName', 'emergencyPhone', 'emergencyRelationship'];
    const sampleRow = ['John', 'Doe', '', 'male', '2010-05-15', 'john@email.com', '08012345678', 'JSS1 A', 'Nigeria', 'Lagos', 'Ikeja', '10 Allen Avenue', 'Ikeja', 'Lagos', 'O+', 'Christianity', 'Nigerian', 'Previous Primary School', 'Primary 6', 'Graduated', '', '', '', 'Mrs Doe', '08098765432', 'mother'];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'student_upload_template.csv';
    link.click();
    toast.success('Template downloaded!', toastOptions);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return { data: [], errors: ['File is empty or has no data rows'] };
    
    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Flexible header mapping — maps common variations to our expected field names
    const headerMap: Record<string, string> = {};
    const mappings: Record<string, string[]> = {
      'firstName': ['firstname', 'first name', 'first_name', 'fname', 'given name'],
      'surName': ['surname', 'sur name', 'sur_name', 'lastname', 'last name', 'last_name', 'lname', 'family name'],
      'otherName': ['othername', 'other name', 'other_name', 'middlename', 'middle name', 'middle_name'],
      'gender': ['gender', 'sex'],
      'dateOfBirth': ['dateofbirth', 'date of birth', 'date_of_birth', 'dob', 'birthday', 'birth date', 'birth_date'],
      'email': ['email', 'email address', 'emailaddress', 'e-mail'],
      'phoneNumber': ['phonenumber', 'phone number', 'phone_number', 'phone', 'mobile', 'tel', 'telephone'],
      'className': ['classname', 'class name', 'class_name', 'class', 'class arm', 'classarm'],
      'country': ['country', 'nation'],
      'stateOfOrigin': ['stateoforigin', 'state of origin', 'state_of_origin', 'state'],
      'localGovernmentArea': ['localgovernmentarea', 'local government area', 'local_government_area', 'lga', 'local government', 'local govt'],
      'street': ['street', 'street address', 'address'],
      'city': ['city', 'town'],
      'state': ['addressstate', 'addr state', 'address state', 'residential state'],
      'bloodGroup': ['bloodgroup', 'blood group', 'blood_group', 'blood type'],
      'religion': ['religion', 'faith'],
      'nationality': ['nationality', 'citizen'],
      'previousSchool': ['previousschool', 'previous school', 'previous_school', 'former school'],
      'lastClassAttended': ['lastclassattended', 'last class attended', 'last_class_attended', 'last class'],
      'reasonForLeaving': ['reasonforleaving', 'reason for leaving', 'reason_for_leaving', 'reason'],
      'allergies': ['allergies', 'allergy'],
      'disabilities': ['disabilities', 'disability'],
      'medicalConditions': ['medicalconditions', 'medical conditions', 'medical_conditions', 'health conditions'],
      'emergencyName': ['emergencyname', 'emergency name', 'emergency_name', 'emergency contact name', 'emergency contact'],
      'emergencyPhone': ['emergencyphone', 'emergency phone', 'emergency_phone', 'emergency contact phone', 'emergency number'],
      'emergencyRelationship': ['emergencyrelationship', 'emergency relationship', 'emergency_relationship'],
    };

    rawHeaders.forEach((rawH, idx) => {
      const normalized = rawH.toLowerCase().trim();
      let matched = false;
      for (const [field, aliases] of Object.entries(mappings)) {
        if (aliases.includes(normalized) || normalized === field.toLowerCase()) {
          headerMap[idx] = field;
          matched = true;
          break;
        }
      }
      if (!matched) {
        headerMap[idx] = rawH; // Keep original if no match
      }
    });

    const headers = rawHeaders.map((_, idx) => headerMap[idx] || rawHeaders[idx]);
    const rows: any[] = [];
    const errors: string[] = [];

    // Check required fields after mapping
    const requiredFields = ['firstName', 'surName', 'gender', 'dateOfBirth', 'className', 'country', 'stateOfOrigin', 'localGovernmentArea'];
    const missingFields = requiredFields.filter(f => !headers.includes(f));
    if (missingFields.length > 0) {
      return { data: [], errors: [`Could not find required columns: ${missingFields.join(', ')}. Found columns: ${rawHeaders.join(', ')}`] };
    }

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of lines[i]) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
        else { current += char; }
      }
      values.push(current.trim());

      const row: any = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      const rowErrors: string[] = [];
      if (!row.firstName) rowErrors.push('first name missing');
      if (!row.surName) rowErrors.push('surname missing');
      if (!row.gender || !['male', 'female'].includes(row.gender.toLowerCase())) rowErrors.push('gender must be male/female');
      if (!row.dateOfBirth) rowErrors.push('date of birth missing');
      if (!row.className) rowErrors.push('class missing');
      if (!row.country) rowErrors.push('country missing');
      if (!row.stateOfOrigin) rowErrors.push('state missing');
      if (!row.localGovernmentArea) rowErrors.push('LGA missing');

      const matchedArm = classArms.find((arm: any) => {
        const level = classLevels.find((l: any) => l._id === arm.classLevelId);
        const label = `${level?.levelShortName || ''} ${arm.armName?.toUpperCase() || ''}`.trim();
        return label.toLowerCase() === row.className?.toLowerCase()?.trim();
      });

      if (!matchedArm && row.className) rowErrors.push(`class "${row.className}" not found`);

      row._classArmId = matchedArm?._id || null;
      row._rowNum = i + 1;
      row._errors = rowErrors;
      row._valid = rowErrors.length === 0;
      rows.push(row);

      if (rowErrors.length > 0) {
        errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`);
      }
    }

    return { data: rows, errors };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file', toastOptions);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { data, errors } = parseCSV(text);
      setCsvData(data);
      setCsvErrors(errors);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset so same file can be re-uploaded
  };

  const handleBulkImport = async () => {
    const validRows = csvData.filter(r => r._valid);
    if (validRows.length === 0) {
      toast.error('No valid rows to import', toastOptions);
      return;
    }

    setImporting(true);
    setImportProgress({ done: 0, total: validRows.length, errors: 0 });
    let errorCount = 0;
    const importErrors: string[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await SERVER.post('student/register', {
          firstName: row.firstName,
          surName: row.surName,
          otherName: row.otherName || '',
          gender: row.gender.toLowerCase(),
          dateOfBirth: row.dateOfBirth,
          email: row.email || '',
          phoneNumber: row.phoneNumber || '',
          classArmId: row._classArmId,
          country: row.country,
          stateOfOrigin: row.stateOfOrigin,
          localGovernmentArea: row.localGovernmentArea,
          address: {
            street: row.street || '',
            city: row.city || '',
            state: row.state || '',
            country: row.country || '',
          },
          bloodGroup: row.bloodGroup || '',
          religion: row.religion || '',
          nationality: row.nationality || 'Nigerian',
          previousSchool: row.previousSchool || '',
          lastClassAttended: row.lastClassAttended || '',
          reasonForLeaving: row.reasonForLeaving || '',
          medicalInfo: {
            allergies: row.allergies || '',
            disabilities: row.disabilities || '',
            medicalConditions: row.medicalConditions || '',
          },
          emergencyContact: {
            name: row.emergencyName || '',
            phone: row.emergencyPhone || '',
            relationship: row.emergencyRelationship || '',
          },
        });
      } catch (err: any) {
        errorCount++;
        const errMsg = err?.response?.data?.error || 'Unknown error';
        importErrors.push(`Row ${row._rowNum}: ${errMsg}`);
      }
      setImportProgress({ done: i + 1, total: validRows.length, errors: errorCount });
    }

    queryClient.invalidateQueries({ queryKey: ['all-students'] });
    if (errorCount === 0) {
      toast.success(`All ${validRows.length} students imported successfully!`, toastOptions);
      setImporting(false);
      setCsvData([]);
      setCsvErrors([]);
      setOpenBulkUpload(false);
    } else {
      toast.success(`Imported ${validRows.length - errorCount} of ${validRows.length} students`, toastOptions);
      toast.error(`${errorCount} failed — see details below`, toastOptions);
      setCsvErrors(importErrors);
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-y-2 flex-wrap mb-11">
        <DashboardCard2 bgColor="bg-bg-4" label="Total Students" val1={String(totalStudents)} val2={String(maleStudents)} val3={String(femaleStudents)} />
        <DashboardCard2 bgColor="bg-bg-5" label="Active Students" val1={String(activeStudents)} val2="0" val3="0" />
        <DashboardCard2 bgColor="bg-bg-6" label="Deactivated" val1={String(deactivatedStudents)} val2="0" val3="0" />
      </div>

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-x-5">
          <SearchInput placeholder="Search student..." otherClass="border border-[#ABABAB] rounded-[5px] px-4 max-w-[251px]" onChange={(e: any) => setSearchTerm(e.target.value)} />
          <FilterComponent menuOptions={menuOptionsStatus} choice={choiceStatus} setChoice={setChoiceStatus} otherClasses2="px-4 py-4" textColor="text-black" />
        </div>
        <div className="flex items-center gap-x-3">
          <FilterComponent
            menuOptions={menuOptionsDownloadList}
            choice={choiceDownload}
            setChoice={setChoiceDownload}
            otherClasses2="px-4 py-4"
            otherClasses="border-tertiary !rounded-[10px]"
            textColor="text-tertiary"
            iconColor="#0E7094"
          />
          <FilterComponent
            menuOptions={menuOptionsAdd}
            choice={choiceAdd}
            setChoice={setChoiceAdd}
            otherClasses2="px-4 py-4"
            otherClasses="bg-tertiary !rounded-[10px]"
            textColor="text-white"
            iconColor="white"
          />
        </div>
      </div>

      {isPending ? <Loader /> : (
        <TableComponent headcells={headcells} tableData={tableData} handleClick1={() => setOpenAddStudent(true)} btn1Name="Register Student" message="No students registered yet" />
      )}

      {/* Multi-step Add Student Modal */}
      <Modal openModal={openAddStudent} closeModal={resetForm} title="Student Admission" maxWidth="750px">
        <FormProvider {...methods}>
          <div>
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((s, i) => (
                <div key={i} className={`flex items-center gap-1 ${i <= step ? 'text-[#0E7094]' : 'text-gray-400'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-[#0E7094] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <span className="text-xs hidden sm:inline">{s}</span>
                  {i < STEPS.length - 1 && <div className={`w-6 h-[2px] ${i < step ? 'bg-[#0E7094]' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Personal Info */}
            {step === 0 && (
              <div className="flex flex-col gap-y-4">
                <p className="font-semibold text-black text-lg mb-2">Personal Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <ValidatedInput name="firstName" label="First Name *" placeholder="First name" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                  <ValidatedInput name="surName" label="Surname *" placeholder="Surname" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ValidatedInput name="otherName" label="Other Name" placeholder="Other name" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                  <FormControl fullWidth>
                    <InputLabel>Gender *</InputLabel>
                    <Select value={selectedGender} label="Gender *" onChange={(e) => setSelectedGender(e.target.value)} sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      {...methods.register("dateOfBirth")}
                      className="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px] p-3 text-sm"
                    />
                  </div>
                  <FormControl fullWidth>
                    <InputLabel>Blood Group</InputLabel>
                    <Select value={selectedBloodGroup} label="Blood Group" onChange={(e) => setSelectedBloodGroup(e.target.value)} sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                      <MenuItem value="">None</MenuItem>
                      {BLOOD_GROUPS.map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormControl fullWidth>
                    <InputLabel>Religion</InputLabel>
                    <Select value={selectedReligion} label="Religion" onChange={(e) => setSelectedReligion(e.target.value)} sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                      <MenuItem value="">None</MenuItem>
                      {RELIGIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Nationality</InputLabel>
                    <Select value={selectedNationality} label="Nationality" onChange={(e) => setSelectedNationality(e.target.value)} sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                      {NATIONALITIES.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Address */}
            {step === 1 && (
              <div className="flex flex-col gap-y-4">
                <p className="font-semibold text-black text-lg mb-2">Contact & Address</p>
                <div className="grid grid-cols-2 gap-4">
                  <ValidatedInput name="email" label="Email" placeholder="Email address" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                  <ValidatedInput name="phoneNumber" label="Phone Number" placeholder="Phone number" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormControl fullWidth>
                    <InputLabel>Country *</InputLabel>
                    <Select value={selectedCountry} label="Country *" onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState(""); setSelectedLGA(""); }} sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                      {COUNTRIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>State of Origin *</InputLabel>
                    <Select value={selectedState} label="State of Origin *" onChange={(e) => { setSelectedState(e.target.value); setSelectedLGA(""); }} sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                      {selectedCountry === "Nigeria" ? (
                        Object.keys(statesData).map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)
                      ) : (
                        <MenuItem value="">Type state manually below</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormControl fullWidth>
                    <InputLabel>LGA *</InputLabel>
                    <Select value={selectedLGA} label="LGA *" onChange={(e) => setSelectedLGA(e.target.value)} sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}
                      disabled={selectedCountry === "Nigeria" && !selectedState}>
                      {selectedCountry === "Nigeria" && selectedState && (statesData as any)[selectedState] ? (
                        (statesData as any)[selectedState].map((lga: any) => <MenuItem key={lga.value} value={lga.value}>{lga.label}</MenuItem>)
                      ) : (
                        <MenuItem value="">Select state first</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <ValidatedInput name="city" label="City" placeholder="City" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                </div>
                <ValidatedInput name="street" label="Street Address" placeholder="House no. & street name" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              </div>
            )}

            {/* Step 3: Academic Info */}
            {step === 2 && (
              <div className="flex flex-col gap-y-4">
                <p className="font-semibold text-black text-lg mb-2">Academic Information</p>
                <FormControl fullWidth>
                  <InputLabel>Assign to Class *</InputLabel>
                  <Select value={selectedClassArmId} label="Assign to Class *" onChange={(e) => setSelectedClassArmId(e.target.value)} sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                    {classArms.map((arm: any) => {
                      const level = classLevels.find((l: any) => l._id === arm.classLevelId);
                      return <MenuItem key={arm._id} value={arm._id}>{`${level?.levelShortName || ''} ${arm.armName?.toUpperCase()}`.trim()}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
                <ValidatedInput name="previousSchool" label="Previous School" placeholder="Name of previous school" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                <div className="grid grid-cols-2 gap-4">
                  <ValidatedInput name="lastClassAttended" label="Last Class Attended" placeholder="e.g Primary 6" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                  <ValidatedInput name="reasonForLeaving" label="Reason for Leaving" placeholder="e.g Relocation" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                </div>
              </div>
            )}

            {/* Step 4: Medical & Emergency */}
            {step === 3 && (
              <div className="flex flex-col gap-y-4">
                <p className="font-semibold text-black text-lg mb-2">Medical Information</p>
                <ValidatedInput name="allergies" label="Allergies" placeholder="Any known allergies" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                <ValidatedInput name="disabilities" label="Disabilities" placeholder="Any disabilities" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                <ValidatedInput name="medicalConditions" label="Medical Conditions" placeholder="Any medical conditions" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />

                <p className="font-semibold text-black text-lg mt-4 mb-2">Emergency Contact</p>
                <div className="grid grid-cols-2 gap-4">
                  <ValidatedInput name="emergencyName" label="Contact Name" placeholder="Full name" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                  <ValidatedInput name="emergencyPhone" label="Contact Phone" placeholder="Phone number" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                </div>
                <ValidatedInput name="emergencyRelationship" label="Relationship" placeholder="e.g Uncle, Family friend" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              </div>
            )}

            {/* Step 5: Parent/Guardian */}
            {step === 4 && (
              <div className="flex flex-col gap-y-4">
                <p className="font-semibold text-black text-lg mb-2">Parent/Guardian (Optional)</p>
                <p className="text-sm text-gray-500 mb-2">You can skip this step and link a parent later.</p>

                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50"
                    onClick={() => setParentMode("skip")}>
                    <input type="radio" name="parentMode" checked={parentMode === "skip"} onChange={() => setParentMode("skip")} />
                    <span className="text-sm">Skip — link parent later</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50"
                    onClick={() => setParentMode("existing")}>
                    <input type="radio" name="parentMode" checked={parentMode === "existing"} onChange={() => setParentMode("existing")} />
                    <span className="text-sm">Link to an existing parent/guardian</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50"
                    onClick={() => setParentMode("new")}>
                    <input type="radio" name="parentMode" checked={parentMode === "new"} onChange={() => setParentMode("new")} />
                    <span className="text-sm">Create a new parent/guardian</span>
                  </label>
                </div>

                {parentMode === "existing" && (
                  <div className="flex flex-col gap-4 mt-4">
                    <FormControl fullWidth>
                      <InputLabel>Select Parent/Guardian</InputLabel>
                      <Select value={selectedParentId} label="Select Parent/Guardian" onChange={(e) => setSelectedParentId(e.target.value)}
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
                  </div>
                )}

                {parentMode === "new" && (
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <ValidatedInput name="parentTitle" label="Title *" placeholder="Mr/Mrs/Dr" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                      <ValidatedInput name="parentFirstName" label="First Name *" placeholder="First name" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                      <ValidatedInput name="parentSurName" label="Surname *" placeholder="Surname" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ValidatedInput name="parentEmail" label="Email *" placeholder="Email" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                      <ValidatedInput name="parentPhone" label="Phone *" placeholder="Phone number" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ValidatedInput name="parentOccupation" label="Occupation *" placeholder="Occupation" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                      <ValidatedInput name="parentCountry" label="Country *" placeholder="Nigeria" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ValidatedInput name="parentStreet" label="Street" placeholder="Street address" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                      <ValidatedInput name="parentCity" label="City" placeholder="City" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
                    </div>
                    <ValidatedInput name="parentState" label="State" placeholder="State" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
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
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <div>
                {step > 0 && (
                  <Button type="button" variant="outlined" onClick={prevStep} sx={{ borderRadius: "10px", paddingY: "10px", paddingX: "25px", textTransform: "capitalize" }}>
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                {step < STEPS.length - 1 ? (
                  <Button type="button" color="tertiary" variant="contained" onClick={nextStep} sx={{ color: "white", borderRadius: "10px", paddingY: "10px", paddingX: "25px", textTransform: "capitalize" }}>
                    Next
                  </Button>
                ) : (
                  <Button color="tertiary" variant="contained" type="button" disabled={saving} onClick={methods.handleSubmit(handleAddStudent)} sx={{ color: "white", borderRadius: "10px", paddingY: "10px", paddingX: "25px", textTransform: "capitalize" }}>
                    {saving ? "Registering..." : "Register Student"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </FormProvider>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal openModal={openBulkUpload} closeModal={() => { setOpenBulkUpload(false); setCsvData([]); setCsvErrors([]); }}
        title="Bulk Upload Students" maxWidth="900px">
        <div className="flex flex-col gap-y-5">
          {/* Step 1: Download template & upload file */}
          {csvData.length === 0 ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm mb-3">
                  Download the CSV template, fill in your student data, then upload it here. 
                  The <strong>className</strong> column should match your class arms exactly (e.g. "JSS1 A", "SS2 B").
                </p>
                <Button type="button" variant="outlined" size="small" onClick={downloadTemplate}
                  sx={{ borderRadius: "8px", textTransform: "capitalize" }}>
                  Download Template
                </Button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
                <p className="text-gray-500 mb-3">Upload your filled CSV file</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="block mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0E7094] file:text-white hover:file:bg-[#0a5a73] cursor-pointer"
                />
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Preview */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-black">
                    Preview: {csvData.length} rows found, {csvData.filter((r: any) => r._valid).length} valid, {csvData.filter((r: any) => !r._valid).length} with errors
                  </p>
                </div>
                <Button type="button" variant="outlined" size="small"
                  onClick={() => { setCsvData([]); setCsvErrors([]); }}
                  sx={{ borderRadius: "8px", textTransform: "capitalize" }}>
                  Upload Different File
                </Button>
              </div>

              {csvErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-[100px] overflow-y-auto">
                  {csvErrors.map((err, i) => (
                    <p key={i} className="text-red-700 text-xs">{err}</p>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0">
                    <tr className="bg-gray-100">
                      <th className="p-2 border text-left">Row</th>
                      <th className="p-2 border text-left">Status</th>
                      <th className="p-2 border text-left">First Name</th>
                      <th className="p-2 border text-left">Surname</th>
                      <th className="p-2 border text-left">Gender</th>
                      <th className="p-2 border text-left">DOB</th>
                      <th className="p-2 border text-left">Class</th>
                      <th className="p-2 border text-left">Country</th>
                      <th className="p-2 border text-left">State</th>
                      <th className="p-2 border text-left">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.map((row: any, i: number) => (
                      <tr key={i} className={row._valid ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="p-2 border">{row._rowNum}</td>
                        <td className="p-2 border">{row._valid ? '✓' : '✗'}</td>
                        <td className="p-2 border">{row.firstName}</td>
                        <td className="p-2 border">{row.surName}</td>
                        <td className="p-2 border">{row.gender}</td>
                        <td className="p-2 border">{row.dateOfBirth}</td>
                        <td className="p-2 border">{row.className}</td>
                        <td className="p-2 border">{row.country}</td>
                        <td className="p-2 border">{row.stateOfOrigin}</td>
                        <td className="p-2 border text-red-600">{row._errors?.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import progress */}
              {importing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    Importing... {importProgress.done}/{importProgress.total} 
                    {importProgress.errors > 0 && ` (${importProgress.errors} errors)`}
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div className="bg-[#0E7094] h-2 rounded-full transition-all" 
                      style={{ width: `${(importProgress.done / importProgress.total) * 100}%` }}></div>
                  </div>
                </div>
              )}

              <Button type="button" color="tertiary" variant="contained"
                onClick={handleBulkImport}
                disabled={importing || csvData.filter((r: any) => r._valid).length === 0}
                sx={{ color: "white", borderRadius: "10px", paddingY: "12px", width: "fit-content" }}>
                {importing ? `Importing ${importProgress.done}/${importProgress.total}...` : `Import ${csvData.filter((r: any) => r._valid).length} Valid Students`}
              </Button>
            </>
          )}
        </div>
      </Modal>

      {/* Deactivate/Activate Confirmation */}
      <MessageModal
        column
        desc={`Are you sure you want to ${
          students.find((s: any) => s._id === studentToAction?.id)?.status === "active" ? "deactivate" : "activate"
        } this student?`}
        openModal={openDeactivate}
        closeModal={() => { setOpenDeactivate(false); setStudentToAction(null); }}
        handleClick={handleDeactivateActivate}
        btn1Name={students.find((s: any) => s._id === studentToAction?.id)?.status === "active" ? "Yes, Deactivate" : "Yes, Activate"}
      />

      {/* Delete Confirmation */}
      <MessageModal
        column
        desc="This will permanently remove this student from the system. Are you sure?"
        openModal={openDelete}
        closeModal={() => { setOpenDelete(false); setStudentToAction(null); }}
        handleClick={handleDeleteStudent}
        btn1Name="Yes, Delete"
      />
    </div>
  );
}

const menuOptionsStatus = [
  { label: "All students", value: "All students" },
  { label: "Active students", value: "Active students" },
  { label: "Deactivated students", value: "Deactivated students" },
];

// Exported for use in other components
export const menuOptionsDownload = [
  { label: "PDF Format", value: "PDF Format" },
  { label: "Excel Format", value: "Excel Format" },
];