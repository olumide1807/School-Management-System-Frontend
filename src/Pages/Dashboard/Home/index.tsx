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
import { useGetAccountDetails, useGetAnnoucement, useSessionTerm } from "../../../services/api-call";
import { useNavigate } from "react-router-dom";
import Button1 from "./Button";
import MessageModal from "../../../Components/Modals/MessageModal";
import { deleteAcctDetails, getSchDetails } from '../../../redux/slice/schoolDetail';
import { CircularProgress } from "@mui/material";
import SERVER from "../../../Utils/server";
import { useQuery } from "@tanstack/react-query";




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