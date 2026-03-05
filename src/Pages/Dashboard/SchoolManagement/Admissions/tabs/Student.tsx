import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import moment from "moment";

import { DashboardCard2 } from "../../../../../Components/DashboardCard";
import FilterComponent from "../../../../../Components/FilterComponent";
import SearchInput from "../../../../../Components/Forms/SearchInput";
import TableComponent from "../../../../../Components/Tables";
import LinkGuardianModal from "../Modals/LinkGuardianModal";
import AddStudentParentChoiceModal from "../Modals/AddStudentParentChoiceModal";
import BulkUploadModal from "../Modals/BulkUploadModal";
import ManualUploadModal from "../Modals/ManualUploadModal";
import DeleteStudentModal, {
  DeactivateStudentModal,
} from "../Modals/DeleteDeactivateStudentModal";
import EditStudentProfile from "../Modals/EditStudentProfile";

export default function Student() {
  const [choiceStatus, setChoiceStatus] = useState("Select status");
  const [choiceDownload, setChoiceDownload] = useState("Download");
  const [choiceAdd, setChoiceAdd] = useState("Add student");
  const [openAddStudentModal, setOpenAddStudentModal] = useState(false);
  const [openDeleteStudentModal, setOpenDeleteStudentModal] = useState(false);
  const [openDeactivateStudentModal, setOpenDeactivateStudentModal] =
    useState(false);
  const [openLinkGuardianModal, setOpenLinkGuardianModal] = useState(false);
  const [openBulkUploadModal, setOpenBulkUploadModal] = useState(false);
  const [openManualUploadModal, setOpenManualUploadModal] = useState(false);
  const [openEditStudentProfile, setOpenEditStudentProfile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const tableData = Array(6)
    .fill("")
    .map((_, i) => ({
      student: (
        <div className="flex gap-x-3">
          <Avatar sx={{ width: 42, height: 42 }} src="" alt="A" />
          <div className="flex flex-col gap-y-2.5">
            <p>Peter Adejare</p>
            <p>BAS/9301</p>
          </div>
        </div>
      ),
      gender: "M",
      level: "SSS1",
      guardian: "Mr. Peter Adejare",
      date: moment(new Date()).format("MMM DD, YYYY"),
      status: (
        <div className="bg-bg-active text-text-active p-2 capitalize text-center">
          active
        </div>
      ),
      actions: [
        {
          name: "View profile",
          handleClick: () =>
            navigate("?profile=student", {
              state: { from: `${location.pathname}` },
            }),
        },
        {
          name: "Edit profile",
          handleClick: () => setOpenEditStudentProfile(true),
        },
        {
          name: "Link parent/guardian",
          handleClick: () => setOpenLinkGuardianModal(true),
        },
        {
          name: "Delete student",
          handleClick: () => setOpenDeleteStudentModal(true),
        },
      ],
      id: `row_${i}`,
    }));

  const menuOptionsAdd = [
    {
      label: "Bulk upload student",
      value: "Bulk upload student",
      handleClick: () => setOpenBulkUploadModal(true),
    },
    {
      label: "Manual upload student",
      value: "Manual upload student",
      handleClick: () => setOpenManualUploadModal(true),
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-y-2 flex-wrap mb-11">
        <DashboardCard2
          bgColor="bg-bg-4"
          label="Total Students"
          val1="0"
          val2="0"
          val3="0"
        />
        <DashboardCard2
          bgColor="bg-bg-5"
          label="Active Students"
          val1="0"
          val2="0"
          val3="0"
        />
        <DashboardCard2
          bgColor="bg-bg-6"
          label="Deactivated Students"
          val1="0"
          val2="0"
          val3="0"
        />
      </div>
      <div className="flex items-center justify-between mb-[52px]">
        <div className="flex items-center gap-x-9">
          <SearchInput
            placeholder="Search by student, parent"
            otherClass="border border-[#ABABAB] rounded-[5px] px-4 max-w-[251px]"
          />
          <FilterComponent
            menuOptions={menuOptionsStatus}
            choice={choiceStatus}
            setChoice={setChoiceStatus}
            otherClasses2="px-4 py-4"
            textColor="text-black"
          />
        </div>
        <div className="flex items-center gap-x-3">
          <FilterComponent
            menuOptions={menuOptionsDownload}
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
      <div>
        <TableComponent
          headcells={headcells}
          handleClick2={() => setOpenAddStudentModal(true)}
          tableData={tableData}
          btn2Name="Add student"
          message="You have no student list"
        />
      </div>
      {/* Modals */}
      <DeleteStudentModal
        openModal={openDeleteStudentModal}
        closeModal={() => setOpenDeleteStudentModal(false)}
      />
      <DeactivateStudentModal
        openModal={openDeactivateStudentModal}
        closeModal={() => setOpenDeactivateStudentModal(false)}
      />
      <LinkGuardianModal
        openModal={openLinkGuardianModal}
        closeModal={() => setOpenLinkGuardianModal(false)}
      />
      <AddStudentParentChoiceModal
        type="student"
        openModal={openAddStudentModal}
        closeModal={() => setOpenAddStudentModal(false)}
        handleOpenBulkUploadModal={() => setOpenBulkUploadModal(true)}
      />
      <BulkUploadModal
        openModal={openBulkUploadModal}
        closeModal={() => setOpenBulkUploadModal(false)}
      />
      <ManualUploadModal
        openModal={openManualUploadModal}
        closeModal={() => setOpenManualUploadModal(false)}
      />
      <EditStudentProfile
        openModal={openEditStudentProfile}
        closeModal={() => setOpenEditStudentProfile(false)}
      />
    </div>
  );
}

const menuOptionsStatus = [
  {
    label: "All students",
    value: "All students",
  },
  {
    label: "Active students",
    value: "Active students",
  },
  {
    label: "Deactivated students",
    value: "Deactivated students",
  },
];

export const menuOptionsDownload = [
  {
    label: "PDF Format",
    value: "PDF Format",
  },
  {
    label: "Excel Format",
    value: "Excel Format",
  },
];

const headcells = [
  {
    key: "student",
    name: "Student",
  },
  {
    key: "gender",
    name: "Gender",
  },
  {
    key: "level",
    name: "Class level",
  },
  {
    key: "guardian",
    name: "Parent/Guardian",
  },
  {
    key: "date",
    name: "Date created",
  },
  {
    key: "status",
    name: "Status",
  },
  {
    key: "actions",
    name: "",
  },
];
