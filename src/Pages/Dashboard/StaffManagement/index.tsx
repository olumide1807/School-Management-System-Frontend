import { useState } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel, Avatar } from "@mui/material";
import { Search, PersonAdd } from "@mui/icons-material";
import Modal from "../../../Components/Modals";
import MessageModal from "../../../Components/Modals/MessageModal";
import TableComponent from "../../../Components/Tables";
import SERVER from "../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../../Utils/toastOptions";
import Loader from "../../loaders/Loader";
import { useNavigate } from "react-router-dom";

interface StaffMember {
  _id: string;
  title?: string;
  firstName?: string;
  surname?: string;
  otherName?: string;
  gender?: string;
  emailAddress?: string;
  phoneNumber?: string;
  staffType?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  profilePicture?: string;
  employmentDate?: string;
  createdAt?: string;
}

export default function StaffManagement() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // UI state
  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [openMakeAdmin, setOpenMakeAdmin] = useState(false);
  const [openRemoveAdmin, setOpenRemoveAdmin] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [openAddChoice, setOpenAddChoice] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("Active");

  // Fetch all staff
  const { data: staffData, isPending } = useQuery({
    queryKey: ["all-staff"],
    queryFn: async () => {
      const res = await SERVER.get("staff");
      return res?.data;
    },
    retry: false,
  });
  const allStaff: StaffMember[] = staffData?.data || [];

  // Filter logic
  const filteredStaff = allStaff
    .filter((s) => {
      if (filterStatus === "Active") return s.isActive !== false;
      if (filterStatus === "Deactivated") return s.isActive === false;
      return true; // "All"
    })
    .filter((s) => {
      if (filterType === "All") return true;
      return s.staffType === filterType.toLowerCase();
    })
    .filter((s) => {
      if (filterRole === "All") return true;
      if (filterRole === "Admin") return s.isAdmin === true;
      if (filterRole === "Staff") return s.isAdmin !== true;
      return true;
    })
    .filter((s) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const fullName = `${s.firstName || ""} ${s.surname || ""} ${s.otherName || ""}`.toLowerCase();
      return (
        fullName.includes(q) ||
        s.emailAddress?.toLowerCase().includes(q) ||
        s.phoneNumber?.includes(q)
      );
    });

  // Stats (based on ALL staff, not filtered)
  const activeStaff = allStaff.filter((s) => s.isActive !== false);
  const totalStaff = activeStaff.length;
  const academicStaff = activeStaff.filter((s) => s.staffType === "academic").length;
  const nonAcademicStaff = activeStaff.filter((s) => s.staffType === "non-academic").length;
  const adminStaff = activeStaff.filter((s) => s.isAdmin === true).length;
  const deactivatedCount = allStaff.filter((s) => s.isActive === false).length;

  const getFullName = (s: StaffMember | null) => s ? `${s.title ? s.title + " " : ""}${s.firstName || ""} ${s.surname || ""}`.trim() : "";

  // Actions
  const handleDeactivateStaff = async () => {
    if (!selectedStaff) return;
    try {
      const isCurrentlyActive = selectedStaff.isActive !== false;
      const endpoint = isCurrentlyActive
        ? `staff/deactivate/${selectedStaff._id}`
        : `staff/activate/${selectedStaff._id}`;
      await SERVER.put(endpoint);
      toast.success(
        isCurrentlyActive
          ? `${getFullName(selectedStaff)} has been deactivated`
          : `${getFullName(selectedStaff)} has been reactivated`,
        toastOptions
      );
      queryClient.invalidateQueries({ queryKey: ["all-staff"] });
      setOpenDeactivate(false);
      setSelectedStaff(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Action failed", toastOptions);
    }
  };

  const handleMakeAdmin = async () => {
    if (!selectedStaff) return;
    try {
      await SERVER.put(`staff/makeAdmin/${selectedStaff._id}`);
      toast.success(`${getFullName(selectedStaff)} is now an admin`, toastOptions);
      queryClient.invalidateQueries({ queryKey: ["all-staff"] });
      setOpenMakeAdmin(false);
      setSelectedStaff(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed", toastOptions);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!selectedStaff) return;
    try {
      await SERVER.put(`staff/removeAdmin/${selectedStaff._id}`);
      toast.success(`${getFullName(selectedStaff)} is no longer an admin`, toastOptions);
      queryClient.invalidateQueries({ queryKey: ["all-staff"] });
      setOpenRemoveAdmin(false);
      setSelectedStaff(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed", toastOptions);
    }
  };

  // Table rows
  const tableData = filteredStaff.map((staff, i) => {
    const isActive = staff.isActive !== false;
    return {
      sn: i + 1,
      staff: (
        <div className="flex gap-x-3 items-center">
          <Avatar
            sx={{ width: 36, height: 36 }}
            src={staff.profilePicture || ""}
            alt={(staff.firstName || "S")?.[0]}
          />
          <div className="flex flex-col">
            <p className="text-sm font-medium">{getFullName(staff)}</p>
            <p className="text-xs text-gray-500">{staff.emailAddress || "-"}</p>
          </div>
        </div>
      ),
      gender: staff.gender === "male" ? "M" : staff.gender === "female" ? "F" : "-",
      type: (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          staff.staffType === "academic"
            ? "bg-blue-100 text-blue-700"
            : "bg-purple-100 text-purple-700"
        }`}>
          {staff.staffType || "-"}
        </span>
      ),
      role: staff.isAdmin ? (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
          Admin
        </span>
      ) : (
        <span className="text-xs text-gray-500">Staff</span>
      ),
      phone: staff.phoneNumber || "-",
      status: isActive ? (
        <span className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
          Active
        </span>
      ) : (
        <span className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
          Deactivated
        </span>
      ),
      actions: "",
      id: staff._id,
      _raw: staff,
    };
  });

  // Build action menu per row
  const headcells = [
    { key: "sn", name: "S/N" },
    { key: "staff", name: "Staff" },
    { key: "gender", name: "Gender" },
    { key: "type", name: "Type" },
    { key: "role", name: "Role" },
    { key: "phone", name: "Phone" },
    { key: "status", name: "Status" },
    {
      key: "actions",
      name: [
        {
          name: "View Profile",
          handleClick: (row: any) => {
            navigate(`/staff-management/staff-profile/${row._raw._id}`);
          },
        },
        {
          name: "Make Admin",
          handleClick: (row: any) => {
            if (row._raw.isAdmin) {
              toast.error("This staff is already an admin", toastOptions);
              return;
            }
            setSelectedStaff(row._raw);
            setOpenMakeAdmin(true);
          },
        },
        {
          name: "Remove Admin",
          handleClick: (row: any) => {
            if (!row._raw.isAdmin) {
              toast.error("This staff is not an admin", toastOptions);
              return;
            }
            setSelectedStaff(row._raw);
            setOpenRemoveAdmin(true);
          },
        },
        {
          name: "Deactivate / Reactivate",
          handleClick: (row: any) => {
            setSelectedStaff(row._raw);
            setOpenDeactivate(true);
          },
        },
      ],
    },
  ];

  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">Manage all staff members</p>
        <Button
          color="tertiary"
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setOpenAddChoice(true)}
          sx={{
            color: "white", borderRadius: "10px",
            paddingY: "10px", paddingX: "20px", textTransform: "capitalize",
          }}
        >
          Add Staff
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <div className="border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Staff</p>
          <p className="text-2xl font-bold text-black">{totalStaff}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-blue-50">
          <p className="text-xs text-gray-500 mb-1">Academic</p>
          <p className="text-2xl font-bold text-blue-700">{academicStaff}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-purple-50">
          <p className="text-xs text-gray-500 mb-1">Non-Academic</p>
          <p className="text-2xl font-bold text-purple-700">{nonAcademicStaff}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-orange-50">
          <p className="text-xs text-gray-500 mb-1">Admins</p>
          <p className="text-2xl font-bold text-orange-700">{adminStaff}</p>
        </div>
        {deactivatedCount > 0 && (
          <div className="border border-red-200 rounded-xl p-4 bg-red-50">
            <p className="text-xs text-gray-500 mb-1">Deactivated</p>
            <p className="text-2xl font-bold text-red-700">{deactivatedCount}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      {allStaff.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-[400px]">
            <Search fontSize="small" className="text-gray-400 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="flex-1 outline-none text-sm"
            />
          </div>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType} label="Type"
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Academic">Academic</MenuItem>
              <MenuItem value="Non-academic">Non-Academic</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filterRole} label="Role"
              onChange={(e) => setFilterRole(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus} label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Deactivated">Deactivated</MenuItem>
              <MenuItem value="All">All</MenuItem>
            </Select>
          </FormControl>
        </div>
      )}

      {/* Table or empty state */}
      {allStaff.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] border border-gray-100 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-500">No staff members added yet</p>
            <Button
              color="tertiary" variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setOpenAddChoice(true)}
              sx={{ color: "white", borderRadius: "10px", textTransform: "capitalize", paddingY: "8px", paddingX: "20px" }}
            >
              Add Staff
            </Button>
          </div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] border border-gray-100 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-500">No staff match your filters</p>
            <Button
              variant="outlined" color="tertiary"
              onClick={() => {
                setSearchTerm(""); setFilterType("All");
                setFilterRole("All"); setFilterStatus("Active");
              }}
              sx={{ borderRadius: "10px", textTransform: "capitalize", paddingY: "8px", paddingX: "20px" }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      ) : (
        <TableComponent
          headcells={headcells}
          tableData={tableData}
          message="No staff match your filters"
        />
      )}

      {/* ==================== ADD STAFF CHOICE MODAL ==================== */}
      <Modal
        openModal={openAddChoice}
        closeModal={() => setOpenAddChoice(false)}
        title="Add Staff"
        maxWidth="400px"
      >
        <div className="flex flex-col gap-y-3">
          <p
            className="hover:bg-bg-1 cursor-pointer p-4 border border-gray-200 rounded-lg text-sm"
            onClick={() => {
              setOpenAddChoice(false);
              navigate("/staff-management/add-staff");
            }}
          >
            Individual upload — Add one staff member
          </p>
          <p className="text-xs text-gray-400 text-center">
            Bulk upload coming soon
          </p>
        </div>
      </Modal>

      {/* ==================== DEACTIVATE / REACTIVATE CONFIRMATION ==================== */}
      <MessageModal
        column
        desc={
          selectedStaff?.isActive !== false
            ? `This will deactivate ${getFullName(selectedStaff!)}. They will lose access to the system but their data will be preserved.`
            : `This will reactivate ${getFullName(selectedStaff!)}. They will regain access to the system.`
        }
        openModal={openDeactivate}
        closeModal={() => { setOpenDeactivate(false); setSelectedStaff(null); }}
        handleClick={handleDeactivateStaff}
        btn1Name={selectedStaff?.isActive !== false ? "Yes, deactivate" : "Yes, reactivate"}
        btn2Name="Cancel"
      />

      {/* ==================== MAKE ADMIN CONFIRMATION ==================== */}
      <MessageModal
        column
        desc={`This will give ${getFullName(selectedStaff!)} admin privileges. They will be able to manage students, fees, and other school data.`}
        openModal={openMakeAdmin}
        closeModal={() => { setOpenMakeAdmin(false); setSelectedStaff(null); }}
        handleClick={handleMakeAdmin}
        btn1Name="Yes, make admin"
        btn2Name="Cancel"
      />

      {/* ==================== REMOVE ADMIN CONFIRMATION ==================== */}
      <MessageModal
        column
        desc={`This will remove admin privileges from ${getFullName(selectedStaff!)}. They will only have standard staff access.`}
        openModal={openRemoveAdmin}
        closeModal={() => { setOpenRemoveAdmin(false); setSelectedStaff(null); }}
        handleClick={handleRemoveAdmin}
        btn1Name="Yes, remove admin"
        btn2Name="Cancel"
      />
    </div>
  );
}