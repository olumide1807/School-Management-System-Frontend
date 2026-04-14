import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { StatCard } from "../../../Components";
import { AdminIcon, ParentsIcon, StaffIcon, StudentsIcon, } from "../../../Components/Vectors";
import DetailsCard, { AnnouncementDetails,} from "../../../Components/DetailsCard";
import AllAnnouncement, { OneAnnouncement } from "./Modals/AnnouncementModal";
import { setSlide } from "../../../redux/slice/academicSlides";
import CreateOrEditAnnouncement from "./Modals/CreateEditAnnouncement";
import SchoolAccModal from "./Modals/SchoolAccModal";
import { useDispatch, useSelector } from "react-redux";
import { useGetAccountDetails, useGetAnnoucement, useSessionTerm, useClassArms, useClassLevels } from "../../../services/api-call";
import { useNavigate } from "react-router-dom";
import Button1 from "./Button";
import MessageModal from "../../../Components/Modals/MessageModal";
import { deleteAcctDetails, getSchDetails } from '../../../redux/slice/schoolDetail';
import { CircularProgress } from "@mui/material";
import SERVER from "../../../Utils/server";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";



const AdminDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [openModal1, setOpenModal1] = useState(false);
  const [openAllAnnouncementModal, setOpenAllAnnouncementModal] = useState(false);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openSchAcctModal, setOpenSchAcctModal] = useState(false);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [acctDetails, setAcctDetails] = useState(null);

  const [deleteDetails, setDeleteDetails] = useState(false);
  const [editDetails, setEditDetails] = useState(null);

  const handleViewSingle = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpenModal1(true);
  };



  const account = useGetAccountDetails();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const session = useSessionTerm()

  useEffect(() => {
    if(account?.data){
      setAcctDetails(account?.data?.data?.data);
    }
  }, [account.data])
  
  const sessionName = session?.data?.data?.data?.session?.sessionName;
  const currTerm = session?.data?.data?.data?.term?.termName;
  const sessionStatus = session?.data?.data?.data?.status;
  const holidayType = session?.data?.data?.data?.holidayType;
  const nextTerm = session?.data?.data?.data?.nextTerm;
  const nextSession = session?.data?.data?.data?.nextSession;
  
  const { data: announcementData } = useGetAnnoucement();
  const announcements = announcementData?.data?.data;

  // Fetch real counts for dashboard stats
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
  const { data: staffData } = useQuery({
    queryKey: ['all-staff'],
    queryFn: async () => { const res = await SERVER.get('staff'); return res?.data; },
    retry: false,
  });

  const allStudents = studentsData?.data || [];
  const allParents = parentsData?.data || [];
  const allStaff = staffData?.data || [];
 
  const linkedStudents = allStudents.filter((s: any) => s.guardians?.length > 0);
  const unlinkedStudents = allStudents.filter((s: any) => !s.guardians || s.guardians.length === 0);
  const linkedParents = allParents.filter((p: any) => p.isLinked === true);
  const unlinkedParents = allParents.filter((p: any) => !p.isLinked);
  const academicStaff = allStaff.filter((s: any) => s.role === 'academic' || s.staffType === 'academic');
  const nonAcademicStaff = allStaff.filter((s: any) => s.role !== 'academic' && s.staffType !== 'academic');
 
  // ===== PENDING PAYMENTS WIDGET =====
  const allArms = useClassArms();
  const allLevels = useClassLevels();
  const classArms = allArms?.data?.data?.data || [];
  const classLevels = allLevels?.data?.data?.data || [];
 
  // Get current session ID (from the session we already fetched)
  const activeSessionForFees = session?.data?.data?.data?.session;
  const activeTermForFees = session?.data?.data?.data?.term;
 
  // Fetch all terms in current session
  const { data: allTermsData } = useQuery({
    queryKey: ['session-terms', activeSessionForFees?._id],
    queryFn: async () => {
      const res = await SERVER.get(`session/term/${activeSessionForFees._id}`);
      return res?.data?.data || [];
    },
    enabled: !!activeSessionForFees?._id,
    retry: false,
  });
  const allTerms = allTermsData || [];
 
  // Determine the "reference term" for pending payments
  const referenceTerm = (() => {
    if (activeTermForFees?._id) return activeTermForFees;
    const now = new Date();
    const parseDate = (d: any) => d ? new Date(d) : null;
    const endOfDay = (d: Date) => { const e = new Date(d); e.setHours(23, 59, 59, 999); return e; };
    const startOfDay = (d: Date) => { const s = new Date(d); s.setHours(0, 0, 0, 0); return s; };
 
    const current = allTerms.find((t: any) => {
      const s = parseDate(t.termStartDate);
      const e = parseDate(t.termEndDate);
      return s && e && startOfDay(s) <= now && now <= endOfDay(e);
    });
    if (current) return current;
 
    const upcoming = [...allTerms]
      .filter((t: any) => t.termStartDate && new Date(t.termStartDate) > now)
      .sort((a: any, b: any) =>
        new Date(a.termStartDate).getTime() - new Date(b.termStartDate).getTime()
      );
    if (upcoming.length > 0) return upcoming[0];
 
    const completed = [...allTerms]
      .filter((t: any) => t.termEndDate && endOfDay(new Date(t.termEndDate)) < now)
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
 
  // Fetch payments for all fees in the reference term
  const feesInRefTerm = referenceTerm
    ? allFees.filter((f: any) => f.termId === referenceTerm._id)
    : [];
 
  const { data: allPaymentsData } = useQuery({
    queryKey: ['pending-payments-data', referenceTerm?._id, feesInRefTerm.length],
    queryFn: async () => {
      if (feesInRefTerm.length === 0) return [];
      const results = await Promise.all(
        feesInRefTerm.map((fee: any) =>
          SERVER.get(`payment/fee/${fee._id}`).then(r => r?.data?.data || []).catch(() => [])
        )
      );
      return results.flat();
    },
    enabled: !!referenceTerm?._id && feesInRefTerm.length > 0,
    retry: false,
  });
  const refTermPayments = allPaymentsData || [];
 
  // Compute pending payments per student
  const pendingStudents = allStudents.filter((student: any) => {
    const fee = feesInRefTerm.find((f: any) => f.classArmId === student.classArmId);
    if (!fee) return false; // No fee set = not considered pending
    const totalOwed = fee.fees?.reduce(
      (s: number, f: any) => s + (parseFloat(f.amount) || 0), 0
    ) || 0;
    const paid = refTermPayments
      .filter((p: any) => p.studentId === student._id && p.feeId === fee._id)
      .reduce((s: number, p: any) => s + (p.amount || 0), 0);
    return paid < totalOwed; // Unpaid or partial
  });
 
  // Group pending students by class arm label
  const pendingByClass: Record<string, number> = {};
  pendingStudents.forEach((s: any) => {
    const arm = classArms.find((a: any) => a._id === s.classArmId);
    const level = arm ? classLevels.find((l: any) => l._id === arm.classLevelId) : null;
    const label = arm ? `${level?.levelShortName || ''} ${arm.armName?.toUpperCase() || ''}`.trim() : 'Unknown';
    pendingByClass[label] = (pendingByClass[label] || 0) + 1;
  });
  const topClasses = Object.entries(pendingByClass)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
 
  const totalStudentsWithFees = allStudents.filter((s: any) =>
    feesInRefTerm.some((f: any) => f.classArmId === s.classArmId)
  ).length;

  const dashboardStats = [
    {
      icon: <AdminIcon />,
      value: "1",
      desc: "Total number of admins",
      bg: "",
      items: [],
    },
    {
      icon: <StaffIcon />,
      value: String(allStaff.length),
      desc: "Total number of staffs",
      bg: "bg-[#E9FAFF]",
      items: [
        { value: String(academicStaff.length), desc: "Academic Staff" },
        { value: String(nonAcademicStaff.length), desc: "Non Academic Staff" },
      ],
    },
    {
      icon: <ParentsIcon />,
      value: String(allParents.length),
      desc: "Total number of parents/guardians",
      bg: "bg-[#E9E9FF]",
      items: [
        { value: String(linkedParents.length), desc: "Linked parent/guardian" },
        { value: String(unlinkedParents.length), desc: "Non-Linked parent/guardian" },
      ],
    },
    {
      icon: <StudentsIcon />,
      value: String(allStudents.length),
      desc: "Total number of students",
      bg: "bg-[#E9FFF4]",
      items: [
        { value: String(linkedStudents.length), desc: "Linked Student" },
        { value: String(unlinkedStudents.length), desc: "Non-Linked Student" },
      ],
    },
  ];

  const { status, details, error } = useSelector((state) => state.schoolDetails);

  useEffect(() => {
    dispatch(getSchDetails())
  }, [dispatch])


  const deleteSchoolDetails = async () => {
      dispatch(deleteAcctDetails(details));
  }

  const EditAcctDetails = () => {
    setEditDetails(acctDetails);
    setOpenSchAcctModal(true);
  }



  return (
    <>
      <div className="flex flex-col gap-y-16">
        <div className="flex md:flex-row flex-col justify-between md:p-9 p-2  md:bg-bg-1 rounded-[10px]">
          <div className="flex my-2 gap-x-12 bg-bg-1 w-full md:w-fit md:p-0 p-3 rounded-[10px]">
            <p className="text-xl text-black m-3 md:m-0 font-bold sm:font-normal">
              Session:
            </p>
            <div className="flex flex-col gap-y-2.5 md:mt-0 mt-3">
              { sessionStatus === "active" ? (
                <div className="flex flex-col">
                  <p className="text-xl text-black">{sessionName}</p>
                  <strong className="text-xl text-black">{currTerm}</strong>
                </div>
              ) : sessionStatus === "holiday" && holidayType === "between_terms" ? (
                <div className="flex flex-col">
                  <p className="text-xl text-black">{sessionName}</p>
                  <div className="flex items-center gap-x-2">
                    <span className="bg-yellow-400 text-black text-sm font-semibold px-3 py-1 rounded-full">Holiday</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Next: {nextTerm?.termName} starts {nextTerm?.startDate ? new Date(nextTerm.startDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              ) : sessionStatus === "holiday" && holidayType === "between_sessions" ? (
                <div className="flex flex-col">
                  <p className="text-lg text-black">{sessionName} (Completed)</p>
                  <div className="flex items-center gap-x-2">
                    <span className="bg-yellow-400 text-black text-sm font-semibold px-3 py-1 rounded-full">Holiday</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Next: {nextSession?.sessionName} starts {nextSession?.term1StartDate ? new Date(nextSession.term1StartDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              ) : sessionStatus === "holiday" && holidayType === "no_next_session" ? (
                <div className="flex flex-col">
                  <p className="text-lg text-black">{sessionName} (Completed)</p>
                  <div className="flex items-center gap-x-2">
                    <span className="bg-yellow-400 text-black text-sm font-semibold px-3 py-1 rounded-full">Holiday</span>
                  </div>
                  <p className="text-sm text-red-500 mt-1">No upcoming session set</p>
                </div>
              ) : sessionStatus === "holiday" && holidayType === "awaiting_session" ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-2">
                    <span className="bg-yellow-400 text-black text-sm font-semibold px-3 py-1 rounded-full">Holiday</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Next: {nextSession?.sessionName} starts {nextSession?.term1StartDate ? new Date(nextSession.term1StartDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-black">No session set</p>
              )}

              {sessionStatus === "holiday" && holidayType === "no_next_session" ? (
                <Button
                  color="tertiary"
                  variant="contained"
                  sx={{
                    color: "white",
                    borderRadius: "10px",
                    textTransform: "capitalize",
                  }}
                  onClick={() => {
                    dispatch(setSlide(3));
                    navigate("/school-management/academics");
                  }}
                >
                  Create Next Session
                </Button>
              ) : (
                <Button
                  color="tertiary"
                  variant="contained"
                  sx={{
                    color: "white",
                    borderRadius: "10px",
                    textTransform: "capitalize",
                  }}
                  onClick={() => {
                    dispatch(setSlide(3));
                    navigate("/school-management/academics");
                  }}
                >
                  {sessionName || sessionStatus === "holiday" ? "View Session" : "Create Session"}
                </Button>
              )}
            </div>
          </div>
          <div className="flex my-2 gap-x-12 bg-bg-1 w-full md:w-fit md:p-0 p-3 rounded-[10px]">
            <p className="text-[14px] text-black m-3 md:m-0 font-bold sm:font-normal">
              School Details
            </p>
            <div className="flex flex-col gap-y-2.5 md:mt-0 mt-3">
              { status === 'pending' ?

                  <CircularProgress color="primary" style={{display: 'flex', margin: 'auto'}}/>:
                   
                   details?.data?.bankName ? (
                <div className="flex flex-col">
                  <strong className="text-[14px] text-black">
                    { details?.data?.accountNumber}
                  </strong>
                  <p className="text-[14px] text-black">
                    { details?.data?.accountName}
                  </p>
                  <p className="text-[14px] text-black">
                    { details?.data?.bankName}
                  </p>
                  <p className="text-[14px] text-black">
                    { details?.data?.phoneNumber}
                  </p>
                </div>
              ) : (
                <p className="text-[14px] text-black">No school detail set</p>
              )}


              {!details?.data?.bankName ?
                <Button1
                text='Add'
                onClick={() => setOpenSchAcctModal(true)}
                />:

              <div className="flex items-center gap-2">
                <Button1
                text='Edit'
                onClick={EditAcctDetails}
                />

                <Button
                  variant="outlined"
                  sx={{
                    backgroundColor: '#fff',
                    color: "#0E7094",
                    borderRadius: "5px",
                    textTransform: "capitalize",
                    paddingY: '5px',
                    paddingX: '1px'
                  }}
                  onClick={() => setDeleteDetails(true)}
                >
                  Delete
                </Button>
              </div>}
              
            </div>
          </div>
        </div>
        <div className="flex justify-between overflow-x-auto w-full horizontal-scroll">
          {dashboardStats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
 
        {/* Pending Payments Widget */}
        {referenceTerm && feesInRefTerm.length > 0 && (
          <div className="bg-white border border-[#D1D1D1] rounded-[10px] p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-black">Pending Fee Payments</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {referenceTerm.termName} · {activeSessionForFees?.sessionName}
                </p>
              </div>
              <Link
                to="/school-management/fee-management"
                className="text-sm text-[#0E7094] hover:underline self-start md:self-auto"
              >
                View Fee Management →
              </Link>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs text-gray-600 mb-1">Students with outstanding fees</p>
                <p className="text-3xl font-bold text-red-700">{pendingStudents.length}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs text-gray-600 mb-1">Fully paid</p>
                <p className="text-3xl font-bold text-green-700">
                  {Math.max(0, totalStudentsWithFees - pendingStudents.length)}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-gray-600 mb-1">Total students with fees set</p>
                <p className="text-3xl font-bold text-blue-700">{totalStudentsWithFees}</p>
              </div>
            </div>
 
            {topClasses.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Classes with most unpaid students:
                </p>
                <div className="flex flex-col gap-2">
                  {topClasses.map(([label, count]) => (
                    <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                      <span className="text-sm font-medium text-black">{label}</span>
                      <span className="text-sm font-semibold text-red-600">
                        {count} {count === 1 ? 'student' : 'students'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : pendingStudents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-medium">🎉 All students with fees are fully paid!</p>
              </div>
            ) : null}
          </div>
        )}
        <div className="md:flex gap-x-[72px] justify-between block">
          <DetailsCard
            breakdown={[
              ...useSelector((state) => state.feeBreakDown.all.slice(0, 2)),
            ]}
          />{" "}
          <AnnouncementDetails
            handleCreate={() => setOpenCreateModal(true)}
            announcement={announcements}
            handleViewAll={() => {
              setOpenAllAnnouncementModal(true);
            }}
            handleViewSingle={handleViewSingle}
          />
        </div>
      </div>
      <AllAnnouncement
        openModal={openAllAnnouncementModal}
        closeModal={() => setOpenAllAnnouncementModal(false)}
      />

      <OneAnnouncement
        open={openModal1}
        announcement={selectedAnnouncement}
        close={() => setOpenModal1(false)}
      />

      <CreateOrEditAnnouncement
        openModal={openCreateModal}
        closeModal={() => setOpenCreateModal(false)}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
      <SchoolAccModal
        openModal={openSchAcctModal}
        closeModal={() => setOpenSchAcctModal(false)}
        editDetails={editDetails}
      />
     
      <ConfirmDeleteAnnouncement
        openDelete={deleteDetails}
        cancelDelete={() => setDeleteDetails(false)}
        deleteAction={deleteSchoolDetails}
      />
    </>
  );
};



const stats = [
  {
    icon: <AdminIcon />,
    value: "0",
    desc: "Total number of admins",
    bg: "",
    items: [],
  },
  {
    icon: <StaffIcon />,
    value: "0",
    desc: "Total number of staffs",
    bg: "bg-[#E9FAFF]",
    items: [
      {
        value: "0",
        desc: "Academic Staff",
      },
      {
        value: "0",
        desc: "Non Academic Staff",
      },
    ],
  },
  {
    icon: <ParentsIcon />,
    value: "0",
    desc: "Total number of parents/guardians",
    bg: "bg-[#E9E9FF]",
    items: [
      {
        value: "0",
        desc: "Linked parent/guardian",
      },
      {
        value: "0",
        desc: "Non-Linked parent/guardian",
      },
    ],
  },
  {
    icon: <StudentsIcon />,
    value: "0",
    desc: "Total number of students",
    bg: "bg-[#E9FFF4]",
    items: [
      {
        value: "0",
        desc: "Linked Student",
      },
      {
        value: "0",
        desc: "Non-Linked Student",
      },
    ],
  },
];

function ConfirmDeleteAnnouncement({ openDelete, cancelDelete, deleteAction }) {

  return (
    <MessageModal
      column
      desc="Are you sure you want to delete school details?"
      openModal={openDelete}
      closeModal={cancelDelete}
      handleClick={deleteAction}
    />
  );
}

export default AdminDashboard;