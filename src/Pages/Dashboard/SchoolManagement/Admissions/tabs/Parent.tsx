import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

import DashboardCard from "../../../../../Components/DashboardCard";
import FilterComponent from "../../../../../Components/FilterComponent";
import SearchInput from "../../../../../Components/Forms/SearchInput";
import TableComponent from "../../../../../Components/Tables";
import Modal from "../../../../../Components/Modals";
import MessageModal from "../../../../../Components/Modals/MessageModal";
import ValidatedInput from "../../../../../Components/Forms/ValidatedInput";
import { useForm, FormProvider } from "react-hook-form";
import SERVER from "../../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../../Utils/toastOptions";
import Loader from "../../../../loaders/Loader";

export default function Parent() {
  const [openAddParent, setOpenAddParent] = useState(false);
  const [openDeleteParent, setOpenDeleteParent] = useState(false);
  const [parentToDelete, setParentToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedMarital, setSelectedMarital] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const methods = useForm({ mode: "all" });

  // Fetch all parents
  const { data: parentsData, isPending } = useQuery({
    queryKey: ['all-parents'],
    queryFn: async () => { const res = await SERVER.get('parent'); return res?.data; },
    retry: false,
  });

  // Fetch all students to show ward count
  const { data: studentsData } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => { const res = await SERVER.get('student'); return res?.data; },
    retry: false,
  });

  const parents = parentsData?.data || [];
  const students = studentsData?.data || [];
  const totalParents = parents.length;

  // Count linked students per parent
  const getLinkedStudents = (parentId: string) => {
    return students.filter((s: any) =>
      s.guardians?.some((g: any) => g.parentId === parentId)
    );
  };

  const filteredParents = parents.filter((p: any) => {
    if (!searchTerm) return true;
    const name = `${p.firstName} ${p.surName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || p.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const tableData = filteredParents.map((parent: any, i: number) => {
    const linked = getLinkedStudents(parent._id);
    return {
      sn: i + 1,
      guardian: `${parent.title || ''} ${parent.firstName} ${parent.surName}`.trim(),
      email: parent.email || '-',
      number: parent.phoneNumber || '-',
      ward: linked.length > 0
        ? `${linked.length} student${linked.length > 1 ? 's' : ''}`
        : 'No student linked',
      actions: '',
      id: parent._id,
    };
  });

  const headcells = [
    { key: "sn", name: "S/N" },
    { key: "guardian", name: "Parent/Guardian" },
    { key: "email", name: "Email Address" },
    { key: "number", name: "Phone Number" },
    { key: "ward", name: "Ward(s)" },
    {
      key: "actions",
      name: [
        {
          name: "View profile",
          handleClick: (row: any) => navigate(`?profile=parent&id=${row.id}`),
        },
        {
          name: "Delete parent",
          handleClick: (row: any) => {
            setParentToDelete(row);
            setOpenDeleteParent(true);
          },
        },
      ],
    },
  ];

  const handleAddParent = async (data: any) => {
    if (!selectedGender || !selectedMarital) {
      toast.error("Please select gender and marital status", toastOptions);
      return;
    }
    setSaving(true);
    try {
      await SERVER.post('parent', {
        title: data.title,
        firstName: data.firstName,
        surName: data.surName,
        gender: selectedGender,
        maritalStatus: selectedMarital,
        email: data.email,
        phoneNumber: data.phoneNumber,
        occupation: data.occupation,
        country: data.country || "Nigeria",
        address: {
          number: parseInt(data.addrNumber) || 0,
          street: data.street || "",
          city: data.city || "",
          state: data.state || "",
          postalCode: data.postalCode || "",
          country: data.country || "Nigeria",
        },
      });
      toast.success('Parent/Guardian added successfully!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-parents'] });
      resetForm();
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || 'Failed to add parent';
      toast.error(errMsg, toastOptions);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!parentToDelete) return;
    try {
      await SERVER.delete(`parent/${parentToDelete.id}`);
      toast.success('Parent deleted!', toastOptions);
      queryClient.invalidateQueries({ queryKey: ['all-parents'] });
      setOpenDeleteParent(false);
      setParentToDelete(null);
    } catch (error: any) {
      toast.error('Failed to delete parent', toastOptions);
    }
  };

  const resetForm = () => {
    methods.reset();
    setSelectedGender("");
    setSelectedMarital("");
    setOpenAddParent(false);
  };

  // ===== DOWNLOAD FUNCTIONS =====
  const downloadCSV = () => {
    const headers = ['S/N', 'Title', 'First Name', 'Surname', 'Gender', 'Marital Status', 'Email', 'Phone', 'Occupation', 'Linked Students'];
    const rows = filteredParents.map((p: any, i: number) => {
      const linked = getLinkedStudents(p._id);
      return [
        i + 1, p.title || '', p.firstName || '', p.surName || '', p.gender || '',
        p.maritalStatus || '', p.email || '', p.phoneNumber || '', p.occupation || '',
        linked.map((s: any) => `${s.firstName} ${s.surName}`).join('; ') || 'None',
      ];
    });
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `parents_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV downloaded!', toastOptions);
  };

  const printPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const tableRows = filteredParents.map((p: any, i: number) => {
      const linked = getLinkedStudents(p._id);
      return `<tr><td>${i+1}</td><td>${p.title || ''} ${p.firstName || ''} ${p.surName || ''}</td><td>${p.email || '-'}</td><td>${p.phoneNumber || '-'}</td><td>${p.occupation || '-'}</td><td>${linked.length}</td></tr>`;
    }).join('');
    printWindow.document.write(`
      <html><head><title>Parent Records</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 20px; margin-bottom: 5px; }
        p { color: #666; font-size: 12px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #0E7094; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style></head><body>
      <h1>Parent/Guardian Records</h1>
      <p>Generated on ${new Date().toLocaleDateString()} &bull; Total: ${filteredParents.length} parents</p>
      <table><thead><tr><th>S/N</th><th>Name</th><th>Email</th><th>Phone</th><th>Occupation</th><th>Wards</th></tr></thead>
      <tbody>${tableRows}</tbody></table></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const [choiceDownload, setChoiceDownload] = useState("Download");
  const menuOptionsDownloadList = [
    { label: "Export as CSV (Excel)", value: "csv", handleClick: () => downloadCSV() },
    { label: "Export as PDF (Print)", value: "pdf", handleClick: () => printPDF() },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-6 mb-11">
        <DashboardCard bgColor="bg-bg-4" label="Total Parents/Guardians" value={String(totalParents)} />
      </div>

      <div className="flex items-center justify-between mb-10">
        <SearchInput placeholder="Search parent..." otherClass="border border-[#ABABAB] rounded-[5px] px-4 max-w-[251px]" onChange={(e: any) => setSearchTerm(e.target.value)} />
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
          <Button color="tertiary" variant="contained" onClick={() => setOpenAddParent(true)}
            sx={{ color: "white", borderRadius: "10px", paddingY: "10px", paddingX: "20px" }}>
            Add Parent/Guardian
          </Button>
        </div>
      </div>

      {isPending ? <Loader /> : (
        <TableComponent headcells={headcells} tableData={tableData}
          handleClick1={() => setOpenAddParent(true)} btn1Name="Add Parent/Guardian" message="No parents registered yet" />
      )}

      {/* Add Parent Modal */}
      <Modal openModal={openAddParent} closeModal={resetForm} title="Add Parent/Guardian" maxWidth="700px">
        <FormProvider {...methods}>
          <div className="flex flex-col gap-y-5">
            <div className="grid grid-cols-3 gap-4">
              <ValidatedInput name="title" label="Title *" placeholder="Mr/Mrs/Dr" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              <ValidatedInput name="firstName" label="First Name *" placeholder="First name" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              <ValidatedInput name="surName" label="Surname *" placeholder="Surname" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormControl fullWidth>
                <InputLabel>Gender *</InputLabel>
                <Select value={selectedGender} label="Gender *" onChange={(e) => setSelectedGender(e.target.value)} sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Marital Status *</InputLabel>
                <Select value={selectedMarital} label="Marital Status *" onChange={(e) => setSelectedMarital(e.target.value)} sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}>
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="married">Married</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput name="email" label="Email *" placeholder="Email address" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              <ValidatedInput name="phoneNumber" label="Phone *" placeholder="Phone number" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput name="occupation" label="Occupation *" placeholder="Occupation" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              <ValidatedInput name="country" label="Country *" placeholder="Nigeria" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <ValidatedInput name="addrNumber" label="House No." placeholder="No." otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              <ValidatedInput name="street" label="Street" placeholder="Street" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              <ValidatedInput name="city" label="City" placeholder="City" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput name="state" label="State" placeholder="State" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
              <ValidatedInput name="postalCode" label="Postal Code" placeholder="Postal code" otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]" />
            </div>
            <Button color="tertiary" variant="contained" type="button" disabled={saving}
              onClick={methods.handleSubmit(handleAddParent)}
              sx={{ color: "white", borderRadius: "10px", paddingY: "12px", width: "fit-content" }}>
              {saving ? "Saving..." : "Add Parent/Guardian"}
            </Button>
          </div>
        </FormProvider>
      </Modal>

      {/* Delete Modal */}
      <MessageModal column
        desc={`This will remove "${parentToDelete?.guardian}" from the system. Are you sure?`}
        openModal={openDeleteParent}
        closeModal={() => { setOpenDeleteParent(false); setParentToDelete(null); }}
        handleClick={handleDelete} btn1Name="Yes, Delete" />
    </div>
  );
}